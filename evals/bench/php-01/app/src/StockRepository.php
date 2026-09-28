<?php

namespace Stock;

use PDO;

class StockRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function item(string $sku): ?array
    {
        $stmt = $this->pdo->prepare('SELECT sku, name FROM items WHERE sku = ?');
        $stmt->execute([$sku]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    // Quantity per warehouse, warehouse name => qty, in name order.
    public function quantities(string $sku): array
    {
        $stmt = $this->pdo->prepare('SELECT warehouse, qty FROM stock WHERE sku = ? ORDER BY warehouse');
        $stmt->execute([$sku]);
        $out = [];
        foreach ($stmt->fetchAll() as $row) {
            $out[$row['warehouse']] = (int) $row['qty'];
        }
        return $out;
    }
}
