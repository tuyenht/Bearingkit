'use strict';
// cpp-01 (designed in docs/specs/2026-10-08-stack-c-cpp-design.md): a `total` command in a small CMake C++20 project.
// The stream's reach measure (R) for c-cpp.md, and the fixture's promises: untouched it builds, its tests are green and
// nothing passes; a naive draft (int sum, an index into an empty vector, std::stoi uncaught, a signed loop index) does
// the happy path and fails all four hazards; the reference passes all four and the control; each variant fails only
// the hazard it drops. The compiler runs on a copy of the fixture; with no toolchain the test skips and says why.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { reach } = require('../scripts/lib/bench-score.cjs');
const { detect } = require('../scripts/detect-stack.cjs');
const { loadTask } = require('../scripts/bench.cjs');
const build = require('../evals/bench/cpp-01/build.cjs');

const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });

test('reach for cpp-01 reads c-cpp.md, not another stack file', () => {
  const kit = 'C:\\Projects\\Bearingkit\\skills\\bk-build\\references\\stacks';
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\c-cpp.md` })]), 'c-cpp').file, true);
  assert.equal(reach(stream([use('d', 'Bash', { command: 'cat /c/Projects/Bearingkit/skills/bk-build/references/stacks/c-cpp.md' })]), 'c-cpp').file, true);
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\node.md` })]), 'c-cpp').file, false);
});

test('cpp-01: the task names its toolchain, its two commands and the permission the source skill needs', () => {
  const task = loadTask('cpp-01');
  assert.equal(task.pathPrepend, 'C:/msys64/ucrt64/bin');
  assert.deepEqual(Object.keys(task.commands), ['K', 'S'], 'F has no command: it runs on the plain prompt, by a call of its own');
  assert.ok(task.permissions.allow.includes('Skill(fullstack-dev-skills:cpp-pro)'));
  assert.deepEqual(task.rules.defects.filter((d) => /^H\d$/.test(d.id)).map((d) => d.id), ['H1', 'H2', 'H3', 'H5'], 'four hazards; H4 of the design is not built');
  assert.deepEqual(task.rules.defects.filter((d) => !d.optional).map((d) => d.id), ['O1', 'O2']);
});

const write = (dst, rel, text) => { fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true }); fs.writeFileSync(path.join(dst, rel), text); };

// src/main.cpp with the `total` command, with one care dropped per option.
const main = (drop = {}) => `#include <charconv>
#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <optional>
#include <sstream>
#include <string>
#include <string_view>
#include <vector>

#include "meterlog/files.hpp"

namespace {

struct Reading {
    std::string id;
    std::int64_t value;
};

std::optional<Reading> parseLine(std::string_view line) {
    const auto comma = line.rfind(',');
${drop.refuse ? '    return Reading{std::string(line.substr(0, comma)), std::stoll(std::string(line.substr(comma + 1)))};' : `    if (comma == std::string_view::npos || comma == 0) {
        return ${drop.nocomma ? 'Reading{std::string(line), 0}' : 'std::nullopt'};
    }
    const std::string_view digits = line.substr(comma + 1);
${drop.lenient ? '    const std::int64_t value = std::strtoll(std::string(digits).c_str(), nullptr, 10);' : `    std::int64_t value = 0;
    const auto [end, ec] = std::from_chars(digits.data(), digits.data() + digits.size(), value);
    if (ec != std::errc{} || end != digits.data() + digits.size() || value < 0) {
        return std::nullopt;
    }`}
${drop.id ? '    std::string id;\n    std::istringstream(std::string(line.substr(0, comma))) >> id;\n    return Reading{id, value};' : '    return Reading{std::string(line.substr(0, comma)), value};'}`}
}

int total(const char* path) {
    std::ifstream in(path);
    if (!in) {
        std::cerr << "error: cannot open " << path << "\\n";
        return 1;
    }
    std::vector<Reading> readings;
    std::string line;
    std::string first;
    std::size_t number = 0;
    while (std::getline(in, line)) {
        ++number;
        if (number == 1) {
            first = line;
        }
        auto reading = parseLine(line);
        if (!reading) {
            std::cerr << "error: line " << ${drop.number ? '(number * 0 + 1)' : 'number'} << "\\n";
            return ${drop.code ? '1' : '2'};
        }
        readings.push_back(std::move(*reading));
    }
${drop.back ? "    const bool carriage = first.back() == '\\r';\n    (void)carriage;\n" : '    (void)first;\n'}${drop.warn ? '    int unused;\n' : ''}${drop.wide ? '    int sum = 0;' : drop.wrap ? '    std::uint32_t sum = 0;' : '    std::int64_t sum = 0;'}
${drop.empty ? `    const Reading* peak = &readings[0];
    for (const Reading& r : readings) {
        sum += ${drop.wide ? 'static_cast<int>(r.value)' : 'r.value'};
        if (r.value > peak->value) {
            peak = &r;
        }
    }
    std::cout << "total " << sum << "\\n";
    std::cout << "peak " << peak->id << " " << peak->value << "\\n";` : `    const Reading* peak = nullptr;
    for (const Reading& r : readings) {
        sum += ${drop.wide ? 'static_cast<int>(r.value)' : drop.wrap ? 'static_cast<std::uint32_t>(r.value)' : 'r.value'};
        if (peak == nullptr || r.value > peak->value) {
            peak = &r;
        }
    }
