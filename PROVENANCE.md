# Provenance — what is borrowed, what is ours

Bearingkit learned from other people's skills, and it says so openly. This page answers the obvious question — *"isn't it just a copy?"* — with numbers you can recount yourself. [`NOTICE`](NOTICE) is the legal record the licences require; this page is the plain-language account.

## The short answer

- **Borrowed text is confined and rewritten.** Adapted text sits in 19 `references/` files across ten components. Each adapted file, or its `NOTICE` entry, names the source, what was taken and what was deliberately left out. A few borrowed *rules* (not text) also appear, paraphrased, in the protocol body; they are named below.
- **Eight of the eighteen components carry no borrowed text.** The eighteen are 17 skills plus the protocol. Of the eight, three are kit-original and five are built from ideas only.
- **What makes it a kit is ours.** The protocol was written here, with named exceptions. So were the reconciliation of overlapping sources, per-project activation on several hosts, the Vietnamese routing and the measurement harness.

## In numbers

These were counted on 2026-10-08 from this repository. The commands are at the end of this page.

| | Count |
|---|---|
| Sources studied (`upstream/sources.json`) | 23: 5 adapt, 6 ideas-only, 12 reference |
| Sources whose text appears in the kit, with a notice | 3: obra/superpowers (MIT), anthropics/claude-plugins-official (Apache-2.0), mattpocock/skills (MIT) |
| Source items inventoried one by one, each with a decision and a reason (`docs/specs/2026-09-18-item-inventory.md`) | 1,295 from 22 of the sources: 46 to adapt, 610 ideas, 639 dropped |
| Markdown files in `skills/` | 117 |
| …that carry adapted text | 19 `references/` files. They hold about a third of the words in `skills/`, all rewritten in the kit's form |
| Components with no adapted text | 8 of 18 |
| Installer, activation, eval and benchmark tooling (`bin/`, `scripts/`, `hooks/`) | about 3,100 lines. The code is kit-written; the hook and host manifests follow Superpowers' shapes (see below) |
| Automated tests (`tests/`) | 30 test files, about 5,100 lines |
| Activation prompts (`evals/activation/phase-1.jsonl`) | 96, of which 44 are in Vietnamese |
| Benchmark tasks with fixtures and scoring (`evals/bench/`) | 15 |

## Component by component

| Component | Adapted text (with notice) | Ideas and rules taken without text |
|---|---|---|
| `bk-protocol` | Superpowers' using-superpowers, in `references/meta-routing.md` | The router keeps Superpowers' "skill first", one-percent and process-before-implementation rules. The definition of done carries its verification-before-completion rule. The autonomy gate, evidence rules, hot paths and security baseline are kit-written |
| `bk-spec` | Superpowers' brainstorming | — |
| `bk-plan` | Superpowers' writing-plans; mattpocock's to-tickets (vertical slices) | — |
| `bk-build` | Superpowers' executing-plans; Anthropic's code-modernization (major upgrades) | Two lines paraphrased from karpathy-skills |
| `bk-test` | Superpowers' and mattpocock's TDD; Anthropic's pr-test-analyzer and test-engineer | — |
| `bk-debug` | Superpowers' systematic debugging; mattpocock's diagnosing-bugs | — |
| `bk-review` | Superpowers' review exchange; Anthropic's code-review, pr-review-toolkit and security-guidance; mattpocock's code smells | addyosmani/agent-skills, jeffallan/claude-skills |
| `bk-ship` | Superpowers' branch-finishing and verification-before-completion | — |
| `bk-design` | Anthropic's frontend-design | — |
| `bk-map` | Anthropic's code-modernization (map, preflight, business rules) | Several sources, including one proprietary source used clean-room, from inventory rows only |
| `bk-audit`, `bk-close`, `bk-next` | none | Kit-original, from field lessons |
| `bk-db` | none | Ideas only, from several sources and the owner's own material, rewritten from scratch |
| `bk-ops`, `bk-perf`, `bk-research` | none | Ideas only, from several sources, rewritten from scratch. A proprietary third-party source was used clean-room, from inventory rows only |
| `bk-setup` | none | Ideas only, from Anthropic's claude-code-setup |

The exact source paths and commits are in `NOTICE` and `upstream/sources.json`, along with what each adaptation left out: hosted orchestration, vendor vocabulary, scripts, model calls, folder layouts and so on. Each skill's own `Sources:` line names its sources.

## What the kit adds

1. **One protocol over everything.** It has an autonomy gate (ACT and COUNCIL), a router that names the intent before any code is read, evidence rules with negative controls, one definition of done, a hot-path list that requires independent review, and a security baseline that may only tighten. The router and the definition of done carry Superpowers' rules, named above; the rest is kit-written.
2. **Reconciliation.** Where sources overlap or disagree, the kit kept one rule and recorded why. A stack of packs leaves that work to the user. The 639 dropped items are part of this work.
3. **A lifecycle that hands off.** Every lifecycle skill ends by naming the next one, and the chain stops at COUNCIL points.
4. **Vietnamese as a first-class language.** Every skill has Vietnamese trigger phrases, and 44 of the 96 activation prompts are in Vietnamese.
5. **Several hosts from one source, switched on per project.** Claude Code and the Antigravity 2.0 app are accepted. The installer, per-project activation and the Antigravity store are the kit's own code. The session-start hook and the host manifests follow the shapes of Superpowers' files of the same names, and `NOTICE` records this.
6. **Stack rules in the kit's own words** for TypeScript/React, Kotlin, SQL, Node, Python, PHP/Laravel and Shell. Each one starts from community rule sets that it names and is written against stated versions.
7. **A measurement harness.** It includes activation evals and benchmark tasks scored by running code and by mutation. The same harness runs the kit and its sources side by side, so "better" has to be earned rather than asserted.

## Is it actually better than the sources?

That has not been shown yet, and the kit does not claim it. On most of the tasks compared so far, the kit and its sources could not be told apart, and where cost was recorded the kit cost about 1.3–3× what its sources did per task (per-task figures in `docs/specs`). The full record is in [`docs/status.md`](docs/status.md).

What the kit offers today is one coherent, gated system in place of a stack of packs that you would otherwise assemble, reconcile and maintain yourself. Whether that system beats such a stack on outcome and cost is the next measurement, proposed in [`docs/specs/2026-10-08-kit-vs-stack-proposal.md`](docs/specs/2026-10-08-kit-vs-stack-proposal.md).

## Recount it yourself

```
# sources by mode, and the item inventory
node -e "const s=require('./upstream/sources.json').sources;const m={};for(const x of s){const k=x.mode.split(' ')[0];m[k]=(m[k]||0)+1}console.log(s.length,m)"
node scripts/inventory-items.cjs totals docs/specs/2026-09-18-item-inventory.md

# skill files, and those carrying adapted text (the derived keys under skills/)
find skills -name '*.md' | wc -l
node -e "const s=require('./upstream/sources.json').sources;const k=new Set();for(const x of s)for(const f of Object.keys(x.derived||{}))if(/^skills\/.*\/references\//.test(f))k.add(f);console.log(k.size,new Set([...k].map(f=>f.split('/')[1])).size+' components')"
grep -h "^Sources:" skills/*/SKILL.md

# tooling and tests
cat bin/* scripts/*.cjs scripts/*/* hooks/* 2>/dev/null | wc -l
ls tests/*.test.cjs | wc -l; cat tests/*.test.cjs | wc -l
```
