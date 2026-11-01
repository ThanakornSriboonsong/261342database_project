<?php

namespace Database\Seeders;

use App\Models\Tier;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Test accounts; the factory sets the password to "password".
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Banana Admin',
            'email' => 'admin@banana.test',
            'phone' => '0800000000',
            'address' => 'Banana Shop HQ, Chiang Mai',
        ]);

        $customer = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '0811111111',
            'address' => '239 Huay Kaew Rd, Suthep, Mueang Chiang Mai, Chiang Mai 50200',
        ]);

        $customer->tier_id = Tier::where('name', 'Silver')->value('tier_id');
        $customer->save();
    }
}
