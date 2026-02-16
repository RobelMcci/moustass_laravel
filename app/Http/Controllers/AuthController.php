<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function register(Request $request)
    {
        $result = $this->authService->register($request->all());
        return response()->json($result['data'], $result['status']);
    }

    public function login(Request $request)
    {
        $result = $this->authService->login($request->all());
        return response()->json($result['data'], $result['status']);
    }

    public function me(Request $request)
    {
        $userId = (int) $request->attributes->get('auth_user_id');
        $result = $this->authService->me($userId);
        return response()->json($result['data'], $result['status']);
    }
}
