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
        // Subclass of PROMOTION: shares the promotion's primary key
        Schema::create('buy_gets', function (Blueprint $table) {
            $table->foreignId('promotion_id')->constrained('promotions', 'promotion_id')->cascadeOnDelete();
            $table->unsignedInteger('buy_qty');
            $table->unsignedInteger('get_qty');

            $table->primary('promotion_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buy_gets');
    }
};
