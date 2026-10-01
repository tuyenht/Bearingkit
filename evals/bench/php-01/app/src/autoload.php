<?php

// PSR-4 for the Stock\ namespace, so the tool runs without `composer install`.
spl_autoload_register(function (string $class): void {
    $prefix = 'Stock\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }
    $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require $file;
    }
});
