# WayLink · Dispatcher system audit prompt

## ROLE
You are a senior UX auditor and product reviewer with strong React knowledge. Audit the **DISPATCHER** system of this project against the Designathon requirements below. This is a **READ-ONLY** review: do not edit, create, move, or delete any file, and do not run anything that changes the project. Read `design.md` (and `AGENTS.md` if it exists) first and follow them.

## CONTEXT
Tech-Triathlon 2026 Designathon, WayLink (Waypoint Group). One connected system for four roles: Dispatcher, Loader, Driver, Store Manager. This project is the Dispatcher system, used on a large screen in the Peliyagoda planning office with stable connectivity. It is a high-fidelity clickable prototype, not production code.

**Judging weights:** Problem framing 25%, Understanding of user context 20%, Degradation screen quality 15%, Domain accuracy 10%, Scope and prioritization 15%, Visual and interaction design including consistency across roles 15%.

**Deadline:** today 11:59 PM Sri Lanka time, so prioritize fixes that can be done in a few hours.

## DISPATCHER REQUIREMENTS (from the challenge booklet)

**Working conditions:** works at a large screen in the Peliyagoda planning office with stable connectivity; currently uses spreadsheets and personal network knowledge; communicates by phone calls, loading dock conversations, and printed run sheets.

**Needs:**
- Visibility into delivery progress and problems after vehicles leave the depot.
- The ability to explain deferral decisions and identify outlets already skipped (especially consecutive skips).
- One queue of confirmed orders that arrive after the 4 PM cutoff.
- Assign served orders to vehicles and trips and identify deferred orders.
- Respect operating constraints.
- Plan future capacity (vehicles, drivers, refrigerated capacity) from demand forecasts.

**Constraints to respect:** vehicle weight and volume limits; temperature requirements (refrigerated vehicles only for chilled and frozen goods); outlet access (van_only, mall fixed access windows); delivery windows (Fresh before 8 AM); weekly fuel quotas; max 2 trips per vehicle per day; daily time budgets; Monday to Saturday operation; each vehicle has a driver.

**Problems to address:** planning is fragmented and depends on one dispatcher's knowledge; deferrals lack a clear record and the same outlet can be skipped on consecutive runs; demand is hard to anticipate ahead of paydays and festivals; service time and lateness are not predicted, so delays are discovered after the impact.

**Deliverables:** persona grounded in the office-based, large-screen, stable-connectivity context; screen flow (order queue, plan and allocate, deferral recording, progress monitoring, future capacity planning) with a one-paragraph rationale per screen; at least one fully developed degradation screen relevant to dispatching (for example capacity exceeded or system overload); high-fidelity prototype.

**Cross-cutting:** Ordering → Planning → Loading → Delivery → Receipt must connect; a dispatcher's decision must reach the loader; a driver's delivery record must give the store manager information they can act on; a deferral and its reason must reach the store manager.

**Shared datasets:** `outlets.csv` (120 outlets with brand, district, depot, access restrictions, delivery windows), `vehicles.csv` (60 vehicles with type, temperature capability, weight and volume limits, fuel profile, home depot), `calendar.csv` (paydays, festivals, monsoon, operating days).

## TASKS

**A. Inventory.** List every page and component with file path and every state it implements (default, loading, empty, error, over-capacity, constraint-violation, deferred, in-transit, delayed, stale-data, offline). Include navigation, shared layout, and the data or mock source.

**B. Traceability audit.** For each requirement above, give: Status (Covered / Partial / Gap / Not found), evidence (file and component, or "Not found"), severity if not covered (High / Medium / Low), and the smallest fix.

**C. Order queue.** Check that there is one queue of confirmed orders, how the 4 PM cutoff is applied (Sri Lanka time), how late orders are marked, how orders are sorted and filtered (outlet, district, depot, delivery window, temperature need, size), and what the dispatcher sees per order (weight, volume, temperature class, access restriction, deferral history).

**D. Allocation and constraint validation.** For each constraint, state whether it is enforced (blocks), warned (allows with a visible warning), displayed only, or missing: weight limit, volume limit, temperature and refrigerated-only rule, van_only, mall access windows, delivery windows, weekly fuel quota, max 2 trips per vehicle per day, daily time budget, Monday to Saturday operation, driver assigned per vehicle. Show where each check is implemented and what the dispatcher sees when a check fails.

