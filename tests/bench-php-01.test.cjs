'use strict';
// php-01 (registered 2026-09-28, docs/specs/2026-09-28-stack-php-laravel-design.md): a transfer command in a small
// plain-PHP stock tool on SQLite. The stream's reach measure (R) for php-laravel.md, and the fixture's promises:
// untouched it is green and has no transfer; a naive port (no strict types, SQL by concatenation, no transaction) does
// the happy path and fails all three hazards; the reference (strict types, bound parameters, one transaction) passes
// all three and the control; each variant fails only the hazard it drops. PHP runs on a copy of the fixture; with no
// interpreter the test skips and says why.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { reach } = require('../scripts/lib/bench-score.cjs');
const { detect } = require('../scripts/detect-stack.cjs');
const build = require('../evals/bench/php-01/build.cjs');

const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });

test('reach for php-01 reads php-laravel.md, not another stack file', () => {
  const kit = 'C:\\Projects\\Bearingkit\\skills\\bk-build\\references\\stacks';
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\php-laravel.md` })]), 'php-laravel').file, true);
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\python.md` })]), 'php-laravel').file, false);
});

const write = (dst, rel, text) => { fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true }); fs.writeFileSync(path.join(dst, rel), text); };
const sub = (dst, rel, from, to) => { const f = path.join(dst, rel); const s = fs.readFileSync(f, 'utf8'); assert.ok(s.includes(from), `${rel} has ${from}`); fs.writeFileSync(f, s.split(from).join(to)); };

// The transfer command wired into the tool; each port supplies src/Transfer.php.
const WIRE = "        case 'transfer':\n            [, , $sku, $from, $to, $qty] = array_pad($argv, 6, '');\n            (new Stock\\Transfer(Database::connect()))->move($sku, $from, $to, (int) $qty);\n            exit(0);\n\n        default:";
const HEAD = (strict) => `<?php\n\n${strict ? 'declare(strict_types=1);\n\n' : ''}namespace Stock;\n\nuse PDO;\nuse RuntimeException;\n\nclass Transfer\n{\n    public function __construct(private PDO $pdo)\n    {\n    }\n\n`;
const NAIVE = `${HEAD(false)}    public function move(string $sku, string $from, string $to, int $qty): void
    {
        $have = (int) $this->pdo->query("SELECT qty FROM stock WHERE sku = '{$sku}' AND warehouse = '{$from}'")->fetchColumn();
        if ($have < $qty) {
            throw new RuntimeException("not enough {$sku} in {$from}");
        }
        $this->pdo->exec("UPDATE stock SET qty = qty - {$qty} WHERE sku = '{$sku}' AND warehouse = '{$from}'");
        $this->pdo->exec("UPDATE stock SET qty = qty + {$qty} WHERE sku = '{$sku}' AND warehouse = '{$to}'");
    }
}
`;
const BODY = `        $stmt = $this->pdo->prepare('SELECT qty FROM stock WHERE sku = ? AND warehouse = ?');
        $stmt->execute([$sku, $from]);
        if ((int) $stmt->fetchColumn() < $qty) {
            throw new RuntimeException("not enough {$sku} in {$from}");
        }
        $this->pdo->prepare('UPDATE stock SET qty = qty - ? WHERE sku = ? AND warehouse = ?')->execute([$qty, $sku, $from]);
        $this->pdo->prepare('UPDATE stock SET qty = qty + ? WHERE sku = ? AND warehouse = ?')->execute([$qty, $sku, $to]);
`;
const REFERENCE = `${HEAD(true)}    public function move(string $sku, string $from, string $to, int $qty): void
    {
        $this->pdo->beginTransaction();
        try {
${BODY.replace(/^/gm, '    ').replace(/^ {4}$/gm, '')}            $this->pdo->commit();
        } catch (\\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
`;
const NO_TX = `${HEAD(true)}    public function move(string $sku, string $from, string $to, int $qty): void\n    {\n${BODY}    }\n}\n`;
// One UPDATE over both rows: atomic on its own, no transaction needed.
const ONE_UPDATE = `${HEAD(true)}    public function move(string $sku, string $from, string $to, int $qty): void
    {
        $stmt = $this->pdo->prepare('SELECT qty FROM stock WHERE sku = ? AND warehouse = ?');
        $stmt->execute([$sku, $from]);
        if ((int) $stmt->fetchColumn() < $qty) {
            throw new RuntimeException("not enough {$sku} in {$from}");
        }
        $this->pdo->prepare('UPDATE stock SET qty = qty + CASE warehouse WHEN ? THEN -? ELSE ? END WHERE sku = ? AND warehouse IN (?, ?)')
            ->execute([$from, $qty, $qty, $sku, $from, $to]);
    }
}
`;
const pick = (r, keys) => keys.map((k) => r[k]);
// A port made from another by one replacement; a replacement that matches nothing is a broken test, not a variant.
const vary = (src, from, to) => { assert.ok(from instanceof RegExp ? from.test(src) : src.includes(from), `variant source has ${from}`); return src.replace(from, to); };
const H = ['O1', 'H1', 'H2', 'H3', 'X'];

