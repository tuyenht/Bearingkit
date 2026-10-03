# Module design

Adapted from mattpocock/skills (MIT): `skills/engineering/codebase-design/SKILL.md` and `DEEPENING.md`, commit `3cca18b`; attribution in `NOTICE`. Kept: the vocabulary of depth, the deletion test, the interface as the test surface, the rule on seams, internal against external seams, the four dependency categories, and replace-don't-layer. Not carried: parallel design sub-agents, the source's lists of words to avoid, and its terms "leverage" and "locality" (what depth gives callers and maintainers).

Open this when the design adds a module or changes where one ends. It extends "Design for isolation" in `brainstorming.md`.

## Words

- **Module**: anything with an interface and an implementation, at any scale (a function, a class, a package, a slice across tiers).
- **Interface**: everything a caller must know to use it correctly: the signature, and also invariants, ordering, error modes, configuration and performance.
- **Depth**: how much behaviour a caller or a test can reach per unit of interface it must learn. **Deep**: a lot behind a small interface. **Shallow**: an interface nearly as complex as what it hides.
- **Seam**: the place where behaviour can be changed without editing there; where a module's interface lives. **Adapter**: something that fills a seam.

## Tests of a design

- **Deletion test.** Imagine deleting the module. If the complexity vanishes, it was a pass-through. If it reappears across its callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. A test that has to reach past the interface says the module has the wrong shape.
- **One adapter is a hypothetical seam; two adapters are a real one.** Do not add a seam unless something actually varies across it, typically production and test.
- **Internal seams stay internal.** A deep module may have seams of its own that its tests use; do not expose them through the interface just because tests use them.
- When shaping an interface: fewer entry points, simpler parameters, more hidden inside. Accept dependencies rather than create them; return results rather than mutate the caller's state.

## Dependencies decide how it is tested

1. **In process** (pure computation, memory): merge and test through the new interface directly; no adapter.
2. **Local stand-in exists** (an in-memory database, a fake file system): test with the stand-in; the seam stays internal.
3. **Remote but owned** (your own services): a port at the seam, the transport injected as an adapter; tests use an in-memory adapter.
4. **True external** (a third party): injected as a port; tests use a mock adapter.

## When modules are merged or deepened

Replace, do not layer: tests on the old shallow modules become waste once tests exist at the deepened module's interface, and are deleted. New tests assert observable outcomes through the interface, not internal state, and survive internal refactors: a test that must change when the implementation changes is testing past the interface.
