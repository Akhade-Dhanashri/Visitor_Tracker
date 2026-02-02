<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VisitorController;
use App\Http\Controllers\UserController;

Route::get('/visitors', [VisitorController::class, 'index']);
Route::post('/visitors', [VisitorController::class, 'store']);
Route::get('/visitors/{id}', [VisitorController::class, 'show']);
Route::put('/visitors/{id}/checkout', [VisitorController::class, 'updateCheckout']);
Route::delete('/visitors/{id}', [VisitorController::class, 'destroy']);
Route::get('/visitors/report', [VisitorController::class, 'report']);

// User Management Routes
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

