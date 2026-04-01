# WAROOM Detailed Execution Plan

Last updated: 2026-04-01
Source inputs:

- todo.txt roadmap (MVP -> polish -> stretch)
- Current codebase audit of backend and frontend
- Existing compile/error logs in repository

## Implementation Status Snapshot (2026-04-01)

Phase 0 execution status: COMPLETED

Completed now:
- Upgraded frontend dependencies to latest stable (React 19.2.4, ReactDOM 19.2.4, Vite 8.0.3, @vitejs/plugin-react 6.0.1, spacetimedb 2.1.0).
- Installed latest Rust toolchain via rustup (rustc/cargo 1.94.1).
- Installed wasm target: wasm32-unknown-unknown.
- Installed official Spacetime CLI (2.1.0) for Windows.
- Updated binding generation script to latest CLI syntax (`--module-path`).
- Created local `.env` template for compile-time keys.
- Generated TypeScript module bindings successfully.
- Verified compile gates:
  - Backend: `cargo check` passes when `.env` vars are loaded.
  - Frontend: `npm run build` passes.

Known non-blocking note:
- `wasm-opt` is not installed on this machine. Binding generation still succeeds; optimization is optional for now.

Phase 1 execution status: COMPLETED

Completed now:
- Removed manual procedure requeue after runtime soak showed accelerated over-scheduling; scheduled table recurrence already handles 30s loops.
- Added centralized runtime status helper to enforce `thinking -> idle` transitions and explicit `error` state on hard failures.
- Added standardized failure log entries for API/text extraction/JSON parse failures.
- Implemented deterministic conflict watcher logic in Devil's Advocate cycle using latest Strategist decision plus risk/rejection heuristics.
- Verified backend compile gate after changes: `cargo check` passes.

Runtime validation results (local standalone):
- Published module to local DB (`warroomp1`) and executed soak checks.
- Cadence verified after fix: `reasoning_log` count progressed `0 -> 3 -> 6` over ~70 seconds (matches 3 agents every ~30 seconds).
- Agent status transitions to `error` are confirmed on API response extraction failures when placeholder keys are used.

Known runtime caveat:
- Existing local DB `warroom` had ownership/reset permission mismatch under anonymous identities; used fresh DB name `warroomp1` for clean validation.

Phase 2 execution status: IN PROGRESS

Completed now:
- Replaced simulation-first rendering in `client/src/App.jsx` with live table-backed data surfaces (`agent`, `reasoning_log`, `agent_messages`, `shared_context`) using `useTable` tuple API.
- Wired launch and belief injection UI actions to live reducers (`spawn_swarm`, `inject_belief`) via `useReducer`.
- Added connection/sync gating so launch/inject controls stay disabled until live connection is active.
- Added live loading fallback copy (`Syncing live tables...`) and updated timer/status rendering to use live context timestamps.
- Verified frontend compile gate after live wiring: `npm run build` passes.

Remaining for Phase 2:
- Run end-to-end live smoke validation against local Spacetime instance from UI interactions (launch + inject + feed updates in real time).

## 1) Current Project Status (What Is Already Done)

### 1.1 Backend status (Rust SpacetimeDB module)

Current implementation in src/lib.rs already includes:

- Core tables from MVP:
  - agents
  - reasoning_log
  - agent_messages
  - shared_context
- Extra schedule tables already added:
  - scout_schedule
  - strategist_schedule
  - devils_schedule
- Core reducers already implemented:
  - init
  - spawn_swarm
  - inject_belief
  - mark_read
  - update_agent_status
- Three autonomous procedures already present:
  - scout_think
  - strategist_think
  - devils_think
- LLM + memory integration already attempted:
  - Gemini API request/response handling
  - Mem0 search and add memory calls
- Data fields already support key polish requirements:
  - confidence in reasoning_log and agents
  - has_conflict in reasoning_log

What is likely incomplete or risky in backend behavior:

- 30-second recurring cycle behavior must be verified at runtime.
  - Schedule rows are inserted in init, but recurrence depends on whether each procedure re-schedules itself after execution.
  - If scheduled rows are one-shot, agents may run only once.
