# Stock tool

Stock levels per warehouse, kept in SQLite.

    php bin/stock.php init          # create the tables in $STOCK_DB (default: data/stock.sqlite)
    php bin/stock.php show <sku>    # quantity of an item in each warehouse

Tests: `php tests/run.php`.
