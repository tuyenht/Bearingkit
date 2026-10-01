<?php

use Stock\Database;

function assert_same($expected, $actual, string $what = 'value'): void
{
    if ($expected !== $actual) {
        throw new RuntimeException("{$what}: expected " . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
}

// A fresh database file with the schema and the given rows: [sku => [name, [warehouse => qty]]].
function temp_db(array $items): string
{
    $base = tempnam(sys_get_temp_dir(), 'stock');
    $path = $base . '.sqlite';
    register_shutdown_function(function () use ($base, $path): void {
        foreach ([$base, $path] as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    });
    putenv("STOCK_DB={$path}");
    $pdo = Database::connect();
    Database::migrate($pdo);
    foreach ($items as $sku => [$name, $levels]) {
        $pdo->prepare('INSERT INTO items (sku, name) VALUES (?, ?)')->execute([$sku, $name]);
        foreach ($levels as $warehouse => $qty) {
            $pdo->prepare('INSERT INTO stock (sku, warehouse, qty) VALUES (?, ?, ?)')->execute([$sku, $warehouse, $qty]);
        }
    }
    return $path;
}

// Runs the tool as a user would: [exit code, stdout, stderr].
function run_cli(array $args, string $db): array
{
    $cmd = array_merge([PHP_BINARY, __DIR__ . '/../bin/stock.php'], $args);
    $env = array_merge(getenv(), ['STOCK_DB' => $db]);
    $proc = proc_open($cmd, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null, $env);
    $out = stream_get_contents($pipes[1]);
    $err = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    return [proc_close($proc), $out, $err];
}
