# Kotlin

**Written against:** Kotlin 2.0 and Gradle Kotlin DSL, taken from this repository's own stack fixture (`tests/fixtures/stacks/kotlin/build.gradle.kts`, which pins `kotlin("android") 2.0.0`). **Cross-checked against a live project: no.** No Kotlin project exists on the machine this file was written on, so the pin above is fixture level and nothing here claims to describe a release after it. The first real project that reads this file refreshes this line from its own `detect-stack` output; syntax newer than the pinned major goes through the pinned-documentation rule in `bk-protocol/references/evidence.md` first.

**Read as a starting point, not vendored:** PatrickJS/awesome-cursorrules (CC0-1.0) Ktor and Spring Boot sets. The text here is the kit's own, and deliberately ecosystem-level: a project's own framework conventions — its error type, its module layout, its ORM — come from that project's instruction files, never from this file.

## Concurrency is where the bugs are

- **Structured concurrency or nothing.** A coroutine launched into a scope nobody owns outlives the work that started it. `GlobalScope` in a diff is a finding; the scope of the component that owns the lifetime is the answer.
- **Cancellation is cooperative, and `runCatching` breaks it.** `runCatching` catches every `Throwable`, and `CancellationException` is one: a suspend function wrapped in it stops being cancellable and the failure is silent. Rethrow the cancellation, or use a result type that never swallows it.
- **A suspend function that blocks is a lie.** Blocking IO inside a coroutine on a dispatcher sized for CPU work starves everything sharing it. Blocking calls go to an IO dispatcher explicitly.
- **Flow is cold until collected.** Work written above the first `collect` does not run when the author thinks it does, and a flow collected twice does its work twice.

## Types and null

- **The nullable type is the documentation.** `!!` discards it and converts a compile-time fact into a crash; a diff containing one needs the reason in the same line, or the null handled.
- **Sealed hierarchies over enums plus casts.** An exhaustive `when` over a sealed type is checked by the compiler; a `when` with an `else` that "cannot happen" is the branch that will.
- **Data classes are values.** A data class holding a mutable collection is not one, and `copy()` will hand two owners the same list.

## Build and evidence

- The Gradle version catalogue is the single place versions live; a version string inline in one module is drift waiting to happen.
- Evidence for this stack: the test task's output pasted in full, and for a behaviour change the failing run before the passing one. A green `build` alone says the code compiles, which is not the claim under review.

## Guardrails `detect-stack` will name

The Gradle test task when a `build.gradle.kts` is present. If the project adds a formatter or a static analyser — ktlint, detekt — it belongs in the same guardrail list, and until `detect-stack` learns to spot them the project's instruction files are where the acting skill finds them.
