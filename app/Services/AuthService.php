<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthService
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly JwtService $jwtService
    ) {
    }

    public function register(array $data): array
    {
        $validator = Validator::make($data, [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(422, ['errors' => $validator->errors()]);
        }

        $email = strtolower(trim($data['email']));
        if ($this->users->findByEmail($email)) {
            return $this->errorResponse(422, ['errors' => ['email' => ['Email already in use.']]]);
        }

        $passwordErrors = $this->validatePassword($data['password'], 'CLIENT');
        if ($passwordErrors) {
            return $this->errorResponse(422, ['errors' => ['password' => $passwordErrors]]);
        }

        $user = $this->users->create([
            'email' => $email,
            'role' => 'CLIENT',
            'password_hash' => Hash::make($data['password']),
            'client_secret_hash' => null,
            'status' => 'active',
        ]);

        return $this->successResponse(201, [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ]);
    }

    public function login(array $data): array
    {
        $validator = Validator::make($data, [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(422, ['errors' => $validator->errors()]);
        }

        $email = strtolower(trim($data['email']));
        $user = $this->users->findByEmail($email);
        if (!$user || !Hash::check($data['password'], $user->password_hash)) {
            return $this->errorResponse(401, ['message' => 'Invalid credentials.']);
        }

        if ($user->status !== 'active') {
            return $this->errorResponse(403, ['message' => 'User is not active.']);
        }

        $token = $this->jwtService->createToken($user->id, $user->role);

        return $this->successResponse(200, [
            'token' => $token['token'],
            'expires_in' => $token['expires_in'],
        ]);
    }

    public function me(int $userId): array
    {
        $user = $this->users->findById($userId);
        if (!$user) {
            return $this->errorResponse(404, ['message' => 'User not found.']);
        }

        return $this->successResponse(200, [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ]);
    }

    private function validatePassword(string $password, string $role): array
    {
        $minLength = $role === 'ADMIN' ? 15 : 12;
        $errors = [];

        if (mb_strlen($password) < $minLength) {
            $errors[] = "Password must be at least {$minLength} characters.";
        }
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must include an uppercase letter.';
        }
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must include a lowercase letter.';
        }
        if (!preg_match('/\d/', $password)) {
            $errors[] = 'Password must include a digit.';
        }
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = 'Password must include a special character.';
        }

        return $errors;
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
