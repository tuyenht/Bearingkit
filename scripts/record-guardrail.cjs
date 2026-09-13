#!/usr/bin/env node
'use strict';
// Writes guardrail runs and independent reviews into the session state store, so the push gate can read them.
//   node scripts/record-guardrail.cjs --command "pnpm test" --exit 0
//   node scripts/record-guardrail.cjs --review "src/auth/login.ts,src/auth/session.ts" [--by <session id>]
// Options: --cwd <dir> (default: current directory), --session <id> --host <claude|antigravity> (create or select a
// specific state file instead of the newest one for this directory). State dir: BEARINGKIT_STATE_DIR or ~/.bearingkit/state.

const path = require('node:path');
const { State } = require('./lib/state.cjs');

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { out[key] = next; i++; } else { out[key] = true; }
    } else {
      out._.push(a);
    }
  }
  return out;
}

// Nothing else creates the store in v2: the stack-profile hook that used to was deleted with the rule layer, and the
// session-start bootstrap writes nothing by design. This recorder is its only writer, so it opens its own file when
// none exists — one per directory per day, so a session's runs accumulate in one place and prune clears them later.
// Without this, the command bk-ship tells the model to run (no --session) could only ever fail.
function selectState(args) {
  const cwd = path.resolve(args.cwd || process.cwd());
  if (args.session) return new State({ host: args.host || 'claude', sessionId: args.session, cwd });
  const found = State.latest({ cwd });
  if (found) return found;
  const created = new State({ host: args.host || 'local', sessionId: `auto-${new Date().toISOString().slice(0, 10)}`, cwd });
  created.prune();
  return created;
}

function record(args) {
  const state = selectState(args);
  if (!state) {
    throw new Error('could not open or create session state; set BEARINGKIT_STATE_DIR to a writable directory');
  }
  const now = new Date().toISOString();
  if (args.command !== undefined) {
    const exitCode = Number(args.exit ?? 0);
    const current = state.read();
    const runs = [...current.guardrailRuns, { command: String(args.command), exitCode, at: now }];
    return state.update({ guardrailRuns: runs });
  }
  if (args.review !== undefined) {
    const scope = String(args.review).split(',').map((s) => s.trim()).filter(Boolean);
    const bySessionId = args.by || `manual-${now}`;
    return state.update({ independentReview: { bySessionId, at: now, scope } });
  }
  throw new Error('nothing to record: pass --command "<cmd>" --exit <code> or --review "<files>"');
}

if (require.main === module) {
  try {
    const updated = record(parseArgs(process.argv.slice(2)));
    process.stdout.write(JSON.stringify({ guardrailRuns: updated.guardrailRuns, independentReview: updated.independentReview }, null, 2) + '\n');
  } catch (e) {
    process.stderr.write(e.message + '\n');
    process.exit(1);
  }
}

module.exports = { record, parseArgs };
