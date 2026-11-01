<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Login accounts (password for all: "password"):
     * - admin@banana.test  shop admin, can open /admin
     * - test@example.com   customer with an empty cart
     * - DemoOrderSeeder customers (somchai, suda, ... at banana.test) with past orders
     */
    public function run(): void
    {
        $this->call([
            TierSeeder::class,
            ProductSeeder::class,
            PromotionSeeder::class,
            UserSeeder::class,
            DemoOrderSeeder::class,
        ]);
    }
}
