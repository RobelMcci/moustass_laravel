<?php

namespace App\Http\Controllers;

use App\Services\BackupService;

class AdminBackupController extends Controller
{
    public function __construct(private readonly BackupService $backupService)
    {
    }

    public function incremental()
    {
        $result = $this->backupService->incrementalBackup();
        return response()->json($result['data'], $result['status']);
    }

    public function restore()
    {
        $result = $this->backupService->restoreLatest();
        return response()->json($result['data'], $result['status']);
    }

    public function history()
    {
        $result = $this->backupService->history();
        return response()->json($result['data'], $result['status']);
    }
}
