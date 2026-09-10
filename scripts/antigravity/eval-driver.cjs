'use strict';
// Antigravity activation eval driver. Installed into the live plugin as hooks/eval-driver.cjs while an eval is
// armed, registered on PreInvocation. Self-contained: node built-ins only, because the plugin may be a copy far
// from the kit.
//
// On the first invocation of a conversation whose user message is exactly the trigger phrase ("bk eval" by default),
// it takes the next prompt from the queue, resets the eval fixture to its staging tag (only when the workspace
// carries the kit's fixture marker, never elsewhere), records the conversation in the ledger, and injects the prompt
// as the user message. Scoring reads the transcripts later (scripts/antigravity-evals.cjs).

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const EVAL_DIR = process.env.BEARINGKIT_EVAL_DIR || path.join(os.homedir(), '.bearingkit', 'antigravity-eval');
const FIXTURE_MARKER = '.bearingkit-fixture';
const STAGE_TAG = 'bearingkit-stage';

function firstUserInput(transcriptText) {
  for (const line of String(transcriptText || '').split('\n')) {
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    if (o && o.type === 'USER_INPUT') return typeof o.content === 'string' ? o.content : JSON.stringify(o.content || '');
  }
  return null;
}

function isTrigger(userInput, trigger) {
  const t = String(userInput || '').replace(/<\/?USER_REQUEST>/g, '').trim().toLowerCase();
  return t === String(trigger || 'bk eval').trim().toLowerCase();
}

function resetFixture(workspace) {
  if (!workspace || !fs.existsSync(path.join(workspace, FIXTURE_MARKER))) return false;
  try {
    execFileSync('git', ['reset', '-q', '--hard', STAGE_TAG], { cwd: workspace, stdio: 'ignore' });
    execFileSync('git', ['clean', '-q', '-fdx'], { cwd: workspace, stdio: 'ignore' });
    return true;
  } catch { return false; }
}

// Pure decision: given the payload, the first user input and the queue, what to do.
function decide(payload, userInput, queue, trigger, workspaceIsFixture) {
  const p = payload || {};
  if (p.invocationNum !== undefined && p.invocationNum !== 1) return { action: 'skip', reason: 'not the first invocation' };
  // The transcript may not carry the user input yet when the hook runs; inside the kit's own marked fixture the
  // trigger is then taken as given. Anywhere else, no input means no injection.
  const triggered = isTrigger(userInput, trigger) || (userInput === null && workspaceIsFixture === true);
  if (!triggered) return { action: 'skip', reason: 'no trigger' };
  const q = queue || {};
  const pending = Array.isArray(q.pending) ? q.pending : [];
  if (!pending.length) return { action: 'empty' };
  return { action: 'inject', item: pending[0] };
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { raw += c; });
  process.stdin.on('end', () => {
    let payload = {};
    try { payload = JSON.parse(raw || '{}'); } catch { payload = {}; }
    const queueFile = path.join(EVAL_DIR, 'queue.json');
    let queue = null;
    try { queue = JSON.parse(fs.readFileSync(queueFile, 'utf8')); } catch { queue = null; }
    let transcript = '';
    try { transcript = fs.readFileSync(String(payload.transcriptPath || ''), 'utf8'); } catch { transcript = ''; }
    const ws = Array.isArray(payload.workspacePaths) ? payload.workspacePaths[0] : null;
    const isFixture = Boolean(ws && fs.existsSync(path.join(ws, FIXTURE_MARKER)));
    const d = decide(payload, firstUserInput(transcript), queue, queue && queue.trigger, isFixture);
    if (d.action === 'skip' || !queue) { process.stdout.write('{}'); return; }
    if (d.action === 'empty') {
      process.stdout.write(JSON.stringify({ injectSteps: [{ ephemeralMessage: '[bearingkit-eval] The queue is empty. Reply with exactly: EVAL-QUEUE-EMPTY' }] }));
      return;
    }
    const workspace = Array.isArray(payload.workspacePaths) ? payload.workspacePaths[0] : null;
    const reset = resetFixture(workspace);
    queue.pending = queue.pending.slice(1);
    // The whole item travels into the ledger, so scoring never depends on the pending list again.
    queue.done = (queue.done || []).concat([{ ...d.item, conversationId: payload.conversationId || null, transcriptPath: payload.transcriptPath || null, modelName: payload.modelName || null, workspace, reset, at: new Date().toISOString() }]);
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
    process.stdout.write(JSON.stringify({ injectSteps: [{ userMessage: d.item.prompt }] }));
  });
}

if (require.main === module) main();

module.exports = { firstUserInput, isTrigger, decide, resetFixture, EVAL_DIR, FIXTURE_MARKER, STAGE_TAG };
