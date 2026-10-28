Round 2 of 3. The fix quotes values with commas; the header goes through cell() too. CSV quoting uses double quotes, OK.

- `String(undefined)` renders "undefined"; an empty cell is written for a missing key. Not a finding.

Tests pass. No finding at 80 or above.
