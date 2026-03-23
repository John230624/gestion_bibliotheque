<?php

declare(strict_types=1);

require dirname(__DIR__) . '/config/bootstrap.php';

$dir = dirname(__DIR__) . '/config/jwt';

if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

$passphrase = $_SERVER['JWT_PASSPHRASE'] ?? $_ENV['JWT_PASSPHRASE'] ?? getenv('JWT_PASSPHRASE') ?: 'change_me';
$opensslConfig = 'C:/php/extras/ssl/openssl.cnf';

$config = [
    'private_key_bits' => 4096,
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
    'config' => $opensslConfig,
];

if (!file_exists($opensslConfig)) {
    fwrite(STDERR, "OpenSSL config not found at {$opensslConfig}\n");
    exit(1);
}

$key = openssl_pkey_new($config);

if ($key === false) {
    while ($message = openssl_error_string()) {
        fwrite(STDERR, $message . PHP_EOL);
    }
    exit(1);
}

if (!openssl_pkey_export($key, $privateKey, $passphrase, $config)) {
    while ($message = openssl_error_string()) {
        fwrite(STDERR, $message . PHP_EOL);
    }
    exit(1);
}

$details = openssl_pkey_get_details($key);

if ($details === false || !isset($details['key'])) {
    while ($message = openssl_error_string()) {
        fwrite(STDERR, $message . PHP_EOL);
    }
    exit(1);
}

file_put_contents($dir . '/private.pem', $privateKey);
file_put_contents($dir . '/public.pem', $details['key']);

echo "JWT keypair generated in config/jwt\n";
