# Changing a live system: the pre-flight in detail

Ideas only, no text taken: c0x12c/ai-toolkit (deploy, env-setup, tf-plan, tf-deploy, tf-drift, tf-import, tf-cost, the infrastructure rules), jeffallan/claude-skills (devops-engineer, terraform-engineer, cloud-architect, kubernetes-specialist), tuyenht/Antigravity-Core (docker-expert, kubernetes-patterns, deployment-procedures), cloudflare/skills (wrangler, turnstile-spin, sandbox-migrate-to-next, cloudflare-one-migrations), addyosmani/agent-skills (ci-cd-and-automation, shipping-and-launch), mattpocock/skills (wizard), claudekit/claudekit-engineer (the deploy skill; proprietary, ideas written clean-room); field lessons L2, L10 and L12 of v1 §18. Rows: `docs/specs/2026-09-18-item-inventory.md`, target `bk-ops`.

## Name the target

Before any command: which account or project, which environment, which region, which resource. Say for each command whether it acts on the local machine or on the remote system; a tool that can do either (a CLI with a local development mode, for example) is the usual way a production change happens by accident. A target that cannot be named is a reason to stop, not to guess. The project's own files usually say where it deploys before anyone has to ask: a platform's configuration file, a container definition, an infrastructure directory, a pipeline that deploys on merge.

## The live system versus the repository

- Look for drift before changing anything: uncommitted edits in a server checkout, containers or processes no deploy started, settings changed in a web console. A deploy from the repository silently overwrites console changes; reconcile them first (field lesson L12).
- Compare the environments: which variables each one sets, by name only, never by value. A variable present in development and missing in production is the usual "works locally" failure; a default that works in one environment proves nothing about another.
- Compare the pipeline with the runtime: the package manager, the language version and the build tool the CI uses must be the ones the servers run (field lessons L2 and L10). A pipeline that is red for an environment reason stays red until someone reads why.

## Reading an infrastructure plan

- Save the plan and read it: what it creates, updates in place, replaces and destroys. The apply later runs that saved plan, nothing else.
- A replace is a destroy followed by a create. Ask why it happened: an attribute that cannot change in place, a renamed resource without a move declaration, a provider or module upgrade, an identifier computed from something that changed. A replace of anything that holds data (a database, a volume, a bucket, a queue with messages) stops the change until it is explained.
- Drift is triaged, not blindly reverted: a tag or a default added by the platform is benign; an opened network rule, a widened permission, disabled deletion protection or disabled encryption is a finding in its own right, reported before anything overwrites it.

## Infrastructure-as-code hygiene

- Provider and module versions are pinned; an upgrade is its own reviewed change, like a dependency major.
- State lives remotely, locked and encrypted, one state per environment. Operations that edit state directly (import, move, remove) are COUNCIL: they change what the tool believes exists.
- Bringing an existing resource under management: write the configuration to match it, import it, then repeat the plan until it proposes no change.
- Names and tags follow the project's own convention; allocation tags make cost visible per service.

## Rollout and the way back

- The rollback is written before the change, with what it restores and what it does not. Rolling back code does not roll back a migration, deleted data, a sent message or a connected resource.
- A dry run proves the build and the packaging, not the runtime.
- Artifacts are immutable and named by version or digest; "latest" is not a rollback target.
- A staged rollout assumes the old and the new version can run side by side. When they cannot, in either direction, make them compatible first or cut over at once with the owner's consent.
- After the change: a smoke test on the real endpoints, then the first checks against the baseline, with the thresholds for advancing, holding and rolling back written down before the change.

## Containers

- The image runs as a non-root user, is built in stages so the runtime image carries no build tools, and its base image is pinned by digest, not by a moving tag.
- Every workload declares its resource requests and limits and a readiness check separate from its liveness check; a liveness check that fails on a slow dependency restarts healthy instances in a loop.
- Before a rollout, read the orchestrator's permissions for the account that deploys (what it can do, not what it was meant to do).

## Secrets

- A secret moves from the secret store to the environment. It never appears in chat, in command arguments (they reach shell history and process lists), in logs, in diffs or in a file that is not ignored by version control.
- Changing a secret is a deployment and follows the same pre-flight.
- Verify a credential with a request that is meant to fail (a deliberately invalid value), so a green result is known to be able to turn red.
- Confirm the target by name immediately before a write, and read it back by name after.

## Pipelines

- Cheapest gates first: format, lint and types before the slow suites.
- No production secret in continuous integration; deploys use short-lived credentials issued to the pipeline.
- A feature flag carries a removal date.

## Cost

- Traffic through managed network gateways is billed per gigabyte and is the usual surprise; so is an idle resource left running in a non-production environment. Size non-production environments down on purpose.

## Moving between platforms

- Work from exports, not screenshots. Every source object maps to a target or is listed as not migrated, with its impact.
- Compare counts at every stage and stop on a mismatch.
- New blocking rules start in a log-only or disabled mode, are piloted, and can be removed by a name prefix; nothing is opened wide just to keep traffic flowing.

## Steps only a person can do

When a step needs a console or a device the agent cannot reach, write it as a numbered procedure the owner confirms step by step, trace every value to where the pipeline or the code reads it, and never invent a menu path.
