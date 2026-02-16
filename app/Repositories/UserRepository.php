<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->fill($data);
        $user->save();

        return $user;
    }

    public function listAll(): Collection
    {
        return User::query()
            ->select(['id', 'email', 'role', 'status', 'created_at', 'updated_at'])
            ->orderBy('id')
            ->get();
    }

    public function listActiveMinimal(): Collection
    {
        return User::query()
            ->select(['id', 'email'])
            ->where('status', 'active')
            ->orderBy('id')
            ->get();
    }
}
