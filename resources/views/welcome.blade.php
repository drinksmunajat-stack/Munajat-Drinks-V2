<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Munajat Drinks - AI Voice Cashier & POS Management</title>

    <!-- Website Favicon & Icons -->
    <link rel="icon" type="image/png" href="{{ asset('Logo Munajat Mocha.png') }}">
    <link rel="shortcut icon" type="image/png" href="{{ asset('Logo Munajat Mocha.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('Logo Munajat Mocha.png') }}">

    <!-- Google Fonts: Plus Jakarta Sans & Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">

    <!-- Direktif Vite Laravel untuk memasukkan bundling CSS dan React -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])
</head>
<body class="bg-gray-50 antialiased">
    <!-- Div id="root" sebagai wadah render seluruh template React Anda -->
    <div id="root"></div>
</body>
</html>