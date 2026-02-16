<?php

namespace App\Services;

use App\Repositories\BackupLogRepository;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class BackupService
{
    public function __construct(private readonly BackupLogRepository $logs)
    {
    }

    public function incrementalBackup(): array
    {
        $full = $this->logs->lastFull();
        if (!$full) {
            $fullResult = $this->fullBackup();
            if ($fullResult['status'] !== 201) {
                return $fullResult;
            }
            $full = $this->logs->lastFull();
        }

        $master = $this->getMasterStatus();
        if (!$master) {
            return $this->logFailure('incremental', 'Cannot read master status.');
        }

        $last = $this->logs->lastSuccessful();
        $lastState = $this->parseNotes($last?->notes);
        $startPosition = $lastState['end_position'] ?? null;
        $binlogFile = $lastState['binlog_file'] ?? $master['File'] ?? null;

        if (!$startPosition || !$binlogFile) {
            return $this->logFailure('incremental', 'Missing binlog position for incremental backup.');
        }

        if (($master['File'] ?? null) !== $binlogFile) {
            return $this->logFailure('incremental', 'Binlog file rotation detected.');
        }

        $stopPosition = (int) ($master['Position'] ?? 0);
        if ($stopPosition <= $startPosition) {
            return $this->logFailure('incremental', 'No new changes to backup.');
        }

        $backupDir = storage_path('app/backups');
        File::ensureDirectoryExists($backupDir);
        $timestamp = now()->format('Ymd_His');
        $filePath = $backupDir . "/incremental_{$timestamp}.sql";

        $config = $this->getMysqlConfig();
        $command = [
            'mysqlbinlog',
            '--read-from-remote-server',
            '--host=' . $config['host'],
            '--port=' . $config['port'],
            '--user=' . $config['username'],
            '--start-position=' . $startPosition,
            '--stop-position=' . $stopPosition,
            '--result-file=' . $filePath,
            $binlogFile,
        ];

        $process = new Process($command, null, ['MYSQL_PWD' => $config['password']]);
        $process->run();

        if (!$process->isSuccessful()) {
            return $this->logFailure('incremental', 'Incremental backup failed.');
        }

        $notes = json_encode([
            'binlog_file' => $binlogFile,
            'start_position' => $startPosition,
            'end_position' => $stopPosition,
        ]);

        $this->logs->create([
            'type' => 'incremental',
            'file_path' => $filePath,
            'status' => 'success',
            'notes' => $notes,
        ]);

        return $this->successResponse(201, [
            'file_path' => $filePath,
            'type' => 'incremental',
        ]);
    }

    public function fullBackup(): array
    {
        $backupDir = storage_path('app/backups');
        File::ensureDirectoryExists($backupDir);
        $timestamp = now()->format('Ymd_His');
        $filePath = $backupDir . "/full_{$timestamp}.sql";

        $config = $this->getMysqlConfig();
        $command = [
            'mysqldump',
            '--host=' . $config['host'],
            '--port=' . $config['port'],
            '--user=' . $config['username'],
            '--single-transaction',
            '--routines',
            '--events',
            '--triggers',
            '--result-file=' . $filePath,
            $config['database'],
        ];

        $process = new Process($command, null, ['MYSQL_PWD' => $config['password']]);
        $process->run();

        if (!$process->isSuccessful()) {
            return $this->logFailure('full', 'Full backup failed.');
        }

        $master = $this->getMasterStatus();
        $notes = $master ? json_encode([
            'binlog_file' => $master['File'] ?? null,
            'end_position' => $master['Position'] ?? null,
        ]) : null;

        $this->logs->create([
            'type' => 'full',
            'file_path' => $filePath,
            'status' => 'success',
            'notes' => $notes,
        ]);

        return $this->successResponse(201, [
            'file_path' => $filePath,
            'type' => 'full',
        ]);
    }

    public function restoreLatest(): array
    {
        $full = $this->logs->lastFull();
        if (!$full) {
            return $this->logFailure('full', 'No full backup available for restore.');
        }

        $restoreResult = $this->importSql($full->file_path);
        if (!$restoreResult) {
            return $this->logFailure('full', 'Full restore failed.');
        }

        $incrementals = $this->logs->listAfterFull($full)
            ->where('type', 'incremental');

        foreach ($incrementals as $incremental) {
            if (!$this->importSql($incremental->file_path)) {
                return $this->logFailure('incremental', 'Incremental restore failed.');
            }
        }

        $this->logs->create([
            'type' => 'full',
            'file_path' => $full->file_path,
            'status' => 'success',
            'notes' => 'restore',
        ]);

        return $this->successResponse(200, [
            'message' => 'Restore completed.',
        ]);
    }

    public function history(): array
    {
        return $this->successResponse(200, [
            'history' => $this->logs->history(),
        ]);
    }

    private function importSql(string $filePath): bool
    {
        if (!File::exists($filePath)) {
            return false;
        }

        $config = $this->getMysqlConfig();
        $command = [
            'mysql',
            '--host=' . $config['host'],
            '--port=' . $config['port'],
            '--user=' . $config['username'],
            $config['database'],
        ];

        $process = new Process($command, null, ['MYSQL_PWD' => $config['password']]);
        $stream = fopen($filePath, 'r');
        if ($stream === false) {
            return false;
        }

        $process->setInput($stream);
        $process->run();

        fclose($stream);

        return $process->isSuccessful();
    }

    private function getMasterStatus(): ?array
    {
        $config = $this->getMysqlConfig();
        $command = [
            'mysql',
            '--host=' . $config['host'],
            '--port=' . $config['port'],
            '--user=' . $config['username'],
            '--batch',
            '--skip-column-names',
            '-e',
            'SHOW MASTER STATUS',
        ];

        $process = new Process($command, null, ['MYSQL_PWD' => $config['password']]);
        $process->run();

        if (!$process->isSuccessful()) {
            return null;
        }

        $output = trim($process->getOutput());
        if ($output === '') {
            return null;
        }

        $parts = preg_split('/\s+/', $output);
        if (!$parts || count($parts) < 2) {
            return null;
        }

        return [
            'File' => $parts[0],
            'Position' => (int) $parts[1],
        ];
    }

    private function getMysqlConfig(): array
    {
        $config = config('database.connections.mysql');

        return [
            'host' => $config['host'] ?? '127.0.0.1',
            'port' => $config['port'] ?? 3306,
            'database' => $config['database'] ?? '',
            'username' => $config['username'] ?? '',
            'password' => $config['password'] ?? '',
        ];
    }

    private function parseNotes(?string $notes): array
    {
        if (!$notes) {
            return [];
        }

        $decoded = json_decode($notes, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function logFailure(string $type, string $message): array
    {
        $this->logs->create([
            'type' => $type,
            'file_path' => '',
            'status' => 'failed',
            'notes' => $message,
        ]);

        return $this->errorResponse(500, ['message' => $message]);
    }

    private function successResponse(int $status, array $data): array
    {
        return ['status' => $status, 'data' => $data];
    }

    private function errorResponse(int $status, array $data): array
    {
        return ['status' => $status, 'data' => $data];
    }
}
