<?php

namespace App\Http\Controllers;

use App\Services\UserService;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService)
    {
    }

    public function index()
    {
        $result = $this->userService->listActiveUsers();
        return response()->json($result['data'], $result['status']);
    }
}