${drop.order ? '    if (peak != nullptr) {\n        std::cout << "peak " << peak->id << " " << peak->value << "\\n";\n    }\n    std::cout << "total " << sum << "\\n";' : '    std::cout << "total " << sum << "\\n";\n    if (peak != nullptr) {\n        std::cout << "peak " << peak->id << " " << peak->value << "\\n";\n    }'}`}
    return ${drop.loud ? '(sum == 600 ? 3 : 0)' : '0'};
}

}  // namespace

int main(int argc, char** argv) {
    if (argc == 3 && std::string(argv[1]) == "count") {
        std::cout << "lines " << meterlog::countLines(argv[2]) << "\\n";
        return 0;
    }
    if (argc == 3 && std::string(argv[1]) == "total") {
        return total(argv[2]);
    }
    std::cerr << "usage: meterstat count|total <file>\\n";
    return 1;
}
`;

// What a first draft looks like: int everywhere, std::stoi with nothing around it, the first element taken for the
// peak, a signed loop index.
const NAIVE = `#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#include "meterlog/files.hpp"

int total(const char* path) {
    std::ifstream in(path);
    std::vector<std::string> ids;
    std::vector<int> values;
    std::string line;
    while (std::getline(in, line)) {
        int comma = line.find(',');
        ids.push_back(line.substr(0, comma));
        values.push_back(std::stoi(line.substr(comma + 1)));
    }
    int sum = 0;
    int peak = 0;
    for (int i = 0; i < values.size(); i++) {
        sum += values[i];
        if (values[i] > values[peak]) peak = i;
    }
    std::cout << "total " << sum << "\\n";
    std::cout << "peak " << ids[peak] << " " << values[peak] << "\\n";
    return 0;
}

int main(int argc, char** argv) {
    if (argc == 3 && std::string(argv[1]) == "count") {
        std::cout << "lines " << meterlog::countLines(argv[2]) << "\\n";
        return 0;
    }
    if (argc == 3 && std::string(argv[1]) == "total") {
        return total(argv[2]);
    }
    std::cerr << "usage: meterstat count|total <file>\\n";
    return 1;
}
`;

const H = ['H1', 'H2', 'H3', 'H5'];
// The same task and test run on the branch without the stack file (K-before of the planned registration).
const HAS_FILE = fs.existsSync(path.join(__dirname, '..', 'skills', 'bk-build', 'references', 'stacks', 'c-cpp.md'));
const pick = (o, keys) => keys.map((k) => o[k]);

