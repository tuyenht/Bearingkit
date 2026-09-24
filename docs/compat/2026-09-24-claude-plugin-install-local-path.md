# Claude Code plugin install from a local-directory marketplace · 2026-09-24

Host: Claude Code 2.1.280, Windows 11, the owner's daily profile (`~/.claude`), during owner-migration phase 2 step 1 (`docs/plans/2026-09-24-owner-migration-checklist.md`). Each command ran with the owner's yes in the turn it ran.

## What ran

1. `claude plugin marketplace add "C:\Projects\Bearingkit"` → "Successfully added marketplace: bearingkit (declared in user settings)". `extraKnownMarketplaces.bearingkit` = `{ "source": { "source": "directory", "path": "C:\\Projects\\Bearingkit" } }`; `known_marketplaces.json` gives `installLocation` = the checkout.
2. `claude plugin install bearingkit@bearingkit` → "Successfully installed plugin: bearingkit@bearingkit (scope: user). This plugin is disabled by default — enable it with: claude plugin enable bearingkit@bearingkit".
3. `claude plugin uninstall bearingkit@bearingkit`, then `claude plugin marketplace remove bearingkit` → both reported success.

## What the files showed

| Read after | Observation |
|---|---|
| install | user `enabledPlugins` gained `"bearingkit@bearingkit": false` (install writes the entry; it does not leave the plugin without one) |
| install | `claude plugin list`: `bearingkit@bearingkit`, Scope user, Status ✘ disabled |
| install | `installed_plugins.json`: `installPath` = `~/.claude/plugins/cache/bearingkit/bearingkit/0.1.0`, `gitCommitSha` = the checkout's HEAD |
| install | the cache directory held **11,530 files**: the whole checkout except `.git`, including untracked, gitignored `_build/` (10,376 files: upstream clones, the isolated eval profile with its login file) and `evals/results/` (901 files) |
| uninstall + remove | the `enabledPlugins` entry, the `installed_plugins.json` entry and the marketplace entries were gone; the cache directory was **still present**, with one new file, `.orphaned_at` |

The login file was located by name only; it was not opened or printed.

## Against the documentation

- plugins-reference (read 2026-09-24): "Set `defaultEnabled: false` in `plugin.json` to ship a plugin that installs disabled" — matches; the page does not say that install writes a `false` entry, which it does.
- Which of the two a session loads (the copy or the marketplace folder) was not measured.
- plugins-reference, "Plugin caching and file resolution" (page saved verbatim on 2026-09-24 and grepped): "When you update or uninstall a plugin, Claude Code marks the previous version directory as orphaned and removes it in a background sweep roughly 14 days later", and the sweep runs "only while at least one plugin is installed" — matches the `.orphaned_at` seen here. (An earlier WebFetch summary had said uninstall removes the cached copy; the verbatim page does not say that.) The same section: "Claude Code copies *marketplace* plugins to the user's local plugin cache (`~/.claude/plugins/cache`), unless the plugin loads in place … A relative path source in a marketplace added from a local directory loads in place from the marketplace folder." This kit's marketplace entry is a relative path source (`"source": "./"`), yet the install made the full copy above.

## Consequence for the kit

On a machine where the checkout has `_build/` (every development machine of this kit), a local-path install copies eval material and the eval profile's login into the host's plugin cache. Install from the repository URL instead, which clones tracked, pushed files only. `docs/hosts.md` carries this note.

## Reinstall from GitHub, same day

After the owner's go-ahead the orphaned cache directory was deleted, then `claude plugin marketplace add tuyenht/Bearingkit` cloned the private repository (the machine's git credentials sufficed) into `~/.claude/plugins/marketplaces/bearingkit`, and `claude plugin install bearingkit@bearingkit` filled `~/.claude/plugins/cache/bearingkit/bearingkit/0.1.0` with **250 files, the number of tracked files**: no `_build/`, no `evals/results/`, no `.git`, no credential-like names; `gitCommitSha` was the pushed `main`. The install again wrote `"bearingkit@bearingkit": false` and `claude plugin list` showed the kit disabled. `"autoUpdate": true` was then added to the user's `extraKnownMarketplaces.bearingkit` entry, as the settings reference describes; its effect shows only after a restart and was not observed in this session.
