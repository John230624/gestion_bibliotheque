<?php

declare(strict_types=1);

use App\Kernel;
use Symfony\Component\HttpFoundation\Request;

require dirname(__DIR__) . '/config/bootstrap.php';
require dirname(__DIR__) . '/src/Kernel.php';

$kernel = new Kernel('dev', true);
$kernel->boot();

$run = static function (Request $request) use ($kernel): array {
    $response = $kernel->handle($request);
    $content = $response->getContent() ?: '';
    $decoded = json_decode($content, true);

    return [
        'status' => $response->getStatusCode(),
        'body' => $decoded ?? $content,
    ];
};

$books = $run(Request::create('/api/books', 'GET'));
$login = $run(Request::create(
    '/api/auth/login',
    'POST',
    [],
    [],
    [],
    ['CONTENT_TYPE' => 'application/json'],
    json_encode([
        'username' => 'admin@bibliotheque.local',
        'password' => 'Admin123!',
    ], JSON_THROW_ON_ERROR)
));

$token = is_array($login['body']) ? ($login['body']['token'] ?? null) : null;

if (!is_string($token) || $token === '') {
    fwrite(STDERR, "JWT token was not returned by login.\n");
    fwrite(STDERR, json_encode($login, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL);
    exit(1);
}

$stats = $run(Request::create(
    '/api/stats',
    'GET',
    [],
    [],
    [],
    ['HTTP_Authorization' => 'Bearer ' . $token]
));

echo 'BOOKS=' . json_encode($books, JSON_UNESCAPED_SLASHES) . PHP_EOL;
echo 'LOGIN=' . json_encode($login, JSON_UNESCAPED_SLASHES) . PHP_EOL;
echo 'STATS=' . json_encode($stats, JSON_UNESCAPED_SLASHES) . PHP_EOL;

$kernel->shutdown();
