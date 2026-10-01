CREATE TABLE IF NOT EXISTS items (
    sku  TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock (
    sku       TEXT NOT NULL REFERENCES items (sku),
    warehouse TEXT NOT NULL,
    qty       INTEGER NOT NULL,
    PRIMARY KEY (sku, warehouse)
);