test('php-01: untouched is green with no transfer; each port fails the hazard it drops, the reference passes all', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'php-01');
  try {
    build.build({ dst });
    const profile = detect(dst);
    assert.deepEqual([profile.languages, profile.frameworks.map((f) => f.name), profile.guardrails], [['php'], [], []], 'detect-stack reads the fixture as registered');
    assert.ok(profile.stackFiles.some((f) => f.endsWith('/stacks/php-laravel.md')), 'the profile names php-laravel.md');

    let first;
    try { first = await build.check(dst); } catch (e) {
      if (e.code === 'ENOENT') { t.skip(`no PHP interpreter to run the fixture: ${e.message}`); return; }
      throw e;
    }
    assert.equal(first.O2, true, 'green untouched');
    assert.deepEqual([...pick(first, H), first.H, first.H1class, first.P4], [false, false, false, false, false, 0, 'none-added', 0], 'no transfer yet: a usage error passes nothing, the control included');

    sub(dst, 'bin/stock.php', '        default:', WIRE);
    write(dst, 'src/Transfer.php', NAIVE);
    const naive = await build.check(dst);
    assert.equal(naive.O2, true);
    assert.deepEqual([...pick(naive, H), naive.H3runs, naive.H1class], [true, false, false, false, true, [true, false], 'none'], 'naive: the happy path, and every hazard missed');

    write(dst, 'src/Transfer.php', REFERENCE);
    const ref = await build.check(dst);
    assert.deepEqual([...pick(ref, H), ref.H, ref.H1class, ref.added], [true, true, true, true, true, 3, 'all', ['src/Transfer.php']], 'reference: strict types, bound parameters, one transaction');
    assert.notEqual(ref.overExit, 0);

    write(dst, 'src/Transfer.php', NO_TX);
    const noTx = await build.check(dst);
    assert.deepEqual([...pick(noTx, H), noTx.H3runs], [true, true, true, false, true, [true, false]], 'no transaction: the destination refusing leaves the source written');

    write(dst, 'src/Transfer.php', ONE_UPDATE);
    assert.deepEqual(pick(await build.check(dst), H), [true, true, true, true, true], 'one UPDATE over both rows is atomic on its own');

    write(dst, 'src/Transfer.php', vary(vary(REFERENCE, "warehouse = ?')->execute([$qty, $sku, $to]);", "warehouse = '{$to}'\")->execute([$qty, $sku]);"), "prepare('UPDATE stock SET qty = qty + ? WHERE sku = ? AND", 'prepare("UPDATE stock SET qty = qty + ? WHERE sku = ? AND'));
    const concat = await build.check(dst);
    assert.deepEqual(pick(concat, H), [true, true, false, true, true], 'one value concatenated into the SQL: the quote in O\'Hare breaks it');

    write(dst, 'src/Transfer.php', vary(vary(vary(REFERENCE, '        $this->pdo->beginTransaction();\n', ''), '$this->pdo->commit();', ''), '$this->pdo->rollBack();', ''));
    assert.deepEqual(pick(await build.check(dst), H), [true, true, true, false, true], 'a try block alone is not a transaction');

    // The destination written first, no transaction: the source refusing now leaves the destination written.
    write(dst, 'src/Transfer.php', vary(NO_TX, /( {8}\$this->pdo->prepare\('UPDATE stock SET qty = qty - .*\n)( {8}\$this->pdo->prepare\('UPDATE stock SET qty = qty \+ .*\n)/, '$2$1'));
    const destFirst = await build.check(dst);
    assert.deepEqual([destFirst.H3, destFirst.H3runs], [false, [false, true]], 'destination first: the other run catches it');

    write(dst, 'src/Transfer.php', vary(REFERENCE, '<?php\n\ndeclare', '<?php\n\n/**\n * Moves stock between warehouses.\n */\n\ndeclare'));
    assert.equal((await build.check(dst)).H1, true, 'a comment before the declaration is still first-statement');
    write(dst, 'src/Transfer.php', vary(REFERENCE, 'strict_types=1', 'strict_types=0'));
    assert.equal((await build.check(dst)).H1, false, 'strict_types=0 is not strict');
    write(dst, 'src/Transfer.php', vary(vary(REFERENCE, 'declare(strict_types=1);\n\n', ''), 'use RuntimeException;\n', 'use RuntimeException;\n\ndeclare(strict_types=1);\n'));
    const late = await build.check(dst);
    assert.equal(late.H1, false, 'a declaration that is not the first statement does not count');
    write(dst, 'src/Transfer.php', REFERENCE);
    write(dst, 'src/Clock.php', '<?php\n\nnamespace Stock;\n\nclass Clock\n{\n}\n');
    const some = await build.check(dst);
    assert.deepEqual([some.H1, some.H1class], [false, 'some'], 'every added PHP file, not just one');
    fs.rmSync(path.join(dst, 'src/Clock.php'));

    // A transfer that keeps a log table it creates on first use: an empty new table is no change, a stray row is.
    const LOGGED = vary(REFERENCE, '        $this->pdo->beginTransaction();\n',"        $this->pdo->exec('CREATE TABLE IF NOT EXISTS transfer_log (sku TEXT, qty INTEGER)');\n        $this->pdo->beginTransaction();\n        $this->pdo->prepare('INSERT INTO transfer_log (sku, qty) VALUES (?, ?)')->execute([$sku, $qty]);\n");
    write(dst, 'src/Transfer.php', LOGGED);
    assert.deepEqual(pick(await build.check(dst), H), [true, true, true, true, true], 'a log row inside the transaction rolls back with it');
    write(dst, 'src/Transfer.php', vary(LOGGED, "        $this->pdo->beginTransaction();\n        $this->pdo->prepare('INSERT INTO transfer_log (sku, qty) VALUES (?, ?)')->execute([$sku, $qty]);\n", "        $this->pdo->prepare('INSERT INTO transfer_log (sku, qty) VALUES (?, ?)')->execute([$sku, $qty]);\n        $this->pdo->beginTransaction();\n"));
    assert.equal((await build.check(dst)).H3, false, 'a log row written before the transaction stays when the transfer fails');

    write(dst, 'src/Transfer.php', vary(REFERENCE, / *if \(\(int\) \$stmt->fetchColumn\(\) < \$qty\) \{\n.*\n *\}\n/, ''));
    const over = await build.check(dst);
    assert.deepEqual(pick(over, H), [true, true, true, true, false], 'no check of the source quantity: the control fails, nothing else');
    // The control's two conditions one at a time: refusing quietly (exit 0, nothing written), and failing loudly after
    // writing (non-zero exit, rows changed).
    write(dst, 'src/Transfer.php', vary(REFERENCE, 'throw new RuntimeException("not enough {$sku} in {$from}");', 'return;'));
    const quiet = await build.check(dst);
    assert.deepEqual([quiet.X, quiet.overExit], [false, 0], 'a refusal that exits 0 is not the control\'s failure');
    const LATE = vary(vary(NO_TX, / *if \(\(int\) \$stmt->fetchColumn\(\) < \$qty\) \{\n.*\n *\}\n/, ''), '->execute([$qty, $sku, $to]);\n', "->execute([$qty, $sku, $to]);\n        $stmt->execute([$sku, $from]);\n        if ((int) $stmt->fetchColumn() < 0) {\n            throw new RuntimeException('negative stock');\n        }\n");
    write(dst, 'src/Transfer.php', LATE);
    const late2 = await build.check(dst);
    assert.equal(late2.X, false, 'a non-zero exit after the rows were written is not "changes nothing"');
    assert.notEqual(late2.overExit, 0);

    write(dst, 'src/Transfer.php', vary(REFERENCE, '            $this->pdo->commit();', "            $this->pdo->prepare('INSERT INTO stock (sku, warehouse, qty) VALUES (?, ?, 0)')->execute([$sku, 'Staging']);\n            $this->pdo->commit();"));
    assert.deepEqual(pick(await build.check(dst), ['O1', 'H2', 'H3']), [false, false, false], 'a stray stock row is not "nothing else changed"');
    assert.deepEqual(pick(await (write(dst, 'src/Transfer.php', LOGGED), build.check(dst)), ['O1', 'H2']), [true, true], 'a row in a log table of its own is');

    write(dst, 'src/Transfer.php', vary(REFERENCE, 'qty = qty + ?', 'qty = qty + 2 * ?'));
    assert.deepEqual(pick(await build.check(dst), ['O1', 'H2', 'H3', 'X']), [false, false, false, false], 'the wrong quantity moved is not the happy path, and H3 and X need it');

    write(dst, 'src/Transfer.php', REFERENCE);
    sub(dst, 'bin/stock.php', "->move($sku, $from, $to, (int) $qty);\n            exit(0);", "->move($sku, $from, $to, (int) $qty);\n            exit(1);");
    assert.deepEqual(pick(await build.check(dst), ['O1', 'H2']), [false, false], 'the right rows with a failing exit are not the happy path');
    sub(dst, 'bin/stock.php', "->move($sku, $from, $to, (int) $qty);\n            exit(1);", "->move($sku, $from, $to, (int) $qty);\n            exit(0);");

    write(dst, 'schema.sql', vary(fs.readFileSync(path.join(dst, 'schema.sql'), 'utf8'),'qty       INTEGER NOT NULL,', 'qty       INTEGER NOT NULL,\n    bin       TEXT NOT NULL,'));
    const seedless = await build.check(dst);
    assert.deepEqual([seedless.O1, typeof seedless.seedError], [false, 'string'], 'a schema the seed cannot fill is reported, not scored as a pass');
    build.reset({ dst });

    sub(dst, 'bin/stock.php', '        default:', WIRE);
    write(dst, 'src/Transfer.php', REFERENCE);
    write(dst, 'tests/BrokenTest.php', "<?php\n\nreturn ['broken' => function () {\n    throw new RuntimeException('no');\n}];\n");
    write(dst, 'config/transfer.ini', '\n');
    write(dst, 'NOTES.md', 'notes\n');
    const broken = await build.check(dst);
    assert.equal(broken.O2, false, 'a red test is a red suite: the runner picks up every tests/*Test.php');
    assert.equal(broken.P4, 1, 'a file outside bin/, src/, tests/, schema.sql and a root note counts; the note does not');
    assert.equal(broken.H1, false, 'the added test file has no declaration either');

    build.reset({ dst });
    assert.equal((await build.check(dst)).O1, false, 'reset takes the transfer away');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
