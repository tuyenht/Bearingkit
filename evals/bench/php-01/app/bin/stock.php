<?php

require __DIR__ . '/../src/autoload.php';

use Stock\Database;
use Stock\StockRepository;

$usage = "usage: php bin/stock.php init | show <sku>\n";
$command = $argv[1] ?? null;

try {
    switch ($command) {
        case 'init':
            Database::migrate(Database::connect());
            echo "initialised\n";
            exit(0);

        case 'show':
            $sku = $argv[2] ?? null;
            if ($sku === null) {
                fwrite(STDERR, $usage);
                exit(2);
            }
            $repo = new StockRepository(Database::connect());
            $item = $repo->item($sku);
            if ($item === null) {
                fwrite(STDERR, "unknown sku: {$sku}\n");
                exit(1);
            }
            echo "{$item['sku']}  {$item['name']}\n";
            foreach ($repo->quantities($sku) as $warehouse => $qty) {
                printf("  %-12s %d\n", $warehouse, $qty);
            }
            exit(0);

        default:
            fwrite(STDERR, $usage);
            exit(2);
    }
} catch (PDOException $e) {
    fwrite(STDERR, 'database error: ' . $e->getMessage() . "\n");
    exit(1);
}
