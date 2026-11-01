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
        // CONTAINS (M:N): cart <-> products
        Schema::create('cart_items', function (Blueprint $table) {
            $table->foreignId('cart_id')->constrained('carts', 'cart_id')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products', 'product_id')->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->boolean('is_out')->default(false);

            $table->primary(['cart_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
