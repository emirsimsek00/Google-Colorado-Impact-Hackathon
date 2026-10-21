---
name: Gridwell
description: A white, square-edged presentation dashboard with Google Sans and geographic context.
colors:
  blue: "#1a73e8"
  blue-deep: "#1967d2"
  blue-tint: "#e8f0fe"
  red: "#d93025"
  green: "#188038"
  repair-yellow: "#e8a100"
  yellow: "#f9ab00"
  green-tint: "#e6f4ea"
  red-tint: "#fce8e6"
  ink: "#202124"
  muted: "#5f6368"
  line: "#dadce0"
  surface: "#f8f9fa"
  neutral-tint: "#f1f3f4"
  white: "#ffffff"
typography:
  display:
    fontFamily: '"Google Sans Variable", "Google Sans", sans-serif'
    fontSize: "36px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.6px"
  headline:
    fontFamily: '"Google Sans Variable", "Google Sans", sans-serif'
    fontSize: "27px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.6px"
  title:
    fontFamily: '"Google Sans Variable", "Google Sans", sans-serif'
    fontSize: "18px"
    fontWeight: 550
    letterSpacing: "-0.2px"
  body:
    fontFamily: '"Google Sans Variable", "Google Sans", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  explanation:
    fontFamily: '"Google Sans Variable", "Google Sans", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: '"Google Sans Variable", "Google Sans", sans-serif'
    fontSize: "14px"
    fontWeight: 400
  button:
    fontFamily: '"Google Sans Variable", "Google Sans", sans-serif'
    fontSize: "14px"
    fontWeight: 500
rounded:
  square: "0px"
spacing:
  tight: "4px"
  inline: "8px"
  compact: "12px"
  inset: "16px"
  panel: "18px"
  section: "20px"
  desktop-gutter: "28px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "9px 13px"
  button-primary-hover:
    backgroundColor: "{colors.blue-deep}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "9px 13px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "9px 13px"
  button-reviewed:
    backgroundColor: "{colors.green-tint}"
    textColor: "#137333"
    typography: "{typography.button}"
    rounded: "{rounded.square}"
    padding: "9px 13px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "7px 24px 7px 10px"
  navigation:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.square}"
    padding: "11px 12px"
  chip:
    backgroundColor: "{colors.green-tint}"
    textColor: "#137333"
    rounded: "{rounded.square}"
    padding: "4px 7px"
  panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
---

# Design System: Gridwell

## Overview

**Creative North Star: "The Clear Operations Desk"**

Gridwell is a white, square-edged operational presentation surface. Google Sans carries every UI role, restrained gray dividers organize dense information, and blue identifies actions and pending inspection. Red, yellow, and green have explicit network-state meanings rather than serving as decoration.

The real Colorado basemap provides geographic context beneath fictional feeder, facility, and incident overlays. The interface keeps that distinction visible: it is a browser-local presentation dashboard, not a live utility system. Direct labels, explainable ranking, and a local operator-review state make the demonstration understandable without implying operational authority.

**Key Characteristics:**

- White ground, square containers, and fine gray dividers.
- Self-hosted Google Sans across UI and vector-map labels.
- Blue actions with red, yellow, and green route semantics.
- Real geography with explicitly fictional utility overlays.

## Colors

The interface uses a white and neutral-gray foundation with clear Google-style blue, red, yellow, and green accents. The frontmatter is the normative palette; component-local text and border variants remain local styles.

### Primary

- **Action Blue:** Primary actions, keyboard focus, awaiting-inspection routes, and selected accents.
- **Deep Action Blue:** Links, selected navigation text, and primary-button hover.
- **Selection Blue Tint:** Selected navigation.

### Secondary

- **Unsafe Red:** Blocked access, urgent facility outlines, and active incident emphasis.
- **Inspected Green:** Inspected routes and supporting safety indicators.
- **Repair Yellow:** Repair-needed routes and their legend swatch. Keep this actual overlay value distinct from **Incident Yellow**, which appears on the incident-context status dot.
- **Reviewed Green Tint:** Local reviewed-state and positive-status surfaces.
- **Warning Red Tint:** Warning-event and warning-chip surfaces.

### Neutral

- **Graphite Ink:** Main text, large values, and headings.
- **Secondary Gray:** Supporting copy, metadata, and neutral icons.
- **Divider Gray:** Panel, shell, toolbar, and field separation.
- **Quiet Surface:** Announcement, notice, detail, and hover backgrounds.
- **Inset Gray:** Identity blocks, neutral chips, and control hover.
- **White:** Workspace, navigation, panels, controls, and label plates over the map.

