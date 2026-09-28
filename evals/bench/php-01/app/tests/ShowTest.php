<?php

return [
    'show prints the quantity in each warehouse' => function () {
        $db = temp_db(['SKU-1' => ['Hex bolt M8', ['Main' => 40, 'North' => 12]]]);
        [$code, $out] = run_cli(['show', 'SKU-1'], $db);
        assert_same(0, $code, 'exit code');
        assert_same("SKU-1  Hex bolt M8\n  Main         40\n  North        12\n", $out, 'output');
    },
    'show rejects an unknown sku' => function () {
        $db = temp_db([]);
        [$code, , $err] = run_cli(['show', 'NOPE'], $db);
        assert_same(1, $code, 'exit code');
        assert_same("unknown sku: NOPE\n", $err, 'stderr');
    },
    'no command prints the usage' => function () {
        $db = temp_db([]);
        [$code, , $err] = run_cli([], $db);
        assert_same(2, $code, 'exit code');
        assert_same(true, str_starts_with($err, 'usage:'), 'usage on stderr');
    },
];
