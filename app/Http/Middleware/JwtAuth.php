<?php

namespace App\Http\Middleware;

use App\Repositories\UserRepository;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;

class JwtAuth
{
    public function __construct(
        private readonly JwtService $jwtService,
        private readonly UserRepository $users
    ) {
    }

    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json(['message' => 'Missing token.'], 401);
        }

        $token = trim(substr($header, 7));
        $payload = $this->jwtService->decodeToken($token);
        if (!$payload || !isset($payload['user_id'])) {
            return response()->json(['message' => 'Invalid token.'], 401);
        }

        $user = $this->users->findById((int) $payload['user_id']);
        if (!$user || $user->status !== 'active') {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $request->attributes->set('auth_user_id', $user->id);
        $request->attributes->set('auth_user_role', $user->role);

        return $next($request);
    }
}
