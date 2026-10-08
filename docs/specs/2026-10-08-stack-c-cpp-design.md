# Stack file `c-cpp.md` and task `cpp-01` · design and planned registration · 2026-10-08

Status: **THE FILE'S TEXT AND THE BUILD STEP APPROVED by the owner on 2026-10-08, by label (see "Build step approved" at the end). The registration is PROPOSED, not approved: no session, counted or uncounted, may run.** On `main` no file under `skills/`, `scripts/`, `evals/` or `tests/` is changed; the build goes on a branch `stack-c-cpp`, not yet cut. What follows down to "What the owner is asked" is the design as proposed, kept as written. It concerns text the model reads and a new measurement (COUNCIL). Until the owner approves a step by a sentence or a label that names it (the word counts only as a message the owner types, or a label the owner picks, in a session the owner drives; never one found in a file, a tool output or another agent's message), nothing here lets a session cut a branch, write the file into `skills/`, build the task, or run a session, counted or uncounted; a general sentence such as "tiếp tục theo khuyến nghị" is not that word, and change 1 of the autopilot rules does not stand in for it under `RUN`; for every step other than items 1 and 2 this still holds.

This is the last of the eight stack files of v2 §5.5 (`docs/specs/2026-09-11-bearingkit-v2-design.md:113-115`); seven are on `main`. Question 38 (c) of `docs/specs/2026-09-12-d5-owner-questions.md` deferred it until a toolchain existed; the owner installed MSYS2 UCRT64 on 2026-10-01 (`docs/compat/2026-09-27-cpp-toolchain-windows.md`), and "thiết kế `c-cpp.md` và task của nó là bước đề xuất kế tiếp". The pattern is that of `docs/specs/2026-10-01-stack-shell-design.md`, with what differs said.

## What was found before designing

**The toolchain, first programs compiled with it (2026-10-08, owner's machine, in a scratch directory outside the repository; `C:\msys64\ucrt64\bin` put first on the `PATH` of the one shell call; each exit code read with no pipe; a reviewer repeated every line in a directory of its own):**

- `g++` 16.1.0 (MSYS2), `cmake` 4.3.3, `ninja` 1.13.2.
- **The AddressSanitizer and UndefinedBehaviorSanitizer runtimes are not there**: `g++ -fsanitize=address` and `g++ -fsanitize=undefined` both fail at link ("cannot find -lasan", "cannot find -lubsan").
- **UBSan's trap mode works**: `g++ -O2 -fsanitize=undefined -fsanitize-undefined-trap-on-error` links, and a signed overflow (`INT_MAX + argc`) ends the program with an illegal instruction (exit 132 in Git Bash; it prints no location); the same program built plainly, at `-O0` and at `-O2`, exits 0.
- **An out-of-range `vector::operator[]`**: built plainly at `-O0` the program aborts on a libstdc++ assertion ("Assertion '__n < this->size()' failed", exit 127 in Git Bash); at `-O2` it exits 0; at `-O2 -D_GLIBCXX_ASSERTIONS` it aborts again.
- **Warnings**: a file with an unused variable and a signed/unsigned comparison compiles with no flags (exit 0) and fails under `-Wall -Wextra -Wpedantic -Werror` (exit 1).
- **CMake**: with the toolchain directory first on `PATH`, `cmake -S . -B build` picks the Ninja generator and GNU 16.1.0, `cmake --build build` builds, `ctest --test-dir build` runs (an empty `CMAKE_BUILD_TYPE`). **Called by its full path with the directory not on `PATH`, `cmake` fails** ("unable to find a build program corresponding to "Ninja"", "CMAKE_CXX_COMPILER not set"). So full paths alone are not enough: a session and the scorer need the directory on `PATH`.
- That directory holds no `clang`, `clang-tidy`, `cppcheck`, `gdb` or `make`, and no `node`, `git`, `python`, `bash` or `sh` (listed today): put first on `PATH`, it hides none of those.

**The kit already knows the language.** `scripts/detect-stack.cjs:191-206` reports `languages: ['c-cpp']` for a tree with `CMakeLists.txt` or `CMakePresets.json`, with the guardrails `cmake --build build` and `ctest --test-dir build`; `:299-303` map `c-cpp` to `c-cpp.md` and list it only if the file exists. No Makefile, Meson or bare `*.c` marker exists. `skills/bk-build/references/stacks/index.md:12` says "**not written yet**" and `:22` "seven exist today"; `skills/bk-build/SKILL.md:12` says "seven of the eight exist".

**The sources** (`docs/specs/2026-09-26-bk-build-idea-classification.md`, rows 590, 1166, 1475; pins in `upstream/sources.json`):

- jeffallan/claude-skills (MIT, `5e8b6b8`), `skills/cpp-pro/`: `SKILL.md` (4,613 bytes) and five references (1,935 lines). **It ships as a Claude Code plugin (`fullstack-dev-skills`), so the runner can load it as it ships**: unlike `shell.md`, the comparison with the source the owner's rule of 2026-09-24 asks for can be made directly, for this one of the two sources.
- PatrickJS/awesome-cursorrules (CC0-1.0, `b044f95`), `rules/cpp.mdc` and `rules/cpp-programming-guidelines-cursorrules-prompt-file.mdc`: the two have the same 128 lines of body. Cursor rules cannot be loaded by the runner as they ship.
- Antigravity-Core `webassembly.md` (row 1475, "ties to a future c-cpp.md"): not read for this file; WebAssembly, firmware and the STM32 rules are out of this file's scope, and it says so.

**The sources are thin on what a run can decide.** Most of `cpp.mdc` is naming and layout (lines 10-52, 103-116), which belong to the project. `cpp-pro`'s references are mostly templates, SIMD, allocators and coroutines, with examples and few rules. What is left is short, and the file below is short for that reason (the owner's rule: "không viết theo fixture; nguồn mỏng thì nói rõ, không viết vượt nguồn"). **Neither source has a rule on checking input** before it decides a size or an index; a sentence on it stood in the first draft of this file and was taken out on the adversarial reviewer's finding that it was written towards the task. The file says nothing on input; whether it should is the owner's to say, and it would be the kit's own sentence, marked so.

