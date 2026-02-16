<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    public function createToken(int $userId, string $role): array
    {
        $ttlMinutes = (int) env('JWT_TTL_MINUTES', 20);
        $now = time();
        $payload = [
            'user_id' => $userId,
            'role' => $role,
            'iat' => $now,
            'exp' => $now + ($ttlMinutes * 60),
        ];

        $token = JWT::encode($payload, $this->getSecret(), 'HS256');

        return [
            'token' => $token,
            'expires_in' => $ttlMinutes * 60,
        ];
    }

    public function decodeToken(string $token): ?array
    {
        try {
            $payload = JWT::decode($token, new Key($this->getSecret(), 'HS256'));

            return (array) $payload;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function getSecret(): string
    {
        $secret = env('JWT_SECRET', config('app.key'));

        if (is_string($secret) && str_starts_with($secret, 'base64:')) {
            $decoded = base64_decode(substr($secret, 7));
            return $decoded !== false ? $decoded : '';
        }

        return (string) $secret;
    }
}
