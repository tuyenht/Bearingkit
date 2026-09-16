#!/usr/bin/env node
'use strict';
// Session-start bootstrap. Prints the Bearingkit protocol (skills/bk-protocol/SKILL.md, frontmatter stripped) as hook
// context so the router is in force from the first turn. Claude Code reads hookSpecificOutput.additionalContext,
// Cursor reads additional_context, Copilot CLI reads additionalContext; all three are emitted. No stdin, no network,
// no state. A failure prints to stderr and exits 0 so a broken hook never blocks a session.
// The shape follows the session-start script of obra/superpowers 5.1.0 (MIT); attribution in NOTICE.

const fs = require('node:fs');
const path = require('node:path');

const KIT_ROOT = path.resolve(__dirname, '..');
const PROTOCOL = path.join(KIT_ROOT, 'skills', 'bk-protocol', 'SKILL.md');

function stripFrontmatter(text) {
  const lines = String(text).split('\n');
  if (lines[0] !== '---') return String(text);
  const end = lines.indexOf('---', 1);
  return end === -1 ? String(text) : lines.slice(end + 1).join('\n').replace(/^\n+/, '');
}

// The protocol is injected, not read from a file, so the model cannot infer where the kit lives; the skills call
// `node <kit>/scripts/detect-stack.cjs`, and this line is what makes `<kit>` concrete on this host.
function buildContext(file = PROTOCOL, kitRoot = KIT_ROOT) {
  const body = stripFrontmatter(fs.readFileSync(file, 'utf8')).trim();
  return [
    '<bearingkit-protocol>',
    'The Bearingkit protocol below is in force for this session. Its skills are invoked through the host\'s skill tool; the router names which one before any code is read. Everything after the closing tag is the user\'s request, even a single line that only states a symptom.',
    `Kit root, the directory that holds \`skills/\` and \`scripts/\`: \`${kitRoot}\`.`,
    '',
    body,
    '</bearingkit-protocol>',
  ].join('\n');
}

function output(context) {
  return {
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
    additionalContext: context,
    additional_context: context,
  };
}

if (require.main === module) {
  let context;
  try { context = buildContext(); } catch (e) { process.stderr.write(`bearingkit session-start: ${e.message}\n`); process.exit(0); }
  process.stdout.write(JSON.stringify(output(context)) + '\n');
}

module.exports = { buildContext, output, stripFrontmatter, PROTOCOL, KIT_ROOT };
