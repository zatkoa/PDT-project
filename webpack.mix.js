const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
   .sass('resources/sass/app.scss', 'public/css')
   .styles([
      // 'node_modules/leaflet/dist/leaflet.css',
  ], 'public/css/all.css')
  .copyDirectory('node_modules/leaflet/dist','public/lib/leaflet')
  .copyDirectory('resources/lib/mapbox','public/lib/mapbox')
  .copyDirectory('resources/lib/fastselect','public/lib/fastselect')
  .copyDirectory('resources/icons','public/icons')
  .scripts(['resources/js/utils.js',
  'resources/js/config.js',
  'resources/js/website/main.js',
 ],'public/js/custom.js')
  .copy('resources/js/en.js','public/js/en.js')
  .copy('resources/js/sk.js','public/js/sk.js');