test('cpp-01: the fixture is what the design says, and the scorer tells the hazards apart', { timeout: 900000 }, (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp01-fx-'));
  const dst = path.join(dir, 'cpp-01');
  try {
    build.build({ dst });
    const profile = detect(dst);
    assert.deepEqual([profile.languages, profile.guardrails, profile.stackFiles.map((f) => path.basename(f))], [['c-cpp'], ['cmake --build build', 'ctest --test-dir build'], HAS_FILE ? ['c-cpp.md'] : []], 'a CMake tree: the profile names c-cpp.md where the kit has it (K-after), and nothing where it does not (K-before)');

    let first;
    try { first = build.check(dst); } catch (e) {
      if (e.code === 'ENOENT') { t.skip(`no C++ toolchain to build the fixture: ${e.message}`); return; }
      throw e;
    }
    assert.deepEqual([first.built, first.O2], [true, true], 'untouched: it builds and its tests are green');
    assert.deepEqual([first.O1, first.X, ...pick(first, H), first.H, first.P4], [false, false, false, false, false, false, 0, 0], 'no total command yet: nothing passes, the control included');

    const scored = (text) => { write(dst, 'src/main.cpp', text); return build.check(dst); };
    const only = (r, failing, what) => assert.deepEqual([r.O1, r.O2, r.X, ...pick(r, H)], [true, true, true, ...H.map((h) => !failing.includes(h))], what);

    const naive = scored(NAIVE);
    assert.deepEqual([naive.O1, naive.O2, naive.X, ...pick(naive, H), naive.H], [true, true, true, false, false, false, false, 0], 'the naive draft does the happy path and fails every hazard');
    assert.ok(naive.badExit.every((c) => ![0, 1, 2].includes(c)), 'naive: an unreadable line ends the program abnormally');
    assert.ok(![0, 1, 2].includes(naive.emptyExit) && ![0, 1, 2].includes(naive.bigExit), 'naive: the empty file and the large sum end in a trap or an abort');

    const ref = scored(main());
    only(ref, [], 'the reference passes every hazard and the control');
    assert.deepEqual([ref.H, ref.badExit, ref.bigExit, ref.emptyExit, ref.P4], [4, [2, 2], 0, 0, 0]);

    only(scored(main({ warn: true })), ['H1'], 'an unused variable fails H1 only');
    const wide = scored(main({ wide: true }));
    only(wide, ['H2'], 'a 32-bit signed sum fails H2 only');
    assert.ok(![0, 1, 2].includes(wide.bigExit), 'the signed overflow traps');
    const wrap = scored(main({ wrap: true }));
    only(wrap, ['H2'], 'a 32-bit unsigned sum does not trap and still fails H2: the total is wrong');
    assert.equal(wrap.bigExit, 0);
    const empty = scored(main({ empty: true }));
    only(empty, ['H3'], 'the first element taken with no check fails H3 only');
    assert.ok(![0, 1, 2].includes(empty.emptyExit));
    // The last character of the first line, taken with no check: on an empty file nothing crashes without the
    // library's assertions, so this variant is what shows the scorer builds with them.
    const back = scored(main({ back: true }));
    only(back, ['H3'], 'the last character of an empty first line fails H3 only');
    assert.equal(build.chose(back.emptyExit), false);
    only(scored(main({ refuse: true })), ['H5'], 'std::stoll with nothing around it fails H5 only');
    only(scored(main({ number: true })), ['H5'], 'the wrong line number fails H5 only');
    const code = scored(main({ code: true }));
    only(code, ['H5'], 'exit 1 where 2 was asked fails H5 only');
    assert.deepEqual(code.badExit, [1, 1]);
    const lenient = scored(main({ lenient: true }));
    only(lenient, ['H5'], 'a value that is not a number read as 0 fails H5 only');
    assert.deepEqual(lenient.badExit, [2, 0], 'the line with no comma is still refused');
    const nocomma = scored(main({ nocomma: true }));
    only(nocomma, ['H5'], 'a line with no comma taken as a reading of 0 fails H5 only');
    assert.deepEqual(nocomma.badExit, [0, 2], 'the value that is not a number is still refused');

    const id = scored(main({ id: true }));
    assert.deepEqual([id.O1, id.X, ...pick(id, H)], [true, false, true, true, true, true], 'an id read up to the first space fails the control only');

    // An exit code that is not zero on the happy path is not the happy path, and takes every gated id with it: this
    // variant is right on every other input the scorer uses.
    const loud = scored(main({ loud: true }));
    assert.deepEqual([loud.O1, loud.X, ...pick(loud, H), loud.H, loud.O2], [false, false, false, false, false, false, 0, true], 'a non-zero exit on the happy path passes nothing');
    assert.deepEqual([loud.badExit, loud.bigExit, loud.emptyExit], [[2, 2], 0, 0], 'and only the happy path was wrong');
    // The peak printed before the total is not what was asked either.
    const order = scored(main({ order: true }));
    assert.deepEqual([order.O1, order.X, order.H], [false, false, 0], 'the two lines in the other order pass nothing');
    // A tree that does not compile passes nothing, its own tests included.
    const broken = scored(`${main()}\nthis is not C++\n`);
    assert.deepEqual([broken.built, broken.O1, broken.O2, broken.X, broken.H], [false, false, false, false, 0], 'a tree that does not build passes nothing');

    // P4 and O2: a file outside src/, include/ and tests/, and a red test the session added.
    write(dst, 'src/main.cpp', main());
    write(dst, 'tools/extra.cmake', '# x\n');
    write(dst, 'NOTES.md', 'x\n');
    write(dst, 'tests/total_test.cpp', 'int main() { return 1; }\n');
    fs.appendFileSync(path.join(dst, 'CMakeLists.txt'), 'add_executable(total_test tests/total_test.cpp)\nadd_test(NAME total COMMAND total_test)\n');
    const red = build.check(dst);
    assert.deepEqual([red.O2, red.P4, red.P4out, red.O1, red.H], [false, 1, true, true, 4], 'a red test fails O2; one path outside counts, root notes do not');

    // A tree whose tests were taken out has no green suite.
    const lists = fs.readFileSync(path.join(dst, 'CMakeLists.txt'), 'utf8');
    fs.writeFileSync(path.join(dst, 'CMakeLists.txt'), lists.split('\n').filter((l) => !/add_test|enable_testing/.test(l)).join('\n'));
    assert.equal(build.check(dst).O2, false, 'no test left: O2 does not hold');

    assert.deepEqual([build.chose(0), build.chose(2), build.chose(255), build.chose(256), build.chose(3221226505), build.chose(null), build.chose(-1)], [true, true, true, false, false, false, false], 'an exit code is 0 to 255; a trap or an abort is not one');
    assert.deepEqual(build.reset({ dst }).head, build.reset({ dst }).head);
    assert.equal(fs.existsSync(path.join(dst, 'tests/total_test.cpp')), false, 'reset removes what a session added');
    assert.doesNotMatch(fs.readFileSync(path.join(dst, 'src/main.cpp'), 'utf8'), /total/, 'reset restores what a session changed');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
