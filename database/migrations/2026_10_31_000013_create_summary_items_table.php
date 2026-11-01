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
        // INCLUDES (M:N): summaries <-> products, with the price at the time of ordering
        Schema::create('summary_items', function (Blueprint $table) {
            $table->foreignId('summary_id')->constrained('summaries', 'summary_id')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products', 'product_id')->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 10, 2);

            $table->primary(['summary_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('summary_items');
    }
};