**The State Meaning Rule.** Use blue for awaiting inspection, green for inspected, yellow for repair needed, and red for blocked access. Preserve visible state labels and the legend; color alone is insufficient.

## Typography

**Display Font:** Google Sans Variable, with Google Sans and sans-serif fallbacks.
**Body Font:** The same self-hosted family across the complete interface. There is no separate mono face. Numeric summaries and detail values use tabular numerals.
**Map Font:** MapLibre symbol layers use the locally loaded Google Sans Variable face; the implementation removes the remote glyph URL so geographic labels rasterize from the same font.

**Character:** Clear product typography with moderate weights and compact alignment. Large values and page headings have restrained negative tracking; explanatory prose stays naturally spaced.

### Hierarchy

- **Display:** The frontmatter display role governs summary numbers and comparison values. Mobile summary values are slightly smaller (30px).
- **Headline:** The main desktop heading uses the headline role; intermediate screens reduce it to 25px and mobile uses 26px. Dialog headings sit between page and panel scales (21px, weight 500; 19px on mobile).
- **Title:** Panel headings use 18px, reduced to 17px in narrower layouts. Task titles use 15–16px; key reasons use 13–14px.
- **Body:** The root reading role is the frontmatter body size. Paragraphs use the shared relaxed line height; operator-review list items also use this size.
- **Explanation:** Dialog explanations use this role, with a 75ch maximum where established. Detailed task reasoning increases to 16px. Sources and notices use a compact reading size (12px), with longer source prose at line-height 1.75.
- **Label:** Summary and navigation labels use 13–14px. Standard controls use 14px, with compact responsive exceptions. Attribution is the only persistently tiny map text; avoid adding microcopy to the overview.

**The Reading Hierarchy Rule.** Use body or explanation typography for reading and compact labels for metadata. Small map attribution, badges, and footer captions are local exceptions, not a body-text norm.

## Layout

A fixed left rail and fluid white workspace organize the desktop. The rail is 210px wide, narrowing to 185px at widths at or below 1200px. Main content is centered and capped at 1740px; desktop horizontal gutters are 28px, medium gutters 22px, and mobile gutters 16px. The top bar is 54px high on desktop and 53px on mobile.

Four summary cells share top and bottom dividers and internal vertical separators. The primary grid places the map beside the queue (1.75:1, queue minimum 355px). At widths at or below 1200px it becomes 1.4:1 with a 320px queue minimum and 16px gap; at 1600px and above it uses 1.9:1 with a 410px queue minimum. The supporting row uses 1.2:1. Desktop section gaps are 20px.

At widths at or below 1020px, summaries become a two-by-two grid, the main and supporting grids stack, and demonstration actions wrap. At widths at or below 720px, the rail becomes a toggled overlay (220px), main content fills the width, heading actions wrap, comparison and source dialogs stack, and a readable network-segment list appears below the map. The map has a minimum height of 390px by default, 430px on wide desktop, and 440px in the intermediate stacked layout; mobile returns to 390px.

The spatial rhythm uses small inline gaps and deliberate rectangular insets, not floating rounded cards. Panel headers use 18px horizontal padding by default; compact rows and toolbars align to the same underlying structure. Preserve readable hierarchy when reducing density rather than deriving a new default from the smallest local caption.

## Elevation & Depth

Depth is mainly structural: white surfaces, fine borders, neutral inset surfaces, and dividers. Work panels have no shadows. A modal dialog casts a soft shadow above a dimmed backdrop; the open mobile rail has a lateral shadow. The map's white route casing and endpoint selection rings separate symbols from the basemap without making work surfaces appear raised.

### Shadow Vocabulary

- **Dialog:** `0 16px 50px #20212426` for focused modal work.
- **Mobile Rail:** `8px 0 30px #20212426` for open mobile navigation.

**The Flat Desk Rule.** Keep work panels flat. Reserve soft shadows for the modal dialog and open mobile navigation; endpoint rings indicate selection rather than elevation.

## Shapes

Controls, cards, dialogs, chips, avatars, label plates, comparison columns, and progress bars have square corners (0px). Circles are reserved for actual network endpoints and small status dots. The substation endpoint is square, distinguishing it from feeder endpoints. Use thin rectangular borders and clean line segments; do not reintroduce soft card silhouettes, pills, or decorative gradients.

