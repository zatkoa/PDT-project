<html>
<head>
    <meta charset="utf-8">
    <title>@yield('title')</title>

    <!-- Authors -->
    <meta name="author" content="AndrejZatko">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="shortcut icon" type="image/ico" href="img/frontpage/favicon.ico" />
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <meta http-equiv="Content-Language" content="sk">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <meta name="application-name" content="PDTProject">
    <meta property="og:locale" content="sk_SK">
    <meta property="og:locale:alternate" content="en_US">
    <meta property="og:type" content="website">
    <meta property="og:title" content="PDTProject">
    <meta property="og:description" content="Numizmatika a drahé kovy">
    <meta property="og:site_name" content="Macho & Chlapovič">
    <meta property="og:url" content="">
    <meta name="keywords" content="PDTProject">
    <meta property="og:title" content="PDTProject">
    <link rel="stylesheet" type="text/css" href="css/app.css" /> 
    <link rel="stylesheet" href="lib/fastselect/fastselect.min.css">
    <link href='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css' rel='stylesheet' />
    <link rel="stylesheet" type="text/css" href="css/all.css" /> 

</head>
<body class="clearfix">
    @include('website.partials.header')
    <main>
        @yield('content')
    </main>
    @include('website.partials.footer')
    <script src="{{ asset('js/app.js') }}"></script>
    <script src='https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.js'></script>
    @stack('scripts')
</body>
</html>
