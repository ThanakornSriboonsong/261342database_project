<?php

namespace Database\Seeders;

use App\Models\Tier;
use Illuminate\Database\Seeder;

class TierSeeder extends Seeder
{
    /**
     * Members move up automatically at checkout once total_spent reaches min_spent.
     */
    public function run(): void
    {
        foreach ([
            ['name' => 'Silver', 'min_spent' => 0],
            ['name' => 'Gold', 'min_spent' => 1000],
            ['name' => 'Platinum', 'min_spent' => 3000],
        ] as $tier) {
            Tier::create($tier);
        }
    }
}
