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
        Schema::create('summaries', function (Blueprint $table) {
            $table->id('summary_id');

            // CHECKOUT (1:N): every order comes from a cart; keep order history if someone tries to delete the cart
            $table->foreignId('cart_id')->constrained('carts', 'cart_id')->restrictOnDelete();

            // USED_IN (1:N): an order may use one promotion
            $table->foreignId('promotion_id')->nullable()
                ->constrained('promotions', 'promotion_id')->nullOnDelete();

            $table->timestamp('order_date')->useCurrent();
            $table->decimal('total_price', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('final_price', 10, 2);
            $table->text('shipping_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('summaries');
    }
};
