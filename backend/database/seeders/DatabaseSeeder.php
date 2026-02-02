<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create application users for testing
        \Illuminate\Support\Facades\Hash::make('admin123');

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@rachana.org',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'Active',
        ]);

        User::create([
            'name' => 'Security Guard 1',
            'email' => 'guard1@rachana.org',
            'password' => \Illuminate\Support\Facades\Hash::make('guard123'),
            'role' => 'security',
            'status' => 'Active',
        ]);

        User::create([
            'name' => 'Security Guard 2',
            'email' => 'guard2@rachana.org',
            'password' => \Illuminate\Support\Facades\Hash::make('guard123'),
            'role' => 'security',
            'status' => 'Active',
        ]);
    }
}
