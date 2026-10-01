<?php

namespace Stock;

use PDO;

class Database
{
    // The SQLite file named by STOCK_DB, or data/stock.sqlite next to the project.
    public static function connect(): PDO
    {
        $path = getenv('STOCK_DB') ?: __DIR__ . '/../data/stock.sqlite';
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        $pdo = new PDO('sqlite:' . $path);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    }

    public static function migrate(PDO $pdo): void
    {
        $pdo->exec(file_get_contents(__DIR__ . '/../schema.sql'));
    }
}
