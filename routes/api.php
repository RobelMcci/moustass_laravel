<?php

use App\Http\Controllers\AdminBackupController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/me', [AuthController::class, 'me'])->middleware('jwt');
});

Route::get('/users', [UserController::class, 'index'])->middleware('jwt');

Route::prefix('admin')->middleware(['jwt', 'role:ADMIN'])->group(function () {
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    Route::post('/backups/incremental', [AdminBackupController::class, 'incremental']);
    Route::post('/backups/restore', [AdminBackupController::class, 'restore']);
    Route::get('/backups/history', [AdminBackupController::class, 'history']);
});