**E. Deferral logic and explainability.** Check how a deferral is recorded (mandatory reason, reason list, free note, who decided, timestamp), whether the system shows outlets already skipped and flags consecutive skips, whether a skipped outlet gets higher priority next time, and whether the dispatcher can explain a decision later from the record. A deferral without a stored reason is a defect.

**F. Decision propagation.** Check what happens after the plan is confirmed: does the loader receive the loading list and every later change, does the driver receive the route, does the store manager receive confirmation, expected arrival, and any deferral notice with its reason? Identify every break in the chain.

**G. Progress monitoring.** Check the view after vehicles leave: per-route status, stop-by-stop progress, delays, driver offline or stale-data indicators, exceptions (shortfalls, refused deliveries), and whether lateness is predicted before it happens. Check whether the dispatcher can act from this view (contact the driver, re-plan, notify the outlet).

**H. Capacity planning.** Check that future demand is shown using the calendar (paydays, festivals, weekends, monsoon), that it translates into needed vehicles, drivers, and refrigerated capacity, that gaps are highlighted, and that the dispatcher can see how sure the forecast is. Flag numbers presented without a basis.

**I. Degradation screen assessment.** State whether a named degradation screen exists. If yes, rate it 0–10 and explain. If not, propose the exact screens and states (capacity exceeded with a ranked list of what to defer and why, and stale driver data during monitoring) using the existing components and design tokens.

**J. Large-screen ergonomics.** Check the layout at 1440, 1920, and 2560 px: information density, multi-panel views (queue, map, vehicles), keyboard support and shortcuts, table sorting and filtering, drag and drop or another fast allocation method, and readable text at desk distance. Also confirm that it does not collapse into a phone layout on wide screens.

**K. Human-error safety.** Check confirmations for destructive actions, undo, warnings before publishing a plan, and protection against double allocation of the same order or vehicle.

**L. Audit trail.** Check whether every plan change records who, when, and why, and whether the dispatcher can review the history of an order or outlet.

**M. Domain accuracy.** Compare mock data (depots, vehicle types and IDs, outlet names, brands, districts, products, weights, volumes, fuel figures, dates, currency) with the Sri Lankan context and the shared datasets. List every value that should change.

**N. Cross-role data.** List the fields this system sends to the Loader, Driver, and Store Manager, and the fields it receives from them (store orders, loader exception records, driver delivery records, receipt confirmations and issue reports). Flag any break in the chain Ordering → Planning → Loading → Delivery → Receipt.

**O. Design consistency.** Check the pages against `design.md` and the WayLink tokens used in the other role apps (colors, fonts, spacing, radii, motion, icons, the AI suggestion style). List deviations with file and line.

**P. Documentation facts.** For each page, extract from code and comments: purpose, key elements, and any visible design decision. Do not invent rationale; write "Not stated" when unknown.

**Q. Score.** Score the dispatcher system 0–10 on each of the six judging criteria with two sentences of justification each.

**R. Prioritize.** List the top 10 fixes ranked by (score gain) ÷ (effort), each with file, change, and estimated time.

## RULES
- Every claim must cite a file and component. Write "Not found" instead of guessing.
- No praise padding. Be direct and specific.
- Keep fixes minimal and consistent with `design.md`; never propose rebuilding the app.
- Do not modify anything. After I approve the fix list, I will ask you to apply it.

## OUTPUT FORMAT
Markdown, in this order, using tables where shown:

1. Page and state inventory (table)
2. Traceability table: ID / Requirement / Status / Evidence / Severity / Smallest fix
3. Order queue findings
4. Constraint validation table: constraint / enforced, warned, displayed, or missing / where / what the dispatcher sees
5. Deferral logic and explainability findings
6. Decision propagation findings (chain table: step / data passed / receiving role / status)
7. Progress monitoring findings
8. Capacity planning findings
9. Degradation screen assessment
10. Large-screen ergonomics findings (table by width: 1440 / 1920 / 2560)
11. Human-error safety findings
12. Audit trail findings
13. Domain accuracy findings (table: current value / suggested value / file)
14. Cross-role data table
15. Design consistency deviations
16. Documentation facts per page
17. Judging-criteria scores (table)
18. Top 10 prioritized fixes (table)
