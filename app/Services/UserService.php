<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserService
{
    public function __construct(private readonly UserRepository $users)
    {
    }

    public function listActiveUsers(): array
    {
        return $this->successResponse(200, [
            'users' => $this->users->listActiveMinimal(),
        ]);
    }

    public function listAll(): array
    {
        return $this->successResponse(200, [
            'users' => $this->users->listAll(),
        ]);
    }

    public function create(array $data): array
    {
        $validator = Validator::make($data, [
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|in:ADMIN,CLIENT',
            'status' => 'sometimes|in:active,disabled',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(422, ['errors' => $validator->errors()]);
        }

        $email = strtolower(trim($data['email']));
        if ($this->users->findByEmail($email)) {
            return $this->errorResponse(422, ['errors' => ['email' => ['Email already in use.']]]);
        }

        $passwordErrors = $this->validatePassword($data['password'], $data['role']);
        if ($passwordErrors) {
            return $this->errorResponse(422, ['errors' => ['password' => $passwordErrors]]);
        }

        $user = $this->users->create([
            'email' => $email,
            'role' => $data['role'],
            'password_hash' => Hash::make($data['password']),
            'client_secret_hash' => null,
            'status' => $data['status'] ?? 'active',
        ]);

        return $this->successResponse(201, [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ]);
    }

    public function update(int $userId, array $data): array
    {
        $validator = Validator::make($data, [
            'email' => 'sometimes|email',
            'password' => 'sometimes|string',
            'role' => 'sometimes|in:ADMIN,CLIENT',
            'status' => 'sometimes|in:active,disabled',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(422, ['errors' => $validator->errors()]);
        }

        $user = $this->users->findById($userId);
        if (!$user) {
            return $this->errorResponse(404, ['message' => 'User not found.']);
        }

        $payload = [];

        if (isset($data['email'])) {
            $email = strtolower(trim($data['email']));
            $existing = $this->users->findByEmail($email);
            if ($existing && $existing->id !== $user->id) {
                return $this->errorResponse(422, ['errors' => ['email' => ['Email already in use.']]]);
            }
            $payload['email'] = $email;
        }

        $role = $data['role'] ?? $user->role;

        if (isset($data['password'])) {
            $passwordErrors = $this->validatePassword($data['password'], $role);
            if ($passwordErrors) {
                return $this->errorResponse(422, ['errors' => ['password' => $passwordErrors]]);
            }
            $payload['password_hash'] = Hash::make($data['password']);
        }

        if (isset($data['role'])) {
            $payload['role'] = $data['role'];
        }

        if (isset($data['status'])) {
            $payload['status'] = $data['status'];
        }

        $user = $this->users->update($user, $payload);

        return $this->successResponse(200, [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ]);
    }

    public function disable(int $userId): array
    {
        $user = $this->users->findById($userId);
        if (!$user) {
            return $this->errorResponse(404, ['message' => 'User not found.']);
        }

        $user = $this->users->update($user, ['status' => 'disabled']);

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
