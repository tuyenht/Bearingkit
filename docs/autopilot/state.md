# Autopilot switch

State: RUN

- Weekly usage cap for autopilot work: 70% (read with `get_usage`; above it the session reports and stops). Until the reset of 2026-11-04T02:59:59Z only, on the owner's label of 2026-11-02 (`docs/autopilot/decisions.md` entry 90), a rising yield line replaces it: 96% minus one point for every three hours left until that reset, counted continuously (80% at 2026-11-02T03:00Z, 88% at 2026-11-03T03:00Z, 96% at the reset). Above the line no autopilot work starts; the session reports, does not close, and starts again once the line has reached the reading. The line keeps 8 points a day and 4 points spare for the owner's production SaaS project; the reading counts every project on the account, NgayTot included, so they all push it towards the line. From that reset on, 70% applies again.
- Five-hour window: no measurement starts above 80%.
- Context: stop at 80% with a handoff.

The owner pauses all autopilot work by changing the word after "State:" to PAUSE. A session only ever writes PAUSE, with the reason in `docs/autopilot/decisions.md` and a notification to the owner; writing RUN, and changing a cap, are the owner's (the yield line above is the owner's, by label, entry 90; the RUN in the commit that added this file was written once by the session that built it, on the owner's approval of the direction; no session writes RUN again). The switch is read from `main`; a missing or unreadable file, or any word but RUN, is PAUSE. Rules: `docs/specs/2026-10-06-autopilot-design.md`.
