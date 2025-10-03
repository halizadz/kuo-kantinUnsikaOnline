<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$'); // ← Regex ini exclude semua yang dimulai dengan 'api'