<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::post('/villages', 'VillageController@filterVillages');
Route::get('/', 'VillageController@index');
Route::get('/villages', 'VillageController@getAllVillages');
Route::get('/amenities', 'VillageController@getAllAmenities');
Route::get('/nearest/{id}/{name}', 'VillageController@getNearestPoint');
Route::get('/potential-villages', 'VillageController@getPotentialVillages');



