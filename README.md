# Gridwell — restoration presentation dashboard

A single interactive dashboard for the Colorado Impact Hackathon presentation. Built with React + Vite, self-hosted Google Sans, Lucide icons, and MapLibre. The UI uses square corners, white surfaces, and restrained Google-color accents. Impeccable was installed with `npx impeccable install --providers=codex --project --yes`; Emil Kowalski's skill collection was installed with `npx skills add emilkowalski/skill --agent codex --yes` and its design-engineering guidance applied.

The basemap shows real Colorado geography from OpenFreeMap / OpenStreetMap. All feeder topology, facilities, customers, crew availability, hazards, scores, and durations overlaid on it are synthetic and do not locate actual utility assets. This is a presentation prototype, with no connected AI service or utility system. It cannot switch equipment, dispatch crews, access medical records, or send mutual-aid requests. Changes live in the current tab and reset on refresh.

## Run

Use Node.js 22.12+ or a supported newer version.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. `npm run build` produces a static `dist/` directory; `npm run preview` serves that production build locally. Serve the dashboard over HTTP rather than opening its files directly: MapLibre uses browser workers. The real basemap requires internet access. `npm test` runs the focused planning-model checks.

## Presentation walkthrough

1. Start on **Balanced**. Aspen junction leads because its upstream inspection unlocks a pathway serving 2,280 synthetic customers and a water facility. Juniper's pathway serves 740 customers, a hospital, and a shelter. Pathway counts overlap and must not be added.
2. Select **Hospital backup power lost**, then **Run field update**. Juniper moves ahead. Click its queue entry or network node to see the score and constraints.
3. Select **Unsafe access + damage found**. Juniper is excluded even with hospital urgency. Aspen now requires repair; Mesa and Cedar remain blocked by its unfinished upstream work.
4. Select **Additional crew available**. Charlie changes from standby to available. **Compare scenarios** recomputes parallel schedules with three abstract crews. The priority policy itself does not change solely because a crew appears.
5. Try **Longest waiting** to show the trade-off for Pine hollow, a small community waiting 11 synthetic hours.
6. **Review proposed plan** records a local human review. **Reset demo** restores the opening state in one click.

The navigation scrolls within this one dashboard. There are no separate product pages or account flows. Sources and assumptions live in a supporting dialog; a JSON export saves only the fictional scenario.

The overview emphasizes four impact numbers, the map, and the next eligible tasks. Supporting captions and duplicate badges are omitted. Map line names are off by default except for the selected line; **Line labels** reveals all names. **View history** and crew **Details** retain the full information without crowding the presentation screen. Click a task for its complete scoring explanation.

## What the model means

Safety and all upstream work are checked before a task can enter the eligible queue. The fictional radial-network model conservatively blocks downstream work until upstream inspection/repair is complete. This is a demonstration assumption, not a representation of every utility's field procedures.

Among eligible tasks, the score combines:

```
critical-facility count × critical weight
+ pathway customers / 100 / estimated work hours × reach weight
+ hours waiting × waiting weight
+ small-community weight (when applicable)
+ 180 points for a hospital backup-loss report
```

Weights are transparent, illustrative choices defined in `src/model.js`, not trained AI, validated risk estimates, or utility policy. No individual household medical risk is modeled. An urgent facility on an unsafe route remains blocked; its needs would require separate emergency coordination in a real deployment.

The comparison is a simple list scheduler. It assumes two or three interchangeable crews, no travel, fixed known durations, and no new findings. The displayed crew roster's real-world distinctions are intentionally **not** modeled by that comparison. Inspection completion assumes no newly found damage; a real inspection can instead generate further work. It is not an electrical, geographic routing, or optimized restoration model.

“Customer-hours to field clearance” and “facility-hours to field clearance” sum each direct load exactly once until its modeled work completes. Unresolved lines accrue time through a common comparison horizon of at least four hours. These are **planning proxies**, not predicted outage-hours or proven savings. Field clearance does not authorize re-energization, and the dashboard never reduces its customer-outage total.

## Evidence and presentation wording

The two uploaded PDFs and pasted brief were read. The 2026 challenge sets the resilience context; the 2025 worksheet supplies a workflow reference, not verified 2026 rules. The user's subsequently attached map image informed the geographic-overlay presentation; its feeders and fire locations are not treated as real data. No separate AI-guidance PDF was attached.

Useful primary sources:

- [Xcel: inspections and damage repairs are required following a PSPS](https://stories.xcelenergy.com/stories/thank-you-colorado-for-helping-us-keep-our-communities-safe), December 23, 2025.
- [Xcel: a Colorado event where restoration could take several days](https://newsroom.xcelenergy.com/news/restoration-work-underway-as-xcel-energy-prepares-for-public-safety-power-shutoff-friday). This supports an event-specific restoration statement, **not** a universal 48-hour physical-inspection statistic.
- [EEI: established restoration priorities](https://www.eei.org/issues-and-policy/reliability-emergency-response), including essential services and large service areas. The proposed improvement is revising priorities as information changes; prioritization itself is established practice.
- [Colorado PUC: October 2024 critical-customer communication recommendations](https://puc.colorado.gov/press-release/the-colorado-public-utilities-commission-adopts-interim-recommendations-to-increase). This historical source is not a full statement of current law.

Keep “operators may lack a unified view” as a hypothesis to validate with operators. Do not claim measured operator time wasted, model-proven real-world savings, actual inter-utility sharing, or operational AI integration.

## Privacy, authority, and possible implementation

The app collects no personal or live incident data. MapLibre requests public styles, map tiles, and supporting map assets from OpenFreeMap; those provider requests expose normal connection information and the viewed map area. No customer data is sent. Visible map attribution is retained. Map text and UI text use the locally bundled Google Sans under its included SIL Open Font License. No Google, Colorado, or utility endorsement is implied.

[OpenFreeMap's public service](https://openfreemap.org/) requires no API key, registration, or map-view fee. The map does not request geolocation, cache regions for offline use, scrape utility topology, or query real facility records. If the basemap cannot load, the dashboard displays a connection message rather than presenting a substitute as real geography.

For the feasibility slide, [BigQuery geospatial](https://docs.cloud.google.com/bigquery/docs/geospatial-data) could support authorized area-level joins, and [Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/ground-with-google-search) could support grounded summaries subject to review. These are proposals only. A real system would need utility-authorized topology, crew and field data, approved facility backup status and weather/access inputs, access controls, participating-utility data-sharing agreements, validation, and applicable legal review. The prototype does not claim operational certification or blanket legal compliance.

## Validation

Ten model checks cover hard safety constraints, recursive dependencies, backup urgency, small-community weighting, crew parallelism, and non-overlapping direct-load accounting. Browser checks cover scenario changes, explanation dialogs, comparison, review/reset, map controls, keyboard selection, and responsive overflow. A passing local demo is not evidence of utility integration or production behavior.

## Third-party materials

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Font licensing is preserved at `public/licenses/Google-Sans-OFL.txt` and ships with the static build. The user-provided PDFs and pasted text are not redistributed in this repository.
