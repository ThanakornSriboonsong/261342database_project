<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\SalesReportController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

// Shop staff only (users.is_admin = true).
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::resource('products', ProductController::class)->except('show');
    Route::resource('promotions', PromotionController::class)->except('show');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{summary}', [OrderController::class, 'show'])->name('orders.show');

    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');

    Route::get('sales-report', [SalesReportController::class, 'index'])->name('sales-report.index');
    Route::get('sales-report/export', [SalesReportController::class, 'export'])->name('sales-report.export');
});
