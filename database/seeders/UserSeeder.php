<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un utilisateur CLIENT de test
        User::create([
            'email' => 'alice@example.com',
            'role' => 'CLIENT',
            'password_hash' => Hash::make('Alice@123456789'),
            'status' => 'active',
        ]);

        // Créer un utilisateur ADMIN de test
        User::create([
            'email' => 'admin@example.com',
            'role' => 'ADMIN',
            'password_hash' => Hash::make('Admin@123456789'),
            'status' => 'active',
        ]);
    }
}
