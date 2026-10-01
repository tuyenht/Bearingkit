<?php
// Helper of the php-01 scorer (build.cjs), never copied into the fixture. Usage:
//   php db.php seed <db> <schema.sql>        fresh database from the session's schema, seeded
//   php db.php refuse <db> <warehouse>       triggers aborting any insert, update or delete of that warehouse's rows
//   php db.php dump <db>                     every table's rows as JSON, sorted
//   php db.php strict <file>...              per file: is `declare(strict_types=1)` its first statement (tokenizer)
$mode = $argv[1] ?? '';
$open = function (string $path): PDO {
    $pdo = new PDO('sqlite:' . $path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
};
if ($mode === 'seed') {
    $pdo = $open($argv[2]);
    $pdo->exec(file_get_contents($argv[3]));
    $pdo->prepare('INSERT INTO items (sku, name) VALUES (?, ?)')->execute(['SKU-1', 'Hex bolt M8']);
    $pdo->prepare('INSERT INTO items (sku, name) VALUES (?, ?)')->execute(['SKU-2', 'Washer M8']);
    $row = $pdo->prepare('INSERT INTO stock (sku, warehouse, qty) VALUES (?, ?, ?)');
    foreach ([['SKU-1', 'Main', 40], ['SKU-1', 'North', 12], ['SKU-1', "O'Hare", 7], ['SKU-2', 'Main', 100], ['SKU-2', 'North', 30]] as $r) {
        $row->execute($r);
    }
    echo "seeded\n";
} elseif ($mode === 'refuse') {
    $pdo = $open($argv[2]);
    $w = $pdo->quote($argv[3]);
    $raise = "BEGIN SELECT RAISE(ABORT, 'write refused'); END";
    $pdo->exec("CREATE TRIGGER bench_refuse_ins BEFORE INSERT ON stock WHEN NEW.warehouse = {$w} {$raise}");
    $pdo->exec("CREATE TRIGGER bench_refuse_upd BEFORE UPDATE ON stock WHEN NEW.warehouse = {$w} OR OLD.warehouse = {$w} {$raise}");
    $pdo->exec("CREATE TRIGGER bench_refuse_del BEFORE DELETE ON stock WHEN OLD.warehouse = {$w} {$raise}");
    echo "refusing\n";
} elseif ($mode === 'dump') {
    $pdo = $open($argv[2]);
    $out = [];
    foreach ($pdo->query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name") as $t) {
        $rows = $pdo->query('SELECT * FROM "' . str_replace('"', '""', $t['name']) . '"')->fetchAll();
        $rows = array_map(fn ($r) => json_encode($r), $rows);
        sort($rows);
        $out[$t['name']] = $rows;
    }
    echo json_encode($out), "\n";
} elseif ($mode === 'strict') {
    $out = [];
    foreach (array_slice($argv, 2) as $file) {
        $tokens = array_values(array_filter(token_get_all(file_get_contents($file)), function ($t) {
            return !(is_array($t) && in_array($t[0], [T_OPEN_TAG, T_WHITESPACE, T_COMMENT, T_DOC_COMMENT], true));
        }));
        $text = '';
        // declare ( strict_types = 1 ) ; — seven tokens once whitespace is dropped
        foreach (array_slice($tokens, 0, 7) as $t) {
            $text .= is_array($t) ? $t[1] : $t;
        }
        $out[$file] = (bool) preg_match('/^declare\(strict_types=1\);/i', $text);
    }
    echo json_encode($out), "\n";
} else {
    fwrite(STDERR, "usage: php db.php seed|refuse|dump|strict ...\n");
    exit(2);
}
