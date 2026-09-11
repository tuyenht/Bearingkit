// Drives Antigravity 2.0 through its DevTools endpoint (port 1405 on the workstation where this was built): for each
// queued prompt, opens a new conversation in the given project, types the hold phrase the armed driver expects, sends,
// waits for the driver hook to log the conversation and for the transcript to settle, then moves on.
// Usage: node drive.cjs <projectId> [maxPrompts]   (arm the queue first: evals --host antigravity --arm …)
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { connect } = require('./cdp.cjs');

const QUEUE = path.join(os.homedir(), '.bearingkit', 'antigravity-eval', 'queue.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readQueue = () => JSON.parse(fs.readFileSync(QUEUE, 'utf8'));

async function waitFor(fn, timeoutMs, everyMs = 2000) {
  const t0 = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - t0 > timeoutMs) return null;
    await sleep(everyMs);
  }
}

function transcriptSettled(file) {
  let text = '';
  try { text = fs.readFileSync(file, 'utf8'); } catch { return { settled: false, lines: 0 }; }
  const lines = text.split('\n').filter(Boolean);
  let last = null;
  for (const l of lines) { try { last = JSON.parse(l); } catch { /* ignore */ } }
  const done = last && (last.type === 'PLANNER_RESPONSE' || last.type === 'CHECKPOINT') && String(last.status || '').toUpperCase() === 'DONE';
  return { settled: Boolean(done), lines: lines.length, lastType: last && last.type, lastStatus: last && last.status };
}

async function runOne(c, projectId, trigger) {
  const before = readQueue().done.length;
  await c.evaluate(`location.href = ${JSON.stringify(`https://127.0.0.1:1407/?section=${projectId}`)}; true`);
  // The section re-mounts its composer while it loads; take the editor only after it has been present on two
  // consecutive checks, and treat it vanishing between the check and the keystrokes as a retryable failure
  // (it killed a 42-prompt run at prompt six once).
  let seen = 0;
  const ready = await waitFor(async () => { const p = await c.evaluate("!!document.querySelector('[contenteditable=true]')").catch(() => false); seen = p ? seen + 1 : 0; return seen >= 2 ? true : null; }, 30000, 700);
  if (!ready) throw new Error('composer did not appear');
  await sleep(800);
  const typed = await c.evaluate(`(() => { const ed = document.querySelector('[contenteditable=true]'); if (!ed) return null; ed.focus(); document.execCommand('selectAll', false, null); document.execCommand('insertText', false, ${JSON.stringify(trigger)}); return ed.innerText; })()`);
  if (typed === null) throw new Error('composer vanished before typing');
  // The composer enables its send button asynchronously; wait for it, then fall back to Enter.
  const sendState = "(() => { const b = [...document.querySelectorAll('button')].find(x => /send message/i.test(x.getAttribute('aria-label')||x.innerText||'')); return b ? (b.disabled || b.getAttribute('aria-disabled') === 'true' ? 'disabled' : 'ready') : 'missing'; })()";
  const ready2 = await waitFor(async () => (await c.evaluate(sendState)) === 'ready' ? true : null, 6000, 500);
  let sent = false;
  if (ready2) sent = await c.evaluate("(() => { const b = [...document.querySelectorAll('button')].find(x => /send message/i.test(x.getAttribute('aria-label')||x.innerText||'')); b.click(); return true; })()");
  if (!sent) {
    await c.evaluate("(() => { const ed = document.querySelector('[contenteditable=true]'); if (ed) ed.focus(); return true; })()");
    await c.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r' });
    await c.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
    await sleep(1000);
    const after = await c.evaluate("(document.querySelector('[contenteditable=true]')||{}).innerText || ''");
    if (after.trim()) throw new Error(`could not send (typed: ${JSON.stringify(String(typed).slice(0, 60))}, button: ${await c.evaluate(sendState)})`);
  }
  const entry = await waitFor(async () => { const q = readQueue(); return q.done.length > before ? q.done[q.done.length - 1] : null; }, 90000, 2000);
  if (!entry) return { id: null, status: 'driver did not fire (queue unchanged)', href: await c.evaluate('location.href') };
  let quietSince = null;
  let lastLines = -1;
  // Settled = the transcript's last step is DONE and nothing new has been written for 12 s. (A stop-button check
  // was dropped: some persistent button matched it and turned finished conversations into five-minute waits.)
  const settled = await waitFor(async () => {
    const s = transcriptSettled(entry.transcriptPath);
    if (s.lines !== lastLines) { lastLines = s.lines; quietSince = Date.now(); }
    const quiet = quietSince && Date.now() - quietSince > 12000;
    return (s.settled && quiet) ? s : null;
  }, 300000, 3000);
  return { id: entry.id, conversationId: entry.conversationId, status: settled ? `settled after ${settled.lines} steps` : 'timeout while waiting for the reply', model: entry.modelName };
}

(async () => {
  const [projectId, maxArg] = process.argv.slice(2);
  if (!projectId) throw new Error('usage: node drive.cjs <projectId> [maxPrompts]');
  const max = Number(maxArg || 1);
  const trigger = readQueue().trigger; // the phrase the armed driver expects
  const c = await connect();
  // One prompt failing to start (composer race, transient DevTools error) retries after a pause instead of ending
  // the run; three failures in a row end it, since by then the app itself needs a look.
  let failures = 0;
  for (let i = 0; i < max; i++) {
    if (!readQueue().pending.length) { console.log('queue empty'); break; }
    let r;
    try { r = await runOne(c, projectId, trigger); failures = 0; } catch (e) {
      failures += 1;
      console.log(`${i + 1}. retry ${failures} after error: ${e.message || e}`);
      if (failures >= 3) throw new Error(`three consecutive failures, last: ${e.message || e}`);
      await sleep(5000);
      i -= 1;
      continue;
    }
    console.log(`${i + 1}. ${JSON.stringify(r)}`);
    if (!r.id) break;
    await sleep(2000);
  }
  c.close();
})().catch((e) => { console.error('driver error:', e.message || e); process.exit(1); });
