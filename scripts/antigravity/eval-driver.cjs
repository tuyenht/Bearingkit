'use strict';
// Antigravity activation eval driver. Installed into the live plugin as hooks/eval-driver.cjs while an eval is
// armed, registered on PreInvocation. Self-contained: node built-ins only, because the plugin may be a copy far
// from the kit.
//
// On the first invocation of a conversation whose user message is exactly the opening phrase ("bk eval" by default),
// it takes the next prompt from the queue, resets the stage to its commit (only when the workspace carries the
// stage marker, never elsewhere), records the conversation in the ledger, and injects the prompt as the user
// message. Scoring reads the transcripts later (scripts/antigravity-evals.cjs).

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// The queue sits outside the kit's own home on purpose. While it lived at ~/.bearingkit/antigravity-eval it was a
// sibling of the store a project declares, and on 2026-09-20 a conversation that had opened a skill there walked up
// one level, found the queue, the log beside it and then the checkout. Its routing decision was already made, so it
// scored honestly, but the prompts of a measurement should not be one listing away from a path the model holds.
const EVAL_DIR = process.env.BEARINGKIT_EVAL_DIR || path.join(os.homedir(), '.bk-relay');
// The marker sits inside .git, where a directory listing does not show it, and holds the commit to reset to, so the
// stage needs no tag either. Only the stage command writes it: a workspace without it is never reset.
const STAGE_MARKER = path.join('.git', 'bearingkit-stage');
// What the model reads before the prompt. It must not say that this is a measurement: on 2026-09-19 a note that
// called the opening line a "harness trigger", with a fixture README that named the evals, sent conversations
// searching the folders above for the prompt files. The scorer recognises the note by its first token.
const NOTE = '[relay] The message above only opened this conversation; it is not a request. The request is the next message: handle it exactly as you would any other. [/relay]';
const EMPTY_NOTE = '[relay] Nothing is waiting to be sent. Reply with exactly: NOTHING-QUEUED [/relay]';

function firstUserInput(transcriptText) {
  for (const line of String(transcriptText || '').split('\n')) {
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    if (o && o.type === 'USER_INPUT') return typeof o.content === 'string' ? o.content : JSON.stringify(o.content || '');
  }
  return null;
}

// The user's text sits inside <USER_REQUEST>…</USER_REQUEST>; the host appends blocks such as <ADDITIONAL_METADATA>
// (local time) after it, so only the request block is compared.
function requestText(userInput) {
  const s = String(userInput || '');
  const m = s.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
  return (m ? m[1] : s.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '')).trim();
}

function isTrigger(userInput, trigger) {
  return requestText(userInput).toLowerCase() === String(trigger || 'bk eval').trim().toLowerCase();
}

function isStage(workspace) {
  return Boolean(workspace && fs.existsSync(path.join(workspace, STAGE_MARKER)));
}

function resetFixture(workspace) {
  if (!isStage(workspace)) return false;
  let sha = '';
  try { sha = fs.readFileSync(path.join(workspace, STAGE_MARKER), 'utf8').trim(); } catch { return false; }
  if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(sha)) return false;
  try {
    execFileSync('git', ['reset', '-q', '--hard', sha], { cwd: workspace, stdio: 'ignore' });
    execFileSync('git', ['clean', '-q', '-fdx'], { cwd: workspace, stdio: 'ignore' });
    return true;
  } catch { return false; }
}

// Pure decision: given the payload, the first user input and the queue, what to do.
function decide(payload, userInput, queue, trigger, workspaceIsFixture) {
  const p = payload || {};
  // Invocation numbering starts at 0 in one run and at 1 in another (Antigravity 2.0, 2026-09-11), so the reliable
  // rule is one injection per conversation: a conversation already in the ledger is never served again.
  const served = new Set(((queue && queue.done) || []).map((d) => d.conversationId).filter(Boolean));
  if (p.conversationId && served.has(p.conversationId)) return { action: 'skip', reason: 'already served this conversation' };
  if (p.invocationNum !== undefined && Number(p.invocationNum) > 1) return { action: 'skip', reason: 'not the first invocation' };
  // Injection happens only inside the kit's own marked stage: the opening phrase typed elsewhere is ignored, so a
  // queued prompt can never land in a real project. Inside the stage, a transcript that has no user input yet (the
  // hook may run before it is written) counts as opened.
  if (workspaceIsFixture !== true) return { action: 'skip', reason: 'not the eval fixture' };
  const triggered = isTrigger(userInput, trigger) || userInput === null;
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
    const isFixture = isStage(ws);
    const d = decide(payload, firstUserInput(transcript), queue, queue && queue.trigger, isFixture);
    // One line per invocation, so a silent host can be told apart from a driver that decided to skip.
    try {
      fs.mkdirSync(EVAL_DIR, { recursive: true });
      fs.appendFileSync(path.join(EVAL_DIR, 'driver.log'), JSON.stringify({ at: new Date().toISOString(), conversationId: payload.conversationId || null, invocationNum: payload.invocationNum, isFixture, transcriptExists: Boolean(transcript), decision: d.action, reason: d.reason || null, pending: queue && Array.isArray(queue.pending) ? queue.pending.length : null }) + '\n');
    } catch { /* logging never blocks the hook */ }
    if (d.action === 'skip' || !queue) { process.stdout.write('{}'); return; }
    if (d.action === 'empty') {
      process.stdout.write(JSON.stringify({ injectSteps: [{ ephemeralMessage: EMPTY_NOTE }] }));
      return;
    }
    const workspace = Array.isArray(payload.workspacePaths) ? payload.workspacePaths[0] : null;
    const reset = resetFixture(workspace);
    queue.pending = queue.pending.slice(1);
    // The whole item (an id and a prompt, no label) travels into the ledger, so scoring never depends on the pending list again.
    queue.done = (queue.done || []).concat([{ ...d.item, conversationId: payload.conversationId || null, transcriptPath: payload.transcriptPath || null, modelName: payload.modelName || null, workspace, reset, at: new Date().toISOString() }]);
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
    process.stdout.write(JSON.stringify({ injectSteps: [
      { ephemeralMessage: NOTE },
      { userMessage: d.item.prompt },
    ] }));
  });
}

if (require.main === module) main();

module.exports = { firstUserInput, requestText, isTrigger, decide, isStage, resetFixture, EVAL_DIR, STAGE_MARKER, NOTE, EMPTY_NOTE };