## Components

### Buttons

Compact rectangular actions align an icon and label with an 8px gap. Primary buttons use blue with white text; secondary buttons use white with a gray border; ghost buttons remove that border and use muted text. Reviewed buttons switch to a pale green surface and explicit reviewed copy. Disabled primary actions use gray. Fine-pointer hover deepens the primary blue or applies a neutral surface to secondary actions. Pressed enabled actions scale to 0.98 with a short transition; all retain visible keyboard focus.

### Chips

Square, compact labels use a neutral gray, positive green tint, or warning red tint. They describe state, not navigation or primary actions. Keep their smaller type local rather than extending it to explanatory content.

### Cards / Containers

Flat white panels use a one-pixel neutral border. Headings, toolbars, task rows, and footers are aligned subregions with dividers as needed. Metrics remain a shared strip rather than separate elevated cards. Notices and detail groups use a quiet neutral fill.

### Inputs / Fields

Native selects use a white ground, square border, and a minimum height of 35px by default. Dense policy selectors are local variants (29px minimum). Keep visible labels and native keyboard behavior. Checkboxes use the action blue accent. Shared focus is a blue outline (2px, offset 3px); do not invent unsupported error or validation treatments.

### Navigation

Square icon-and-label rows use muted resting text. Active navigation uses a pale blue fill, deeper blue text, and medium weight. Fine-pointer hover adds a neutral tint; the active row preserves its blue fill on hover. Mobile uses the same navigation in a toggled overlay.

### Explained Task Rows

Plain gray rank numbers anchor title, work type, quantities, and reason. Rank numbers and crew availability labels have transparent backgrounds; alignment and dividers provide structure. Resting rows are white with fine separators; fine-pointer hover adds a quiet neutral ground. Eligible tasks and constrained tasks retain distinct sections with an explanation of the constraint.

### Geographic Network

OpenFreeMap's Positron vector style supplies real Boulder County geography through MapLibre. Geographic labels use the local UI face. Feeder paths, substation, facilities, and incident states are synthetic. Keep the overlay notice and visible provider attribution; the basemap requires internet and uses no API key.

Colored feeder strokes are 4px over an 8px white casing; the selected feeder becomes 6px. A transparent 22px hit layer makes route selection easier without changing appearance. Endpoints use colored dots with white borders; selection enlarges the dot and adds an ink ring. Label plates are square and white. Facility labels are rectangular, with urgent facilities using a red outline. Provide named endpoint buttons, zoom controls, fit-to-network, toggles for facilities and labels, and the mobile segment list. Preserve the loading and retry state when geographic data cannot load.

### Review Dialogs

Native, named modal dialogs use a square bordered white surface, scrollable body, and explicit close control. Standard width is capped at 570px and wide comparison/source dialogs at 960px, with 32px outer clearance. A local review updates the plan's visible reviewed state; it does not authorize dispatch or energization.

Button transitions use 120ms for background and pressed scale, with the scale easing `cubic-bezier(0.23, 1, 0.32, 1)`. Hover effects are limited to hover-capable fine pointers. Map fit and zoom actions use zero-duration changes. The reduced-motion media query removes animations, transitions, and smooth scrolling.

## Do's and Don'ts

### Do:

- **Do** use self-hosted Google Sans for all UI text and local vector-map labels.
- **Do** keep controls and containers square, with circles reserved for network endpoints and status dots.
- **Do** preserve the route-state mapping, textual labels, and visible legend.
- **Do** retain map attribution and a visible notice that utility and incident overlays are fictional.
- **Do** maintain keyboard focus, named dialogs, and readable mobile access to network segments.
- **Do** describe operator review as a local presentation state.

### Don't:

- **Don't** reintroduce sage surfaces, rounded cards, decorative gradients, or slogans.
- **Don't** turn tiny attribution or incidental captions into the default text scale.
- **Don't** substitute real utility assets or fire claims for the synthetic overlay.
- **Don't** imply that review dispatches crews, connects utility systems, or authorizes energization.

The overview shows impact numbers, the map, and the next eligible tasks. Omit repeated captions, scenario/version tags and metric footnotes. Show line names only for the selected segment by default; the Line labels control reveals all names. Put complete reasoning, crew roles, and prior updates in their supporting dialogs.
