# Correction cues

Phrases in the user's turns that mark a correction of the agent's earlier work. bk-close checks the session for them once, at the end, and then asks whether to append a lessons line. The list is fixed in the kit; a project may add phrases in its own instruction file.

| Vietnamese | English |
|---|---|
| không đúng | wrong |
| sai rồi | that's not it |
| không phải | not what I asked |
| tôi đã nói | I told you |
| làm lại | redo |
| quay lại | revert |
| bỏ đi | undo |
| thiếu | you missed |
| đừng | don't |

A cue alone never writes a rule. The user decides whether the correction becomes a lessons line, in this format:

```
RULE | <scope> | WHEN <situation> THEN <do this> NOT <that> | <evidence: file, commit or test> | <date>
```