- Agent status transitions are not fully lifecycle-driven yet:
  - Spawn sets status to thinking, but each cycle should explicitly set thinking at cycle start and idle/error at completion.
- Conflict detection currently appears LLM-driven (Devil's Advocate sets has_conflict), while todo asks for deterministic passive conflict watcher logic (epsilon-style rule).

### 1.2 Frontend status (React + Vite)

Current implementation in client/src/App.jsx and App.css already includes:

- A strong hackathon-style dashboard UI
- Three-agent node graph with message edge animations
- Live reasoning feed design with conflict badges
- Confidence bars per reasoning item
- Session intelligence brief panel
- Human belief injection controls
- Launch modal for crisis scenario
- Rich status visuals (pulsing/thinking/conflict styling)

What is likely incomplete or risky in frontend behavior:

- DEV simulation and LIVE mode integration are mixed.
  - Data hooks are imported but live table state usage is still commented out.
  - Reducer calls for spawn and inject are commented out.
- Generated Spacetime bindings are referenced but not confirmed generated in this workspace.
- Mobile/responsive behavior is not production-safe yet.
  - CSS currently forces min-width: 1280px, which hurts smaller screens.

### 1.3 Tooling and environment status

Observed blockers on this machine/workspace:

- cargo command not found in terminal (Rust toolchain not available in current shell).
- client build fails because vite command is missing (dependencies not installed in active environment path).

Implication:

- Before feature work, environment bootstrap is mandatory.

## 2) Requirement Coverage Matrix (todo.txt vs Current Code)

### Project 1 - Core MVP (Days 1-2)

1. SpacetimeDB module with four tables (agents, reasoning_log, agent_messages, shared_context): DONE
2. Exactly three agents (Scout, Strategist, Devil's Advocate): DONE
3. Each agent cycles every 30s, reads shared state, calls LLM, writes thoughts: PARTIAL
   - Procedures exist and do read/write/call APIs.
   - Recurring cycle reliability is not yet verified.
4. React frontend subscribes to all tables and shows live thoughts: PARTIAL
   - UI exists.
   - Live subscription wiring is incomplete/commented in App.jsx.
5. Node graph shows inter-agent messaging edges: DONE (UI logic present)

### Project 2 - Hackathon Polish (Days 3-4)

1. Human interruption belief injection: DONE (backend reducer + frontend input exists)
2. Conflict detection as passive watcher (epsilon logic) with visual flag: PARTIAL
   - Visual flag exists.
   - Deterministic passive watcher logic not yet implemented.
3. Session summary panel from structured data: PARTIAL
   - Summary UI exists.
   - Need explicit one-cycle completion trigger and strict structure rules.
4. Status indicators (blue thinking, green output, red conflict): PARTIAL
   - Thinking visuals present.
   - Need strict color-state mapping from live state/events.

### If Time Remains - Priority Features

1. Multi-tab demo proof: READY TO DEMO (no extra backend architecture needed)
2. Agent memory persistence table (agent_memory): NOT DONE
   - Current memory uses external Mem0, not internal table described in todo.
3. Confidence scoring display: DONE
4. Preset crisis scenario buttons: NOT DONE

## 3) Phase-Wise Execution Plan (Detailed)

## Phase 0 - Environment Bootstrap and Reproducible Setup

Target: Day 0.5
Goal: Make project runnable on any dev machine and CI-like environment.

Tasks:

1. Install and verify required toolchain
   - Rust + cargo in PATH
   - wasm target for module build
   - SpacetimeDB CLI
   - Node/npm
2. Install frontend dependencies
   - Run npm install in client
3. Verify baseline commands
   - cargo check (backend)
   - npm run build (frontend)
4. Create a clean setup guide
   - Add setup section to README or docs/runbook.md

Execution commands (to run when environment is available):

- Backend:
  - rustup target add wasm32-unknown-unknown
  - cargo check
- Frontend:
  - cd client
  - npm install
  - npm run build
- Spacetime bindings:
  - npm run generate-bindings

Acceptance criteria:

- Fresh clone can run backend compile and frontend build without manual patching.
- All required environment variables documented.

## Phase 1 - Backend Reliability and Correctness

Target: Day 1
Goal: Make the autonomous cycle deterministic and robust.

Tasks:

1. Confirm and enforce recurring schedule semantics
   - Verify if scheduled rows are one-shot.
   - If one-shot, each think procedure inserts next schedule row before exit.
2. Normalize agent lifecycle states
   - On cycle start: status = thinking
   - On successful completion: status = idle + confidence update
   - On API/parse failure: status = error
3. Harden API error handling
   - Timeouts and fallback entries in reasoning_log
   - Structured error message format for frontend display
4. Conflict detection backend rule (epsilon watcher)
   - Add deterministic conflict evaluator from strategist vs devils_advocate outputs.
   - Do not rely only on LLM has_conflict field.
5. Data consistency review
   - Verify primary-key delete/insert updates are safe and minimal.
   - Ensure message read-state changes remain correct under repeated cycles.

Suggested implementation details:

- Add a reducer/procedure that compares latest strategist and devil outputs.
- Flag conflict based on rule set, for example:
  - opposite recommendation verb classes (act now vs do not act)
  - confidence gap threshold + explicit contradiction keywords
- Store conflict_reason text for UI explainability (optional but high value).

Acceptance criteria:

- Agents run repeatedly every 30s for at least 10 minutes.
- Status transitions are visible and accurate in table data.
- Conflict flag is deterministic and reproducible on same inputs.

## Phase 2 - Live Frontend Data Wiring

Target: Day 1.5 to Day 2
Goal: Replace simulation-first behavior with true Spacetime live state.

Tasks:

1. Generate and commit module bindings
   - Ensure client/src/module_bindings exists and compiles.
2. Wire useTable data to UI state
   - agent -> status and confidence indicators
   - reasoning_log -> feed and summary
   - agent_messages -> graph edge activity and human inject feedback
   - shared_context -> crisis banner
3. Wire reducer actions
   - Launch action calls spawn_swarm
   - Injection action calls inject_belief
4. Keep DEV mode cleanly separated
   - One source of truth for DEV_MODE
   - No dead/commented code paths left in final demo branch
5. Connection state UX
   - Show connected/disconnected state
   - Handle empty data/loading gracefully

Acceptance criteria:

- Launching swarm from UI updates backend state and all panels live.
- Opening second tab mirrors updates in near real time.
- No manual refresh required for any panel.

## Phase 3 - Hackathon Polish Completion

Target: Day 3 to Day 4
Goal: Deliver judge-facing clarity and memorable interaction moments.

Tasks:

1. Human interruption polish
   - Add quick inject buttons near each agent panel (not just global row).
   - Show last injected belief per agent with timestamp.
2. Conflict UX polish
   - Red conflict badge between strategist and devil nodes.
   - Optional conflict tooltip: why flagged.
3. Session brief strict formatting
   - Display after one full 3-agent cycle is complete.
   - Include required fields:
     - Scout findings
     - Strategist options/recommendation
     - Devil's Advocate challenges
     - Final recommended action
   - Keep this deterministic from reasoning_log (not AI-generated summary).
4. Status color mapping finalization
   - thinking -> blue
   - completed latest output -> green
   - conflict/flagged -> red
5. Demo stability pass
   - Remove non-essential animations that cause frame drops.
   - Ensure UI remains readable at projector scale.

Acceptance criteria:

- Demo flow can be run start to finish in under 3 minutes without failure.
- Human injection clearly alters next cycle output.
- Conflict moment appears reliably in at least one preset scenario.

## Phase 4 - Time-Remaining Priorities (Strict Order)

1. Multi-tab proof (highest ROI)

- Open two windows side by side and demonstrate synchronized updates.
- Add one short line in UI footer: Real-time synchronized via Spacetime subscriptions.

2. Agent memory persistence table

- Add new table: agent_memory
  - memory_id (auto inc)
  - agent_id
  - memory
  - cycle_no
  - timestamp
- At each cycle end, append key conclusion to this table.
- Display last N per agent in memory cards.

3. Confidence calibration polish

- Add confidence thresholds and semantic tags:
  - > = 0.85 high confidence
    >
  - 0.60 to 0.84 medium
  - < 0.60 low
- Reflect in UI visual weight.

4. Preset crisis scenarios

- Add 3 deterministic buttons:
  - Competitor Launch
  - PR Crisis
  - Market Crash
- Optionally map small prompt-style variants by scenario.

## 4) File-Level Work Plan

Backend files:

- src/lib.rs
  - finalize schedule recurrence
  - lifecycle state updates
  - conflict evaluator
  - optional agent_memory table and writes

Frontend files:

- client/src/App.jsx
  - complete live table and reducer wiring
  - remove commented placeholders
  - add preset scenarios and per-agent inject actions
- client/src/App.css
  - responsive layout pass
  - final status/conflict visual mapping
- client/src/main.jsx
  - DEV/LIVE mode cleanup
  - stable provider setup
- client/src/module_bindings/*
  - generated artifacts after schema stabilization

Config and docs:

- .env.example
  - keep current keys, ensure wording for setup clarity
- plan.md (this file)
- README.md or docs/runbook.md
  - exact run, build, and demo instructions

## 5) Testing and Validation Plan

Backend validation:

1. Schedule test

- Verify each agent writes at least 3 logs across 2 minutes.

2. Message pipeline test

- Scout -> Strategist -> Devil -> Strategist message loop observed.

3. Injection test

- Inject belief into one agent and verify next cycle reflects changed context.

4. Conflict test

- Use seeded contradictory strategist/devil outputs and ensure conflict flag appears.

5. Error test

- Simulate API failure and verify status=error plus fallback log entry.

Frontend validation:

1. Live subscription test

- Open two tabs and validate synchronized updates.

2. Launch flow test

- New crisis appears in header and shared context.

3. Feed and graph test

- Each log entry appears with confidence and timestamp.
- Edges animate when recent message exists.

4. Session brief test

- Brief appears after first full cycle and contains all required fields.

5. Responsive sanity test

- Verify usability at laptop width and mobile portrait.

## 6) Demo Runbook (Judge-Friendly Script)

1. Start with default preset: Competitor Launch
2. Click Launch Swarm
3. Point to three live thinking statuses in parallel
4. Show message edges lighting between nodes
5. Trigger human injection into Devil's Advocate
6. Wait one cycle and show changed challenge output
7. Highlight red conflict badge and explain why disagreement is useful
8. Show session intelligence brief card
9. Open second browser tab to prove real-time sync

## 7) Risks and Mitigations

Risk 1: Environment setup delays

- Mitigation: finish Phase 0 first and freeze install docs early.

Risk 2: LLM latency or API failures during demo

- Mitigation: add resilient fallbacks, retries, and local canned mode toggle.

Risk 3: Frontend and backend schema mismatch

- Mitigation: regenerate bindings immediately after schema changes; no manual type patching.

Risk 4: Conflict not triggering during live run

- Mitigation: include one deterministic scenario that reliably produces contradiction.

Risk 5: Visual overload in demo

- Mitigation: reduce noisy animations; prioritize signal visibility and readability.

## 8) Day-by-Day Delivery Checklist

Day 1 morning:

- Environment setup complete
- Backend compiles
- Scheduling recurrence confirmed

Day 1 evening:

- Backend lifecycle and error states stable
- Deterministic conflict watcher implemented

Day 2:

- Frontend fully wired to live tables/reducers
- Multi-tab sync verified

Day 3:

- Human injection UX polished
- Session brief gating and formatting done
- Status/color conflict mapping finalized

Day 4:

- Preset scenarios added
- End-to-end demo rehearsed with timer
- Final bug bash and fallback mode check

## 9) Definition of Done (Hackathon Version)

Project is done when all are true:

- Three agents run repeatedly and in parallel from one launch action.
- Live feed, graph edges, confidence, and conflict badge update without refresh.
- Human belief injection changes next-cycle output.
- Session brief appears with deterministic structured content.
- Multi-tab real-time sync is demonstrable in front of judges.
- One-command setup steps are documented and reproducible.
