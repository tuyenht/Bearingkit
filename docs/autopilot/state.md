# Autopilot switch

State: PAUSE

- Weekly usage cap for autopilot work: 70% (read with `get_usage`; above it the session reports and stops).
- Five-hour window: no measurement starts above 80%.
- Context: stop at 80% with a handoff.

The owner pauses all autopilot work by changing the word after "State:" to PAUSE. A session only ever writes PAUSE, with the reason in `docs/autopilot/decisions.md` and a notification to the owner; writing RUN, and changing a cap, are the owner's (the RUN in the commit that added this file was written once by the session that built it, on the owner's approval of the direction; no session writes RUN again). The switch is read from `main`; a missing or unreadable file, or any word but RUN, is PAUSE. Rules: `docs/specs/2026-10-06-autopilot-design.md`.
