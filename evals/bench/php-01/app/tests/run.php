<?php

// Runs every tests/*Test.php. Each file returns [name => callable]; a test fails by throwing.
require __DIR__ . '/../src/autoload.php';
require __DIR__ . '/helpers.php';

$count = 0;
$failed = 0;
foreach (glob(__DIR__ . '/*Test.php') as $file) {
    foreach (require $file as $name => $test) {
        $count++;
        try {
            $test();
            echo "ok   {$name}\n";
        } catch (Throwable $e) {
            $failed++;
            echo "FAIL {$name}: {$e->getMessage()}\n";
        }
    }
}
echo "{$count} tests, {$failed} failed\n";
exit($failed === 0 ? 0 : 1);
