<?php

namespace App\Repositories;

use App\Models\BackupLog;
use Illuminate\Database\Eloquent\Collection;

class BackupLogRepository
{
    public function create(array $data): BackupLog
    {
        return BackupLog::create($data);
    }

    public function lastFull(): ?BackupLog
    {
        return BackupLog::where('type', 'full')
            ->where('status', 'success')
            ->orderByDesc('created_at')
            ->first();
    }

    public function lastSuccessful(): ?BackupLog
    {
        return BackupLog::where('status', 'success')
            ->orderByDesc('created_at')
            ->first();
    }

    public function listAfterFull(BackupLog $full): Collection
    {
        return BackupLog::where('status', 'success')
            ->where('created_at', '>', $full->created_at)
            ->orderBy('created_at')
            ->get();
    }

    public function history(): Collection
    {
        return BackupLog::orderByDesc('created_at')->get();
    }
}
