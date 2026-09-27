# Minimal C++ toolchain on Windows for measuring `c-cpp.md` (2026-09-27, research only, nothing installed)

Question 38 (c) of `docs/specs/2026-09-12-d5-owner-questions.md`: before the owner decides whether to install a toolchain, find the smallest reversible one that builds and runs a small C++17 project with CMake and CTest on Windows 11 x64. Checked on the owner's machine the same day: no `gcc`, `g++`, `clang`, `cl`, `cmake`.

Method: one Sonnet research agent (`bk-researcher`), web and vendor documentation only, no download, no install. Its report is condensed below with its own confidence labels; nothing here was re-verified by the main session, so every size and id is a lead to confirm before any install.

| Option | Pieces | CMake, Ninja, CTest | Admin | Uninstall | Pitfalls | Confidence |
|---|---|---|---|---|---|---|
| VS 2022 Build Tools, C++ workload | winget `Microsoft.VisualStudio.2022.BuildTools` with `--add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.CMake.Project` | bundled, an older CMake | yes | installer entry | Windows SDK must be selected or linking fails; licence: free for building open-source code, own proprietary code needs a qualifying (Community-eligible or paid) licence | ids and licence from Microsoft pages (verified per the agent); size not found |
| LLVM | winget `LLVM.LLVM` | not included | — | installer entry | does not ship a C runtime or linker on Windows: needs Build Tools or a MinGW sysroot, so it is an add-on, not a toolchain | id verified; the dependency from secondary sources |
| MSYS2 UCRT64 | winget `MSYS2.MSYS2`, then `pacman -S mingw-w64-ucrt-x86_64-gcc mingw-w64-ucrt-x86_64-cmake mingw-w64-ucrt-x86_64-ninja` | from pacman; CTest ships in cmake | per-user install reported, not confirmed | registered uninstaller | MinGW ABI (irrelevant for a self-contained CLI with tests); size not verified | winget id and package names verified per the agent; admin and size medium to low |
| WinLibs (MinGW-w64 GCC zip) | winget `BrechtSanders.WinLibs.POSIX.UCRT` and variants | varies | no | none: delete the folder, clean PATH by hand | no uninstaller entry | secondary |

**The agent's recommendation**: MSYS2 UCRT64 — self-contained, no licence nuance, registered uninstaller. The deciding trade-off: Build Tools gives the native MSVC ABI but carries the licence question and an elevated, heavier install.

**Open before any install**: the installed size of the minimal MSYS2 set and of the minimal Build Tools set (no official figure found); whether MSYS2 needs admin on this machine; the exact commands a measured session would be allowed to run (`cmake`, `ctest`), which go into the task's permissions. The install itself is the owner's decision (question 38 (c)); this file is its input.
