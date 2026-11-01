<?php

namespace Tests\Feature;

use App\Models\Tier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Tests\TestCase;

class MembershipTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        foreach ([['Silver', 0], ['Gold', 1000], ['Platinum', 3000]] as [$name, $minSpent]) {
            Tier::create(['name' => $name, 'min_spent' => $minSpent]);
        }
    }

    private function member(string $tier, float $totalSpent): User
    {
        $user = User::factory()->create();
        $user->tier_id = Tier::where('name', $tier)->value('tier_id');
        $user->total_spent = $totalSpent;
        $user->save();

        return $user;
    }

    public function test_guests_have_no_membership()
    {
        $this->get('/products')->assertInertia(fn (Assert $page) => $page->where('membership', null));
    }

    public function test_membership_shows_tier_and_next_tier()
    {
        $this->actingAs($this->member('Gold', 2144.5))->get('/products')->assertInertia(fn (Assert $page) => $page
            ->where('membership.tier.name', 'Gold')
            ->where('membership.tier.min_spent', 1000)
            ->where('membership.total_spent', 2144.5)
            ->where('membership.next_tier.name', 'Platinum')
            ->where('membership.next_tier.remaining', 855.5));
    }

    public function test_top_tier_has_no_next_tier()
    {
        $this->actingAs($this->member('Platinum', 5000))->get('/products')->assertInertia(fn (Assert $page) => $page
            ->where('membership.tier.name', 'Platinum')
            ->where('membership.next_tier', null));
    }

    public function test_new_members_start_in_the_entry_tier()
    {
        $this->skipUnlessFortifyHas(Features::registration());

        $this->post(route('register.store'), [
            'name' => 'New Member',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertSame('Silver', User::where('email', 'new@example.com')->first()->tier->name);
    }
}
