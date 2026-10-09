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
