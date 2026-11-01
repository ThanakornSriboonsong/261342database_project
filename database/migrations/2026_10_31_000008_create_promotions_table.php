<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id('promotion_id');

            // OFFERS (1:N): a promotion may be limited to one tier
            $table->foreignId('tier_id')->nullable()
                ->constrained('tiers', 'tier_id')->nullOnDelete();

            $table->string('name');
            $table->string('code')->unique();

            // Disjoint specialization: says which subclass table (discounts / buy_gets) holds the details
            $table->enum('type', ['discount', 'buy_get']);

            $table->date('start_date');
            $table->date('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
