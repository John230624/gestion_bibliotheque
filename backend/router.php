<?php

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$publicPath = __DIR__ . '/public' . $path;

if ($path !== '/' && file_exists($publicPath) && !is_dir($publicPath)) {
    return false;
}

$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/public/index.php';
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';

require __DIR__ . '/public/index.php';