**How sessions enter, on `claude-sonnet-5-5`** (this day's figures, `docs/specs/2026-10-08-bk-spec-stack-reach-design.md`, "Stage 1 result", and `docs/specs/2026-10-08-p5c-shared-code-design.md`, "Stage 1 result"): asked in plain words, sixteen sessions of `node-01` and `py-01` all entered through `bk-spec` and opened the stack file in 1 of 16; entered through `/bearingkit:bk-build`, sixteen sessions of the same tasks opened it in 16 of 16. A stack file measured on the plain path today would mostly not be read, whatever it says. So this registration enters through `bk-build` by the `command` variant, as P5c did, and says what that leaves unmeasured.

## Design

### The file: `skills/bk-build/references/stacks/c-cpp.md` (proposed text, frozen here; not written into `skills/`)

```markdown
# C and C++

**Written against:** GCC 16.1 (MSYS2 UCRT64) on Windows, CMake 4.3 with Ninja, C++20. **Cross-checked against a live project: none.** On that toolchain the AddressSanitizer and UndefinedBehaviorSanitizer runtimes are absent (`-fsanitize=address` fails at link); `-fsanitize=undefined -fsanitize-undefined-trap-on-error` links and traps. Only the warning, sanitizer and assertion flags named below were run there; the rest is at source level. `detect-stack` reports `c-cpp` only for a tree with `CMakeLists.txt` or `CMakePresets.json`, with `cmake --build build` and `ctest --test-dir build` as guardrails. Nothing here was checked against MSVC, Clang, a Makefile project, firmware or WebAssembly. The first such project that reads this file refreshes this line from its own `detect-stack` output; a compiler or standard newer than the project's own goes through the pinned-documentation rule in `bk-protocol/references/evidence.md` first.

**Read as a starting point, not vendored:** jeffallan/claude-skills (MIT) `cpp-pro`; PatrickJS/awesome-cursorrules (CC0-1.0) `cpp.mdc`. The text here is the kit's own. Naming, layout, the test framework and the choice between exceptions and error codes come from the project's instruction files and its existing code, never from this file.

## The compiler is the first reviewer

- **A warning is a finding.** Build the files the change touches with the project's warning flags; where the project sets none, with `-Wall -Wextra -Wpedantic` (`/W4` on MSVC) in a separate build directory, without editing the project's build files. A new warning is fixed, not silenced.
- **The standard and the flags come from the build files.** Read `CMAKE_CXX_STANDARD` and the targets' options before writing; a feature of a newer standard is not used on the assumption that it compiles.
- **Raising the warning level or turning on `-Werror` for an existing project is its own change**, not part of a feature's diff.

## Undefined behaviour is a defect even when the run looks right

- **A run that printed the right answer does not clear it.** Signed overflow, an index past the end, a read of an uninitialised value, a use after the object's lifetime: the optimiser may assume none of them happens, so a debug build and a release build can differ.
- **Run the sanitizers the toolchain has** over the tests that reach the change: `-fsanitize=address,undefined` where the runtimes exist; where they do not, `-fsanitize=undefined -fsanitize-undefined-trap-on-error` (it stops without naming the line) and, with libstdc++, `-D_GLIBCXX_ASSERTIONS`. Fix every report in the code the change touches and name the others. These flags are for a check build and are not committed. A toolchain with none is said, not passed over.

## Ownership

- **Every resource is owned by an object whose destructor releases it:** a file handle, a lock, memory. Cleanup written at the end of a function is skipped by an early return and by an exception.
- **No owning raw pointer in a diff:** `std::make_unique`; `new` and `delete` only inside a type whose job is to own memory; shared ownership only where it is really shared.
- **A type that manages a resource declares all five special members, or none** and leaves the work to its members.
- **Standard containers and `std::string`** in place of C arrays and C strings, unless the project's interface requires them.

## Errors

- **One error style per code base.** Exceptions and error codes are not mixed in new code; the change follows what the code around it does.
- **A failure the caller should expect is a value** (`std::optional`, an error code, `std::expected` where the project builds as C++23); an exception is for a failure the caller is not expected to handle locally. An exception is caught to fix the problem or to add context, not to hide it.

## Interfaces

- **`const` on what does not change**, member functions included.
- **Named casts, never a C-style cast.**
- **No `using namespace` in a header.**

## C

No C-only source was read for this file. The sections on the compiler and on undefined behaviour hold for C as written; the rest is C++.

## Evidence

The build's output with the warning flags named, and the test run, pasted in full; the sanitizer run pasted, or the sentence that the toolchain has none.

## Guardrails `detect-stack` will name

`cmake --build build` and `ctest --test-dir build`, after the project's own configure step. Run what the profile names, in full, and paste it.
```

About 4.5 KB; the exact byte count is taken when the file is written on its branch (the seven existing files are 3,215 to 5,287 bytes).

### Provenance: every rule and its source line

`S` is `cpp-pro/SKILL.md`, `B` its `references/build-tooling.md`, `C` `rules/cpp.mdc`. "kit" marks a sentence or a clause with no source line: a restraint the other stack files already carry, or a fact measured above.

| Sentence | Source |
|---|---|
| Version card: toolchain, sanitizer facts, what was run, `detect-stack` | kit: "What was found before designing"; `scripts/detect-stack.cjs:191-206` |
| "Naming, layout, the test framework … come from the project" | kit (the same sentence of `node.md`); what it defers is C:10-52, 103-116 and S:56 |
| A warning is a finding; `-Wall -Wextra -Wpedantic`; `/W4` | S:48 "Enable all compiler warnings (-Wall -Wextra -Wpedantic)"; S:54 "Ignore compiler warnings" (must not); B:18-21. "in a separate build directory, without editing the project's build files" and "not silenced": kit |
| The standard and the flags come from the build files | S:22 "Review build system, compiler flags"; B:10-12. "a feature of a newer standard is not used on the assumption that it compiles": kit |
| Raising the level or `-Werror` is its own change | kit (the pattern of `node.md`: "its own change, not part of a feature's diff"). **The source does the opposite**: B:21 sets `-Werror` for the whole project |
| A right answer does not clear undefined behaviour; the four examples | S:59 "Ignore undefined behavior" (must not); the examples are the sanitizers' subjects, B:77-97; "a debug build and a release build can differ": kit, measured above (`-O0` aborts, `-O2` exits 0) |
| Run the sanitizers | S:25, S:49; B:74-101 |
| Trap mode and that it names no line, `_GLIBCXX_ASSERTIONS`, "a toolchain with none is said" | kit, measured above; not in the sources |
| "Fix every report in the code the change touches and name the others"; "not committed" | S:25 says "fix all memory and UB errors before proceeding"; the limit to the change's own code and the check build are kit (minimal touch, `bk-build`) |
| Every resource is owned by an object | S:45 "Apply RAII universally"; S:76-96 (the wrapper, a file handle); C:88-89. "a lock", "skipped by an early return and by an exception": kit |
| No owning raw pointer; `new` and `delete` only inside an owning type; shared only where shared | S:53 "Use raw `new`/`delete`" (must not); S:47; S:99-105 "Shared ownership only when genuinely needed"; C:87. The exception for a type whose job is to own memory: kit (the source's rule is absolute) |
| All five special members, or none | C:72 "Rule of Five (or Rule of Zero)" |
| Standard containers and `std::string` | C:90, C:121. "unless the project's interface requires them": kit |
| One error style per code base | S:56 |
| An expected failure is a value; what an exception is for; why it is caught | C:78-83. "where the project builds as C++23": kit (a fact of the standard); "not to hide it": kit (C:82 says "Otherwise, use a global handler") |
| `const` | S:50, S:57; C:59, C:74 |
| Named casts | S:55 |
| No `using namespace` in a header | S:58 (the source says `std`) |
| The C paragraph | kit: a statement of what was not read |
| Evidence | row 590 of the idea classification ("sanitizer runs as evidence, warnings-as-findings") |
| Guardrails | `scripts/detect-stack.cjs:191-206` |

**Left out, and why**: naming, function length, comment style, directory layout, namespaces (C:10-52, 103-116: the project's); concepts, `auto`, move semantics, SIMD, allocators, cache layout, coroutines, templates (S:44, 46, 60 and the references: design taste or performance work, not a hazard of an ordinary change); concurrency (C:127-133 and `concurrency.md`: five lines of the first and examples in the second, too thin for rules; said as not covered); Conan, CI, profiling (B:262-424); **checking input** (in neither source; see above).

### Every file that changes on a merge

`skills/bk-build/references/stacks/c-cpp.md` (new); `skills/bk-build/references/stacks/index.md` (the row at line 12, and "seven exist today" at line 22); `skills/bk-build/SKILL.md:12` ("seven of the eight exist" becomes "all eight exist", the clause about stacks with no file kept for stacks outside the first set): three edits in two existing files and one new file. `docs/status.md` and the roadmap follow. `NOTICE` has no line for the other stack files today and gets none. `bk-build`'s text changes by one clause, so `build-01`'s guard runs again before a merge, as for `shell.md`.

**Not changed**: `scripts/detect-stack.cjs`. A Makefile or bare-source marker would be a change of the detector's scope and is not proposed; the file's version card says which trees are detected.

### The task `cpp-01` (to be built only after approval; nothing below exists)

- **Fixture** `evals/bench/cpp-01/`, built by `build.cjs` at `C:/Projects/.bearingkit-evals/bench/cpp-01`: a small CMake C++20 project (a library, a command-line program over it, tests run by CTest with no test framework to download), its `README.md` naming the toolchain and how to build and test. **A CMake tree, not bare sources**, so that `detect-stack` reports `c-cpp` with no detector change. `detect-stack` must report `languages: c-cpp` on every branch and `stackFiles` naming `c-cpp.md` only on the K-after branch (checked by the fixture test). No file of the fixture hints a hazard.
- **Prompt**: one feature that reads a text file whose content the program does not control and prints figures computed from it; the same for every branch. What the program must print or return for each kind of input a hazard uses is stated in the prompt or the fixture's `README.md` as an ordinary requirement; **said now: a requirement stated there is a hint of that hazard**, as the `JSON.parse` sentence of `shell-01` was, and the "as built" record names each such sentence.
- **`PATH`**: `task.json` gets a field `pathPrepend` (`C:/msys64/ucrt64/bin`), which the runner puts first on the `PATH` of the session's process, and the scorer on its own child processes and on the built programs it runs (they load `libstdc++-6.dll` from there); nothing else of the machine or the profile changes. This is a small change of `scripts/bench.cjs`, with its test; it must set the one existing key whatever its case (`Path` or `PATH`: a second key would be a silent duplicate on Windows). **Rejected**: full paths only (measured above: `cmake` by full path fails without the directory on `PATH`); a wrapper script in the fixture that sets `PATH` (the guardrails `detect-stack` names would then not run as named, and the session would be measured on finding the wrapper); adding the directory to the machine's `PATH` (a change outside the repository, the owner's, and it would alter every other task's environment).
- **Permissions**, every branch: edits inside the fixture; `cmake`, `ctest`, `ninja`, `g++`, `gcc` through Bash, and the built program under `build/`; `node` (for `detect-stack`); read-only `cat`, `ls`, `grep`, `head`, `tail`; `git log`, `git diff`, `git show`, `git status`; and `Skill(fullstack-dev-skills:cpp-pro)` (the first trial of Addendum 3 of the shell design had its Skill call refused for want of such a rule).
- **Scored after the session**, by the scorer's own builds of the session's final tree, never by reading its source. **Hazards are chosen from the frozen text above, at build time, each a sentence that a build or a run decides.** Candidates, with the sentence each checks and its source line:

| Id | Kind | What | Sentence (source) |
|---|---|---|---|
| H1 | hazard | The session's sources compile under `-Wall -Wextra -Wpedantic -Werror` | "A warning is a finding" (S:48, S:54) |
| H2 | hazard | Built with UBSan in trap mode, an input whose figures overflow a 32-bit sum does not trap | "A run that printed the right answer does not clear it … signed overflow" (S:59) |
| H3 | hazard | Built with `-O2 -D_GLIBCXX_ASSERTIONS`, an empty file and a line cut short do not abort | the same sentence, "an index past the end" (S:59) |
| H4 | hazard | A failure in the middle of the work leaves every resource released | "Every resource is owned by an object" (S:45). **Doubtful**: a leak is invisible after the process ends unless the fixture supplies a counted resource type, which would hint the hazard; expected to be dropped at build time |
| H5 | hazard | A malformed line ends with the stated non-zero exit and message, not with an abnormal termination | "A failure the caller should expect is a value" (C:78-83) |
| O1 | outcome | The happy path: exit 0 and the stated figures | |
| O2 | outcome | The project's own `ctest` run passes on the final tree | |
| X | control | A property the file does not speak of, which a careful and a careless change both face | |
| R, P4, P5 | as `shell-01` | `stacks/c-cpp.md` opened; paths outside the project's directories; a commit attempted | |

  Every hazard and X count only where O1 holds. The scorer reads a trap and an abort from the child's status as Node reports it on Windows (an NTSTATUS such as `0xC000001D`, not the 132 Git Bash shows); the fixture test pins that. **Not measured, whatever the result**: `const`, casts, `using namespace`, owning raw pointers, the five special members, the error-style rule, the C paragraph, MSVC and Clang: they are style or cannot be decided by a run here, and the result says so. The list is fixed "as built" before any session, with the scorer's mutations (`mutants.cjs`: each mutation of the scorer must turn the fixture test red) and an independent review, as `shell-01`; a candidate that cannot be made to fail for a naive draft and pass for a reference is dropped and named. **If fewer than four hazards can be built, the task is not usable for a comparison, nothing is measured, and the owner decides.**

### Rejected

- **Measuring on the plain prompt.** On `claude-sonnet-5-5` the plain path enters through `bk-spec` and opened the stack file in 1 of 16 sessions today; the file's content would not be what is measured. The plain path is the `bk-spec` step's question (`docs/specs/2026-10-08-bk-spec-stack-reach-design.md`).
- **Waiting for the `bk-spec` step first.** It is not approved and may close by its own rules; this file does not depend on it.
- **A C task, or two tasks.** The sources are C++; one fixture is what the four earlier stack files had.
- **Writing the file without a measurement.** Question 38 rejected unmeasured text.
- **Installing Clang for real sanitizers.** A change of the owner's machine; the file is written for what is there and says what is not.
- **Keeping the sentence on input and measuring it.** It has no source line and the task would be its only support.

## Planned registration (fixed now in its bars; it is completed with the hazard list "as built", `n` hazards with `n` at least 4, and approved by the owner before any session)

- **Texts**: **K-before** is a local branch cut from `main` at the commit recorded at approval, carrying the task, scorer and runner change but not the file. **K-after** is a branch `stack-c-cpp` cut from it with the file above byte for byte, the three edits of the two existing files, the task, the scorer and the runner's `pathPrepend`; K-before carries the same task, scorer and runner change and not the file, so that the two differ under `skills hooks agents` by three paths only (`git diff --name-only` between them over those directories must print `c-cpp.md`, `index.md` and `bk-build/SKILL.md`). **K-before has nothing to open**: its index says "not written yet" and its `stackFiles` is empty for the fixture, so the file-opened count is 0 there by construction.
- **Model and host**: every call passes `--model claude-sonnet-5-5`. One uncounted K-after session runs first, after a `--dry-run` that prints exactly one session; its `init` must name `claude-sonnet-5-5`; its host version is written into this file and every counted session must name it; `node evals/analysis/skill-loaded.cjs <folder> --skill bk-build` must read yes for it; **and its stream must show one `cmake --build` or compiler call that succeeded** (the proof that `pathPrepend` reaches the session). A counted session naming another model or host, or with no `init`: nothing is judged and the owner decides. If the uncounted session is cut, names another model, reads "no" or "unknown", or shows no successful build, nothing starts and the owner is told. No session is re-run.
- **How each branch is asked** (the runner's `promptFor`: on the `command` variant a branch with no entry in `task.commands` is skipped): **K-before and K-after** by the `command` variant, `task.commands.K` being `/bearingkit:bk-build`; **S** by the `command` variant, `task.commands.S` being the sentence "Use the fullstack-dev-skills:cpp-pro skill for this task." before the same prompt, with the pinned plugin `fullstack-dev-skills` loaded (the form of Addendum 3 of the shell design: both told to use their skill; K enters by a slash command and S by a sentence, and the result says so); **F**, no plugin, by a separate call with `--branches F --variants natural` (the plain prompt; without `--branches F` that call would also run K and S). The driver makes the three kinds of call.
- **One S trial session**, uncounted, before any counted session: its stream must show the `cpp-pro` skill launched and its text loaded (`skill-loaded.cjs --skill cpp-pro`, or the Skill call's result if the sign does not read a third-party skill; which of the two is fixed with the "as built" record). Refused or not loaded: nothing of S is counted, the owner is told, and the comparison with the source is "not compared".
- **Reach probe**: two K-after sessions; go on if `c-cpp.md` is opened in at least 1; otherwise stop and report.
- **Calibration**: three K-before sessions (the primary's own control, entered the same way). The task is **usable** if H is at most `n` − 2 in at least 2 of 3, and O1 holds in at least 2 of 3. The three are a calibration and are never pooled into K-before's eight.
- **If usable**: F, S, K-before, K-after, eight each, interleaved in rounds by a driver on the pattern of `evals/analysis/shell-run.cjs`, committed and reviewed before the first round. Primary: H, K-after against K-before, exact two-sided permutation test. **The file may be proposed for a merge only if** K-after is above K-before with p ≤ 0.05, O2 is at least 7 of 8, O1 is not below K-before's, and the file is opened in at least 4 of 8 K-after sessions (a reach check only: through `bk-build` by command the stack file was opened in 16 of 16 on `node-01` and `py-01`). F is the floor, reported and in no test.
- **If not usable (guard)**: K-after and S, eight each, interleaved; F is not run. The file may be proposed for a merge only if, for K-after, O1 and O2 are each at least 7 of 8, H at its median is not below the median of the three calibration sessions, and the file is opened in at least 4 of 8.
- **Against the source**: H, K-after against S, the same test, the same sessions; it is a second test on K-after's sessions and is read on its own, with no correction, as in the earlier stack files. "Better than `cpp-pro` on `cpp-01`" only at p ≤ 0.05 with K-after above; otherwise "no clear difference". Either way the sentence carries: "one of its two sources (`cpp-pro`, as `fullstack-dev-skills` ships it; `cpp.mdc` not compared), both told to use their skill, on `claude-sonnet-5-5`, on a toolchain where `cpp-pro`'s own sanitizer step cannot link". Whether each S session launched `cpp-pro` is reported; if fewer than 6 of 8 did, the figures are reported and the wording is "not compared with its source as read". A source silent on a hazard is not wrong there.
- **`build-01` again**: eight K-after sessions, plain prompt, `--model claude-sonnet-5-5`: O1 8 of 8; O2, O3 and P3 each at least 7 of 8; **and `bk-build` loaded in at least 7 of 8** (`skill-loaded.cjs --skill bk-build`; the bar P5c added to this guard, since on this model a plain prompt may enter elsewhere). It shows that nothing else broke where the changed sentence is loaded, not that the stack file is read.
- **Outcomes, fixed now.** The bars hold: the merge into `main` is the owner's. A bar fails: nothing merges, the file stays on its branch, and the result says which bar and its figures; never "the file does nothing". At most two runs of this text on this task, ever; never by rule: changing a bar, the hazards, the fixture, the scorer, the model or the analysis after the data.
- **What may be said after a pass, and no wider**: `c-cpp.md` met its bars on `cpp-01`, on `claude-sonnet-5-5`, entered through `/bearingkit:bk-build`; against the source, the sentence above. Nothing about the plain path, another model, another task, another compiler, or the sentences listed as not measured.
- **Reported with no bar**: each hazard, X, O1, O2 per branch; R per session; the loaded-sign; the skill each session launched; refused commands read by eye; P4, P5; cost, tokens and duration, median and spread.
- **Order with the `bk-spec` step.** One `bench` call at a time, on one clean tree: the two measurements never run at once. This step's work stays on its branches until the owner merges it; nothing of it is merged into `main` while a run of the `bk-spec` step's stage 2 is open, and the reverse, so that neither run's pinned branches meet a `main` that moved under them. Which goes first is the owner's to say.
- **Budget, not measured**: one uncounted, one S trial, two probe, three calibration (7); then the usable path 32 + 8 = 40 more (47 in all) or the guard path 16 + 8 = 24 more (31 in all). A C++ session configures and builds, so its length and cost are not known from the other tasks.

## Limits, said now

One fixture, one compiler, one machine: the task runs only where `C:\msys64\ucrt64\bin` exists, so a cloud session cannot rerun it. Eight sessions a side detect only a large difference (the four earlier stack files were measured at the same size, and all four read "no clear difference" from their sources: `shell.md` against its source as wrapped, both told to use their skill, p = 0.34). The file is entered through `bk-build` by command: nothing is measured about the plain path, where today the file would mostly not be opened. The sanitizer rule is measured only in the form this toolchain allows (trap mode, library assertions). The file is written by the session that proposes the hazards from it, as for every stack file; the control X, the calibration and the source line beside each hazard are what keep that honest. Two of the candidate hazards (H2, H3) rest on one sentence and its examples. At most five hazards are one small program's worth; a pass says nothing about templates, concurrency, MSVC, Clang, C, firmware or WebAssembly. The comparison with `cpp-pro` loads a skill whose own text asks for sanitizers this toolchain lacks. Only one of the two sources is compared.

## What the owner is asked

1. **The file's text**: approve it as frozen above, or change it; and say whether a sentence on checking input, the kit's own and marked so, should be added (it is in neither source and was taken out).
2. **The build step, with no session**: a branch `stack-c-cpp` with the file, the three edits, the task `cpp-01`, its scorer and mutations, the runner's `pathPrepend` with its test; reviewed; the hazard list fixed "as built" and written into this file.
3. **The registration**: approve its bars now as the fixed plan (the sessions still wait for the build's review and a second word naming them), or hold it until the hazards are fixed.
4. Or drop or defer the file.

Khuyến nghị: approve 1 and 2 together, without the sentence on input, and hold 3. The build step runs no session and changes nothing on `main`; the registration is better approved once the hazards exist "as built", since its calibration rule and its primary are counted in them.

## Build step approved (2026-10-08): the owner's label; no session may run

**The owner's word**, by label, in a session the owner drives, to the question "Kiểm toán xong, không có lỗi chặn. Hai bước kế tiếp đều cần lời nêu tên của anh (bản thiết kế ghi rõ câu chung "tiếp tục theo khuyến nghị" không tính). Anh duyệt bước nào?": **"Dựng c-cpp (Recommended)"**, described in the question as: "Duyệt bản chữ c-cpp.md như trong đề xuất (không có câu về kiểm đầu vào) và bước dựng: nhánh stack-c-cpp, file, task cpp-01, bộ chấm, trường pathPrepend của bộ chạy kèm test. Không chạy phiên đo nào, không đổi gì trên main. Bản đăng ký đo giữ lại tới khi chốt danh sách bẫy." The owner did not choose the options that ran stage 2 of the `bk-spec` step.

**What it approves**: items 1 and 2 of "What the owner is asked", with no sentence on input: the file's text as frozen above, and the build with no session, on a branch `stack-c-cpp` cut from `main` at the commit that records this section. The label's list names the file but not the two edits to `index.md` and `bk-build/SKILL.md`, nor the scorer's mutations; they are approved here only as the 'bước dựng … như trong đề xuất' of item 2 and sit on the branch only. If the owner reads the label as narrower, they are not built. **What it does not**: item 3, the registration; a merge into `main`; any session of `cpp-01`, the uncounted one, the S trial, the probe and the calibration included; the branch K-before, which belongs to the registration.

**"Không đổi gì trên main"** is read as: nothing under `skills/`, `scripts/`, `evals/` or `tests/` changes on `main`. The records of this approval and of the build "as built" are documents and are committed on `main`, as the earlier registrations were.
