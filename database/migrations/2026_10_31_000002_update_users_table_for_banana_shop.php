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
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('id', 'user_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->decimal('total_spent', 10, 2)->default(0)->after('password');

            // BELONGS_TO: should be total participation, nullable until tiers are seeded
            $table->foreignId('tier_id')->nullable()->after('total_spent')
                ->constrained('tiers', 'tier_id')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tier_id']);
            $table->dropColumn(['phone', 'address', 'total_spent', 'tier_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('user_id', 'id');
        });
    }
};
