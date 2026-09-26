---
name: PitMaster
description: Run a poker game of any size. Raw shell, real chips, one big board for the room.
colors:
  paper: "#fdfdfd"
  field: "#fefefe"
  ink: "#333333"
  pencil-gray: "#747474"
  rule-line: "#e1e1e1"
  rule-line-strong: "#929292"
  concrete: "#f4f4f4"
  concrete-deep: "#ebebeb"
  concrete-deeper: "#dfdfdf"
  hyperlink-blue: "#2c56a8"
  heart-red: "#b6322d"
  ledger-green: "#27713d"
  table-felt: "#22563d"
  felt-chalk: "#f2f2f2"
  legal-pad: "#faf1cb"
  garage-night: "#151515"
  chalk: "#dbdbdb"
  night-gray: "#959595"
  night-line: "#303030"
  night-line-strong: "#5d5d5d"
  night-block: "#1d1d1d"
  night-block-deep: "#262626"
  night-field: "#101010"
  night-link: "#8cb6f4"
  night-red: "#ea6b60"
  night-green: "#66be7b"
  night-felt: "#194430"
  night-pad: "#383014"
  tv-felt: "#123927"
  tv-banner: "#eed27d"
typography:
  display:
    fontFamily: "Times New Roman, Times, serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Times New Roman, Times, serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
  numeric:
    fontFamily: "ui-monospace, Cascadia Mono, Courier New, monospace"
    fontSize: "14px"
    fontWeight: 400
    fontFeature: "tnum"
  tv-clock:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "min(22vw, 34vh)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  tv-label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "max(20px, 3.2vw)"
    fontWeight: 400
    letterSpacing: "0.08em"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "6px"
  md: "12px"
  lg: "18px"
  xl: "24px"
components:
  button:
    backgroundColor: "{colors.concrete-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0px 10px"
    height: "28px"
  button-hover:
    backgroundColor: "{colors.concrete-deeper}"
    textColor: "{colors.ink}"
  button-big:
    backgroundColor: "{colors.concrete-deep}"
    textColor: "{colors.ink}"
    padding: "0px 18px"
    height: "40px"
  button-link:
    textColor: "{colors.hyperlink-blue}"
    padding: "0px"
  button-danger:
    backgroundColor: "{colors.concrete-deep}"
    textColor: "{colors.heart-red}"
    padding: "0px 10px"
    height: "28px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0px 6px"
    height: "28px"
  block:
    backgroundColor: "{colors.concrete}"
    padding: "12px 14px"
  felt:
    backgroundColor: "{colors.table-felt}"
    textColor: "{colors.felt-chalk}"
    padding: "14px"
  warn:
    backgroundColor: "{colors.legal-pad}"
    textColor: "{colors.ink}"
    padding: "8px 12px"
  pill:
    typography: "{typography.label}"
    padding: "0px 6px"
  tv-banner:
    backgroundColor: "{colors.tv-banner}"
    textColor: "{colors.garage-night}"
    padding: "1vh 2vw"
  tv-toast:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.garage-night}"
    padding: "2vh 3vw"
---

# Design System: PitMaster

## 1. Overview

**Creative North Star: "The Garage Casino"**

A folding table, a real case of clay chips, a TV balanced on a milk crate. PitMaster is homemade on purpose: the surface looks like a browser with its stylesheet half loaded (Times headings, Arial body, blue links, square gray buttons, hairline rules), in true neutral greys like are.na, the same "ugly website that looks good" energy as craigslist, are.na and tinybones. Nothing is decorated for its own sake. Density is high, containers are rare and hierarchy comes from type and rules, not boxes.

The casino shows up only where it's real. The chips are drawn stroke for stroke from the sets in the host's case. The TV is one huge board. A level going up, a bust, a color-up and the winner screen get flashes, sound and big type. Everything else stays as plain as a house rules sheet taped to the wall.

This system rejects the **SaaS dashboard** (rounded cards on cards, gradients, hero-metric stat tiles, Inter plus a purple primary button) and the **online casino** (neon, gold glitter, slot-machine flashing, jackpot fonts). If a screen could pass for either, it's wrong.

**Key Characteristics:**
- Browser-native shell: Times + Arial + monospace numbers, blue hyperlinks, square bordered buttons, zero radius, zero decorative shadow.
- Neutral and soft, never harsh: pure greys with zero tint (are.na), #333 ink instead of black, a near-white page and light grey blocks.
- One control height: buttons, inputs and selects that sit in a row are all 28px (big actions 40px), so rows line up like a real toolbar. On a touch screen the one height is 36px (big 44px), sized for a finger.
- Icons come from one library (Lucide, via `Icon.svelte`), square-capped and sized to the text. No unicode arrows or emoji as UI glyphs.
- Tonal gray blocks (are.na) and hairline ledger rules (craigslist) instead of cards: under headings, between rows, above the footer. Whitespace does the big breaks.
- The objects are the craft: SVG chips, chip stacks, the blinds clock.
- One system at two scales: the TV is the dark site blown up to room size.
- Drama is an event, never an ambient state.
- Layout is a single 1100px column with 16px gutters; two columns at most, collapsing below 800px.

## 2. Colors

A neutral grey shell (are.na: near-white page, #333 text, light grey blocks and hairlines) with a handful of functional signal colors, repeated in a dark "garage night" set that the TV shares. All tokens are authored in OKLCH in `src/app.css`; the hex values here are their sRGB equivalents. Contrast is deliberately softer than screen black on white (ink on paper is about 12.5:1, not 21:1) while every text pair still clears WCAG AA.

### Primary
- **Hyperlink Blue** (#2c56a8; night: Night Link #8cb6f4): every link and link-style button. A deeper, calmer take on the browser default. Links carry a faint underline (30% of the link color) that goes solid on hover.

### Secondary
- **Heart Red** (#b6322d; night: #ea6b60): the red suit in the logo, danger buttons, bad numbers (short stacks, a bank that doesn't balance), and the bubble (one bust from the money) on the dealer screen and the TV. Brick, not fire engine. Never decoration.
- **Ledger Green** (#27713d; night: #66be7b): good states (late reg open, money that adds up, a Running clock).

### Tertiary
- **Table Felt** (#22563d; night: #194430; TV: #123927) with **Felt Chalk** text (#f2f2f2): the felt behind chip stacks and the TV background on breaks. Felt appears only where chips sit. Inside felt, muted text and red are re-mapped so they stay readable on green.
- **Legal Pad** (#faf1cb; night: #383014): warnings, the current level row, Paused pills and text selection. The yellow of a note stuck to the table.
- **TV Banner** (#eed27d): the host's message strip on the TV and the level label during a level-change flash, with Garage Night text.

### Neutral
- **Paper** (#fdfdfd), **Field** (#fefefe) and **Ink** (#333333): page, input faces and text.
- **Pencil Gray** (#747474): muted text, form labels, table headers, hints.
- **Rule Line** (#e1e1e1): dividers and table rules. **Rule Line Strong** (#929292): the edges of controls (buttons, inputs, kbd), strong enough to find at 3:1.
- **Concrete** (#f4f4f4), **Concrete Deep** (#ebebeb), **Concrete Deeper** (#dfdfdf): gray blocks, button faces and the button hover face.
- **Garage Night** (#151515), **Chalk** (#dbdbdb), **Night Gray** (#959595), **Night Line** (#303030 / strong #5d5d5d), **Night Block** (#1d1d1d / #262626): the dark set, used by dark mode (`[data-theme="dark"]`, picked in Settings or following the system) and by the TV.

### Named Rules
**The Signal-Only Rule.** Red, green, yellow and felt each mean one thing. A color that doesn't signal a game state or a link has no business on the page.

**The Never-Alone Rule.** Color never carries meaning by itself. Every red number has a sign or word, every chip shows its printed value, every state has a label. Color-blind hosts run games too.

**The One Stage Rule.** The TV palette is the garage-night palette at room scale, not a separate brand. In code the `--tv-*` tokens are aliases of the `--night-*` tokens, so the TV and dark mode cannot drift apart.

**The Neutral Grey Rule.** Neutrals are true greys (OKLCH chroma 0), never tinted warm or cool; the user rejected a brownish paper tint. No #000 and no pure-black text: the darkest thing on a page is Ink (#333), and nothing is harsher than Ink on Paper. Hue belongs only to signals.

## 3. Typography

**Display Font:** Times New Roman (with Times, serif)
**Body Font:** Arial (with Helvetica, sans-serif)
**Label/Mono Font:** ui-monospace (with Courier New, monospace)

**Character:** The default fonts of the web, used without apology. Times gives headings a printed, house-rules-sheet voice; Arial keeps everything else plain and dense; monospace makes every number line up like a ledger.

### Hierarchy
- **Display** (400, 30px, 1.2, -0.01em): page titles (h1) and the logo (23px serif). Only one per page.
- **Headline** (400, 21px, 1.2): section titles (h2) in Times. Big action buttons run 16px.
- **Title** (700, 15px, Arial): sub-sections (h3). Bold sans, so it reads as a label rather than a headline.
- **Body** (400, 14px, 1.5): everything else. Prose stays under 65 to 75ch.
- **Label** (400, 12px, Pencil Gray): form labels, table headers, hints. Pills use 11px uppercase with 0.04em tracking.
- **Numeric** (monospace, tabular figures): every blind, stack, buy-in, dollar amount and clock, on every screen.
- **TV Clock** (Arial 700, up to 19u, 0.84, -0.03em): the biggest thing in the house. The TV sizes everything off one unit, `--u` = min(1vw, 1.78vh) (1% of the width on a 16:9 screen), so the board keeps its proportions on any TV; the middle column also caps its type by its own height and width (container units), so a banner, a callout or long blinds shrink the clock instead of pushing anything off screen. Blinds and ante run up to 7u, side stats 3.7u, labels 1.05u uppercase tracked 0.14em. Nothing drops below 12px.

### Named Rules
**The Ledger Rule.** Numbers are always monospace with tabular figures. Money and blinds must line up in columns and never jitter while a clock ticks. The TV is the one exception: at room size monospace reads as code, so the board sets its numbers in Arial Bold, whose figures are all one width anyway (tabular-nums), and the clock never jitters.

**The Couch Test Rule.** On the TV, anything the table needs mid-hand (clock, blinds, next level, players left) is readable from 10 feet in a dim room. Nothing critical is thinner than regular weight or smaller than 2.2vw.

**The Case Rule.** Headings, labels, buttons and links are Title Case. Sentences are sentence case. Uppercase comes only from CSS on pills and TV labels, never typed into the source.

## 4. Elevation

Flat. There are no drop shadows, no layered surfaces and no z-depth in the shell. Depth comes from tonal blocks (Concrete on Paper) and hairline Rule Lines. The real shadows belong to the real objects: under each chip stack, because real chips on felt cast one, and on the home page's desk toys. The chips and the toys are the only things drawn in 3D.

### Shadow Vocabulary
- **Chip edge** (`box-shadow: 0 1px 0 rgb(0 0 0 / 0.45)`): under every disc in a chip stack.
- **Held** (a soft 30px shadow of ink at 45%): under the calculator only while it's picked up and being dragged, gone the moment it's set down.

### Named Rules
**The Flat Table Rule.** Surfaces are flat at rest and flat on hover. Hover darkens a button face one Concrete step and firms its edge; press goes one step further and sinks the button 1px, like a key. Nothing lifts and nothing inverts.

**The Ledger Lines Rule.** Hairlines (Rule Line) go where a ruled ledger would have them: under every section heading, sub-heading and form group title (the whole row when a heading shares it with a link or status). Page titles (h1) have no rule, between list and settings rows, on tables, above the footer and under the header. Big breaks between areas are whitespace (`<hr>` draws nothing), and form groups are a bold legend over their fields, never a box. The TV toast is set off by dimming the board behind it to half, not by a border or a shadow.

**The Hairline Rule.** Every border, rule and divider is one hairline (`--hair`): one real pixel of the screen, so 1px on an ordinary monitor and 0.5px on a sharp one. No double borders, no rings of page color around a box, no thicker bottom edge on a key. Only three things are heavier on purpose: the 2px focus ring, the current tab's 2px rule in the header, and the chips. On the TV the hairline is a full CSS pixel, because a single real pixel disappears across a room. Anything that butts against a hairline (the + tucked under an amount box, the segmented choice's frame) offsets by `--hair`, never a literal 1px.

**The No Dot Rule.** A line of text with its one link ("Default Chip Set: Dice Chips 300" and Change, "Showing: On Break" and Clear) puts them at either end of the line (`.spread`): the text on the left, the link on the right. A run of links (Copy Recap, Download Spreadsheet, Delete) stays together, set apart by space on one baseline with the `.links` class (a 12px gap). Neither is ever joined with a "·". The middle dot only separates facts: Cash Game · 1/2 · Sep 25.

## 5. Components

### Buttons
Blunt, native and square, like an unstyled `<button>` that someone put a border on.
- **Shape:** square corners (0px).
- **Height:** one control height. Buttons, text inputs, number inputs and selects are all 28px tall, so anything sitting side by side lines up. Big buttons are 40px; when a big button shares a row with small ones (the dealer clock controls), the whole row goes big.
- **Touch:** on a touch screen (`pointer: coarse`) the one height becomes 36px and big 44px, fields read at 16px (smaller and phones zoom the page in when one is tapped), checkboxes grow to 20px, and link buttons and the links in action rows get a finger-sized hit area (padding cancelled by a negative margin, so nothing moves; at a table row's right edge it grows left instead). Nav tabs grow taller without the header growing.
- **Default:** Concrete Deep face, hairline Rule Line Strong edge, Ink text, 0 10px padding, content centered with inline-flex and a 6px gap for an icon.
- **Hover:** face darkens to Concrete Deeper and the edge firms to Pencil Gray, 120ms ease-out-quart. **Active:** face drops to Rule Line and the button sinks 1px (70ms). A keyboard shortcut pushes its on-screen button and `<kbd>` hint down the same way (`.down`). Shortcut hints name the modifier the way the computer does (⌘ on a Mac, Ctrl elsewhere) and disappear on touch screens (`.keys-hint`), where there's no keyboard to press.
- **Icons in buttons** answer a hover in the direction they point: arrows, chevrons, undo, play and send slide 2px, plus turns 90°, external-link nudges up and right, shuffle's arrows trade places, repeat does half a lap, the Bust skull tilts. Pointer devices only.
- **Big:** 16px text, 40px tall, 0 18px padding. The one main action on a screen (New Cash Game, Deal It, Start).
- **Link:** no face, no border, no fixed height, Hyperlink Blue, underline on hover. Inline and table-row actions (Edit, Remove, Go). A `.muted` link button goes Pencil Gray for minor actions like remove.
- **Danger:** Heart Red text with a red-leaning edge; hover tints the face 12% red. Bust and Delete.
- **Disabled:** 40% opacity, default cursor, no hover change.
- **Focus:** every control, link and field shows a 2px Hyperlink Blue outline offset 2px on `:focus-visible` (fields use offset 0 and a blue border). Keyboard only; mouse clicks don't draw it.

### Icons
- **Library:** Lucide (`@lucide/svelte`), always through `src/lib/components/Icon.svelte` so size and stroke stay consistent.
- **Style:** 2px stroke, square line caps and mitered joins (sharper, less friendly than Lucide's rounded default), sized 1.15em so they match the text they sit beside, `aria-hidden` with the label always in text.
- **Rule:** no unicode arrows, geometric symbols or emoji used as UI glyphs. Suits (♠ ♥) in the logo stay, because they are the brand, and the trophy and coffee on the TV are replaced by icons too.

### Pills
- **Style:** hairline border in the current text color, 0 6px padding, 11px uppercase text tracked 0.04em. No fill.
- **Use:** states and tags (Yours, Default, Running, Not Started, Cash, MTT).
- **Clock state:** `data-s` tints them. Running goes Ledger Green, Paused gets a Legal Pad fill. The word always carries the meaning.

### Blocks / Containers
- **Corner Style:** square (0px).
- **Background:** Concrete for gray blocks; Legal Pad for warnings; Table Felt (`.felt`) only behind chips; otherwise nothing.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none. `.box` is a bare wrapper; the rule under its heading does the work.
- **Internal Padding:** 12px 14px (warnings 8px 12px, felt 14px).
- **Clock box:** the dealer clock sits in a hairline Rule Line Strong frame on a Field face; on breaks the face turns Concrete.
- Blocks never nest. Most content needs no container at all.

### Inputs / Fields
- **Style:** Field face (a hair lighter than Paper), hairline Rule Line Strong border that darkens to Pencil Gray on hover, square, 28px tall with 0 6px padding (same height as a button). Number inputs are 90px wide and monospace. Colors are picked from flat swatches: a joined strip of 26x28px squares, each filled with its color and divided by hairlines of Rule Line Strong, with the native picker opening from an invisible input on top. The strip's edge firms on hover like any field; nothing is drawn inside a color. A row only offers the colors its chip design actually draws. An amount box and its + button join into one control (the + tucks under the box's edge). Checkboxes are square like every other control: a 15px hairline box on a Field face that fills with Ink when checked, the check cut out of it in the Field color. Ranges use Ink as their accent color.
- **Labels:** stacked above in 12px Pencil Gray, Title Case; checkbox labels sit inline.
- **Focus:** blue border plus the 2px Hyperlink Blue ring.

### Tables
Craigslist listings: full width, collapsed borders, a hairline Rule Line under each row, 4px 8px 4px 0 cell padding, 12px Pencil Gray headers (always Arial, even over a right-aligned number column), numeric columns right-aligned in monospace (a word-button inside a number cell, like Fix, stays Arial). A table wider than its column scrolls inside its own box (`.scroll-x`), never the page. The table the host works in all night (cash players) gets the full page width. The current row gets a Legal Pad fill and finished rows go Pencil Gray.

- **On a phone (600px and under, or a phone on its side)** the tables the host acts in never hide an action off the edge. The players tables (`.roster`) turn each player into a short block: seat, name and main action (Bust) on top, the name taking whatever the line leaves so a long one shows in full, and the counts underneath, each with an 11px uppercase Pencil Gray label (`data-l`), the same voice as the stats strip. A busted player's actions (KO'd By, Undo Bust) ride after the counts. Cash puts its four controls on their own line instead (`.acts-below`), wrapping to a second on the narrowest phones. The tournament clock's buttons become an even grid (Pause the whole way across, then Back and Next, then the minute nudges), and the cash blinds drop under the session clock, lined up with it. Past games stack as date, then name, result and actions under the name. The chip editor stacks each chip into value and count, then face and design, then colors with the worth at the right. Secondary columns (`.hide-sm`) step aside.
- **Stats strip** (dealer screen): a ledger strip of cells split by hairline Rule Lines, 11px uppercase labels over 20px monospace numbers. One row when they fit; otherwise even rows (six go three across below 900px, four go two by two on a phone), never a cell left on its own.

### Navigation
A single top bar: serif logo (23px, ♠ plus a Heart Red ♥) followed by plain Hyperlink Blue text links (Games, Players, TV Code, Settings, and Lock when a passcode is set; new games start from the Games page, chip sets are edited in Settings, and all three are in Commands) on one line, sitting on a hairline Rule Line. The current page's link (`aria-current="page"`) turns Ink with a 2px Ink rule that sits on the header line, like a tab. Hovering another tab draws the same rule in from the left and sends it out the right when the pointer leaves. The tabs never wrap: whatever doesn't fit folds, from the right, into a … (Lucide ellipsis) tab that drops down a hairline-bordered list of the rest. When the current page is folded, the … carries the tab rule. The bar sticks to the top of the page on scroll (paper-colored, so content slides under it), and on the New Game page the title row (with its template and Switch links) pins right under it (not on phones or short screens like a phone on its side, where the screen needs the room; on a phone Deal It pins to the bottom of the screen instead, over a hairline), with a short paper fade instead of a rule once content scrolls beneath. Anchor jumps and sticky side panels land below both.

### Settings and Export

Settings is six tabs, one open at a time: a column of tabs down the left (a Lucide icon and a name, under small uppercase group labels: Games holds Your Game, New Games, Chip Sets and TV; You holds General and Your Data) that sticks while the open tab scrolls beside it. The open tab gets a Concrete fill and a hairline edge. The tab rides in the URL hash, so a link can open any tab or a part of one (`#data` opens Your Data at Export & Import). On a phone the tabs become a two- or three-column grid of outlined cells over the open tab. Chip Sets is the chip set editor (the set list beside a table of chips) and runs wider than the other tabs. Each switch in Your Game is independent (cash rake, tournament house cut, then the extras as checkboxes with their one-line job under the name); turning one on slides its own fields open right under it. On a new game, anything switched off is one "Also for this game" link away, and an added section carries a Remove link in its legend. Import is a dashed drop box that goes solid in Link Blue with a Concrete fill while a file is over it; a picked file opens an inline preview (never a modal): what's in it, Add to This Browser or Replace Everything as a segmented choice, what the import will do in numbers, and a Replace button in the danger style when it will overwrite. After an import, the games in progress are links, one click from running them, and Undo Import puts everything back as it was (for that visit; nothing extra is saved).

### Footer and Legal Pages

The footer is one quiet line over a ledger rule: the copyright (linking to Wyzie LLC) on the left, Pencil Gray links (Export & Import, Privacy, Terms) on the right that come up to Ink on hover. Privacy and Terms are one 68ch column of Arial, dated under the title, the short version in a Concrete block at the top, and the other page linked at the foot. Plain words, no legalese headings in capitals.

### Command Palette
Ctrl/⌘ K anywhere, or whatever the host set in Settings > Keyboard. The shortcut is recorded by clicking a keycap button (it rings in Link Blue while listening, Esc backs out) and refused, with a reason, when it would type, belongs to the browser, or is undo/copy/paste. A key on its own (like /) never fires inside a text box. Every hint that names the shortcut reads the saved one. The toast's face at desk size: field fill and a hairline ink edge, over a scrim of page color at 55%. Groups are small uppercase Pencil Gray labels; the highlighted row is a Block 2 fill, never an accent. Commands that need text (Add Player, Change Blinds) turn the input into a prompt with the command's name in bold before it. Pages add their own commands while they're on screen.

### Calculator
The header's calculator icon, **C** anywhere outside a text box, or Open Calculator in Commands. It floats in the browser's top layer, above the page, the command box and a shuffle in flight, and never blocks the page: everything underneath still works. The palette's face (field fill, hairline ink edge) at 244px, with keys at the big control height; = is the one felt-green key, and the operator waiting for its second number is lit in ink. Drag it by its bar and it swings a few degrees toward the pull; toss it and it slides to a stop, knocking off the screen's edges. **Ghost** fades it to a see-through outline and lets clicks fall through to the page, leaving only the ghost button solid to bring it back. The chevron (or a double-click on the bar) folds it down to just the answer. Math is on paper order (× and ÷ first), `200 + 10%` is 220 (a percent after + or − is that much of what came before), = again repeats the last step, and a live "= total" runs under the display. Earlier answers stack up above it like a till roll; tap one to use it. Copy puts the plain number on the clipboard, paste takes one in, and **Into Buy-In** (named from whichever number box on the page was last in use) types the answer straight into that box. Nothing in it is ever saved: the tape and where it sits live in memory and are gone on reload.

### Chips (signature)
SVG chips (`Chip.svelte`), everywhere they're drawn (the TV, the dealer screens, lists, the editor), lying on the table in 3D: tilted back so the face is an ellipse (82% as tall as it is wide) lit from the upper left, the front of the edge showing under it as a thick band in the chip's color with the edge inserts that face the viewer (shaded dark at the sides like a cylinder), and a soft shadow on the table. A pointed-at chip spins its face inside the tilt, so it turns in perspective; the edge stays put. The loading chips (`Dealing.svelte`) are edge-on discs shaded the same way. The faces are drawn after real chips, with every color and proportion measured off the manufacturers' product photos (the median of each part of the chip), so a preset looks like the set in the host's case: **Monte Carlo** (six three-part edge inserts, side-center-side, with molded crowns between them; a ring in the insert-side color; a gold glitter ring; a silver label printed "MONTE CARLO" over "POKER CLUB"; serif denomination), **Casino Del Sol** (after DA VINCI's set: a white face whose thin rim shows four long colored arcs and four white inserts, each with a colored block; red "CASINO DEL SOL LAS VEGAS" arc text, a pale green laurel and shield, three stars, italic denomination) and **Dice** (six edge inserts with dice pips between them and a dashed ring). The built-in sets are KardShark's low-denomination Monte Carlo, DA VINCI's Casino Del Sol and Monte Carlo Poker Club, Playzaic's 1,000-chip Monte Carlo tournament set and common 11.5g dice chips, which come first and are what a first visit starts on. Small details drop out below 34px. Chips always show their printed value, which makes color-only identification unnecessary. **Chip stacks** are seen from the same height: every disc is a short cylinder, a pill whose round ends are the foreshortened ellipse of its face (`--e`, 0.34 of the width), set one chip's thickness (`--t`, 0.1 of the width) above the one under it, so each disc shows its curved edge band (the edge-spot pattern under a cylinder shade, with a dark seam below) and the top chip shows its face, spots round the rim and a ring inside. A soft shadow sits under the stack on the felt. Each disc turns its pattern and sits a hair off-center so the spots never line up into stripes, dropping in with a staggered 0.36s ease-out-expo fall (`--d` delays a whole stack, so a row of stacks builds left to right). Tapped, a stack is **shuffled** like at a real table: lifted onto the top layer of the page (so nothing covers or clips it), cut in half, the top half set down beside the rest with a clear gap between them (0.64 of a stack's width each way), then the two pushed together and zipped up from the bottom, one chip from each side in turn. Anything that lays out stacks leaves that much room beside each one. A stack of three or fewer just hops, disc by disc. On the home page the chip row is tossed on once at load (0.5s ease-out-expo, 60ms stagger) and then sits still. In the chip editor, changing a chip's design flips it over onto its new face (edge-on to flat, 0.56s ease-out-expo); Set Every Chip To… flips the column one after another.

### Desk Toys
The home page's toys (`Toys.svelte`, behind Settings > Home Page Toys) are built as solid objects under the chips' light, from the upper left, so every shadow falls down and to the right. Felt is cloth: `--cloth`, a fine noise laid over `--felt` with soft-light, wherever a toy has a table. **Cards** are card stock at a real card's proportions (2.5 by 3.5): corner indices at both ends, pips laid out the way a printer lays them (the lower half upside down), court cards as a framed letter mirrored top to bottom, the ace of spades printed big. Backs have a white border round a fine lattice in the house felt with the logo's ♠♥ in a seal. Each card casts a shadow on the one under it that opens up as it rises, and a card comes up toward you as it turns over. **Chip Sort** spills the host's own chips onto a felt mat with a stitched hem and a rubber back, tipped to the chips' own angle; chips further back are smaller and drawn in toward the middle. **Dice** are clear red cellulose with razor edges, flush white pips and a glint on the face that looks up at the light, on a felt bed inside a padded wooden rail with a front edge; their shadows fall away from the light and spread and fade as they leave the felt. **Roulette** is a turned wooden drum: the rim and polished ball track on top, a slope stepping down past the diamonds to a wheel sunk well inside it, a cone rising out of the wheel's middle and a chrome turret standing on it. Depth is flat layers stacked close enough to read as solid, so the ball runs round the track, drops down the slope and settles into a pocket below the rim. The **Money Counter** is a machine on the counter, drawn face by face in 3D.

### The TV Board (signature)
The site's dark mode at room scale: Garage Night background, Chalk text. It is laid out like a card room's tournament clock: a header (game name in Times, type and buy-in, time of day), the host's banner, then three columns divided by hairline rules (15% chalk, so they read on felt too) and a footer with the chip legend and house rules. The left column is the field (Players with the bubble or in-the-money call, Avg Stack in big blinds, Rebuys and Add-Ons, then Late Reg, rebuy status and elapsed time at the foot); the middle is the clock (level label and state pill, the clock, the progress bar, a Blinds | Ante strip split by a hairline, then Next Level and Next Break); the right column is the money (Prize Pool, a payout ladder with ledger lines that shows nine places and counts the rest). Every stat is the same pair: a small uppercase label over a bold number. The clock drops its leading zero (8:27, not 08:27) and its colons sit a touch above the baseline, like a wall clock. A paused clock dims under a blinking Paused pill. Before the first hand the left column shows the seat draw, one column per table (and widens for it). Cash puts the seated players on the left, the stakes big in the middle with the session bar and Session / Time Left / Ends under it, and buy-in range, what's on the table and the rake on the right; with money off the board and no rake, the right column goes away. Portrait TVs keep the clock across the top with the two stat columns side by side under it; only phones scroll. The clock owns the screen. Breaks switch the background to TV Felt. The final minute turns the clock Night Red and blinks it. Level changes lift the main panel to Night Block Deep and turn the level label TV Banner yellow (0.6s x 4); no full-screen inversion. New blinds roll up into place when the level turns over. The last five seconds of every level (and break) tick out loud, one a second, before the level sound. Busts and wins fade and scale a Chalk toast in mid-screen (0.45s ease-out-expo, from 0.85). The winner screen goes to TV Felt: the trophy lands once (no looping bob), "Champion" over the winner's name in big Times, the pot under the name (a row of side-view stacks of the game's own chips, dropping in one stack after another), then the final standings as a ledger (place, name, payout), in two columns past five places. The host's message slides in as a TV Banner strip with Garage Night text. Color-up and add-on callouts sit on a Night Block Deep panel so the chips show their own colors (on the felt, a darkened felt instead of a gray box); two callouts stack as equal-width boxes. Under Players, "On the Bubble" shows in Night Red and "In the Money" in Night Green. House rules sit in the footer beside the chips: two share a line, more take turns every ten seconds with a slow fade. The host can keep money off the board (Settings > Money on the TV: pool, payouts and buy-ins drop out, Pays reads "Top 3") and can turn on the announcer, which reads the new blinds, breaks, busts and the winner out loud after the beep. The controls fade out when the mouse sits idle.

**Every sound has a visual twin.** A TV's speakers are often off, muted or down the hall, so nothing on the board relies on sound alone. Every TV sound goes through one `cue()`, which also runs the **flare**: the edge of the screen glows in the moment's color and fades, one to four pulses (yellow for a level, money in, the host's message and the winner; red for busts, the level warning and the countdown; green for a break and the bubble bursting; chalk for racking up, shuffles and seat moves). It is opacity only, never faster than about one pulse a second, so it stays on under reduced motion. Each moment also has its own change on the board:

- **New level:** the level label, the clock, the blinds and Next Level roll up into place, the main panel flashes, and the logo's suits in the header turn over (♠♥ on odd levels, ♦♣ on even).
- **Level warning:** a Last Minute (or N Min Left) tag stamps onto the level row as the clock turns red.
- **The last five seconds:** each tick punches the clock out in banner yellow and it settles back (the minute's blink steps aside so the ticks read cleanly), and each tick sounds a little higher than the last.
- **News** (busts, rebuys, seats, cash-outs) arrives as a toast with its own icon and entrance: a bust slams down like a stamp, money rises, a shuffle is dealt in from the side. Wins and deals skip the toast; the winner screen is the announcement.
- **Numbers:** the players count drops into place, the average stack and the prize pool count to their new values, and money going up counts out of banner yellow.
- **The bubble:** On the Bubble stamps in; when it bursts, In the Money stamps in and a flash of yellow runs down the payout ladder. Places on the ladder fill in with the name of whoever finished there, stamped on as it happens.
- **The host's message:** the banner slides in and flashes three times.
- **Chips:** a colored-up chip sinks and fades in the legend; color-up chips on a callout flip onto the felt one after another.
- **Seats:** seats drawn (or a player sitting down) are dealt into the list one row at a time.
- **The winner:** the trophy lands, the name wipes up, the pot drops, and the standings are dealt out a line at a time, but only if the game just ended (a reload shows it still).

Entrances only play for things that arrive mid-game; on the TV's first paint, or a reload, everything is simply there.

## 6. Motion and Sound

Motion says what just happened; it never decorates. Three speeds live in `app.css`: `--dur-press` (70ms), `--dur-hover` (120ms), `--dur-move` (260ms), all easing out (quart or expo). Svelte transitions take their timings from `src/lib/motion.ts` (`reveal`, `leave`, `reorder`, `rise`), which drop to zero under reduced motion.

- **Pages** swap with a view transition: the old page fades out in 110ms, the new one rises 6px into place, and the active tab's rule slides to its new tab.
- **Theme** changes wipe in as a circle from the button that was clicked.
- **State**: numbers that change get a Legal Pad swipe (`use:bump`), and money totals (prize pool, bank, avg stack) count to their new value (`Count.svelte`, 0.52s ease-out-quart, whole numbers stay whole; instant in a hidden tab or under reduced motion); busted players slide to the bottom of the table (flip) and their finishing place lands like a rubber stamp; drawn seats are dealt to each row in turn (45ms apart); rows added or removed fade; the level highlight glides down the structure; a paused clock dims; the progress bar glides between ticks.
- **Moments**: when a tournament ends in front of the host, the pot (a few stacks of the game's own chips) drops in beside the winner's name. Effects tied to a moment (`use:fresh`) only play if it just happened, so reopening a finished game doesn't replay the night; effects tied to a change (`use:bump`, `use:replay`) never play on load.
- **Feedback**: toasts (`toast()` in `toast.svelte.ts`) confirm things that happened, with a field face and a hairline ink edge: no ring, no shadow. Questions stay native `confirm()`. A check mark only appears when something just worked, so every check writes itself in, short stroke first (0.42s).
- **Loading** is `Dealing.svelte`, chips stacked one at a time, never a spinner.
- **Small discoveries**: hovering the logo turns ♠♥ over to ♦♣; the hero chips flip when clicked, and flipping every one of them in order, left to right, sends the whole row up in a wave; any chip spins when pointed at (tapped, on a touch screen) and any stack of chips hops disc by disc when tapped (`src/lib/toys.ts`, not for chips inside a control); the 404 deals its status code as cards ("Misdeal."). These, the chips and the TV are the only things with curves.

**Sound** (`src/lib/sound.ts`) is synthesized, never files. The TV keeps its loud event bleeps. The interface has a quiet tactile layer, and each sound is the real object it stands for:

- **Presses:** a tick when a button goes down (a rounder, deeper thock for big buttons), a lighter tick for link buttons, a pitched click for switches, ratchet detents on sliders, keypad ticks on the TV code box.
- **Chips have voices.** Every chip has its own note, from its value, on a major pentatonic scale (1 is a middle C, 25 an A, 100 a D, 1000 an A), so a set played low to high is a little tune that never clashes, and a chip sounds the same wherever it's drawn. Tap one: it clacks on its note. Point at one: it whirrs as it spins on the felt. Tap a stack: the cut half is set down with a clack, then the two halves riffle together, a clack per chip, and the stack is squared up with a knock. The hero chips flip like a coin (a thumb's tink, a flutter, a landing on their note that wobbles to rest), and all of them in order play up the scale twice under a shower of chips. In the chip editor, a new design flips each chip over onto its note, one after another; Sort by Value plays the set up the scale; picking a new color taps the chip's note.
- **Money:** a chip clack for buy-ins, rebuys and add-ons; chips dropped through the slot into a hollow wooden rake box; a stack sliding into the rack for a cash-out; the till's drawer and bell when the bank balances; "ship it" for a tournament ending (the pot raked over in seven clacks, then three bright notes).
- **The clock:** a riffle shuffle for the first Start of the night; after that it stops and starts like a tape machine winding down and up. Next and Back clatter over like a split-flap board (lower going back), and minutes go on and off like a kitchen timer's ratchet, climbing or running down.
- **The table:** a fresh deck riffles (Deal It, Run It Back); Draw Seats shuffles, then deals a card to each seat; a bust knocks the stack over (a thud, then chips skittering off, each bounce shorter) with a small, sorry womp womp; Undo Bust and ctrl Z rewind like tape.
- **Everything else:** a thud for deletes; the shackle snapping shut for Lock, and the key turning and two notes up to unlock; a wrong passcode's low note shakes the box, like a door that won't open; menus and the command palette pop open and pop back down, and arrowing through the palette ticks a detent, higher near the top; an import file lands like a card on the felt; the calculator's keys click like the code pad's, its = rings the answer on the note of the chip its size, and a tossed calculator knocks off the screen's edges, harder the faster it hit; two soft rising notes for success toasts and a low one for errors.
- **The room:** the interface's sounds come back off a short, dark room (felt eats the highs), and each one leans a little toward the side of the screen it happened on.

The TV adds room-scale versions: a louder shuffle for the first hand and seat draws, a wall-clock tick for the last five seconds of a level (rising in pitch), a stack knocked over before the low call for a bust, chips hitting the felt for buy-ins, rebuys and reloads, a stack sliding into a rack for a cash-out, chips raked over and a bright run up when the bubble bursts or the table deals, the pot shipped in clacks before the winner's fanfare, and a two-note PA chime for the host's message. Elements pick a sound with `data-sound` or opt out with `data-sound="none"`. It's all behind Settings > Interface Sounds and never carries meaning on its own. Two sliders set how loud: Interface Volume for the clicks and clacks, TV Volume for the TV's alarms, ticks and announcer (a TV on another device follows the host's). 70% is the loudness the sounds were designed at; the slider is squared so it feels even to the ear.

## 7. Do's and Don'ts

### Do:
- **Do** keep the shell browser-native: Times headings, Arial body, blue underlined links, square bordered buttons, hairline rules, all in neutral greys.
- **Do** put the craft into the real objects (chips, stacks, clock, blinds, payouts) before touching the shell.
- **Do** set every number in monospace with tabular figures.
- **Do** pair every color signal with text, a sign or a shape (The Never-Alone Rule).
- **Do** build TV screens from the dark-mode tokens scaled up (The One Stage Rule), sized to pass the Couch Test.
- **Do** save motion, sound and color spikes for real game events: level up, bust, color-up, winner.
- **Do** give every control the shared `:focus-visible` ring and a logical tab order.
- **Do** keep controls that share a row at one height (28px, or 40px for a big row).
- **Do** use `Icon.svelte` for every UI glyph, with the meaning always in the text beside it.
- **Do** respect `prefers-reduced-motion`; the global stylesheet collapses animations to a single instant frame.
- **Do** ease motion out with exponential curves (ease-out-quart or ease-out-expo).

### Don't:
- **Don't** make it look like a **SaaS dashboard**: no rounded cards on cards, no gradients, no hero-metric stat tiles, no Inter plus a purple primary button, no "Welcome back!" chrome.
- **Don't** make it look like an **online casino**: no neon, no gold glitter, no slot-machine flashing, no jackpot fonts. Drama is a moment, never a wallpaper.
- **Don't** round corners. Radius is 0px everywhere, dropdown lists included (where the browser lets a select be styled, its list is a square hairline box with a Lucide chevron); the only curves are the chips (and the playing cards on the 404).
- **Don't** add drop shadows to surfaces or lift things on hover.
- **Don't** use `border-left` or `border-right` wider than 1px as a colored stripe on anything.
- **Don't** nest blocks, or wrap content in a container that doesn't need one.
- **Don't** use bounce or overshoot easing, or loop decorative motion. Only real game states (the final minute, Paused) and loading repeat.
- **Don't** make a sound the only signal, or add one to moving between pages or to typing outside the TV code box.
- **Don't** tint the neutrals (no beige, cream or brown paper), and don't use #000 or full inversions (ink faces with paper text) for hover or emphasis.
- **Don't** use unicode arrows, geometric shapes or emoji (▶ ◀ ❚❚ ⛶ 💀 ☕ 🏆) as interface icons.
- **Don't** introduce a new color that doesn't signal a game state.
- **Don't** type uppercase into the source; use CSS on pills and TV labels.
- **Don't** use em dashes in copy.
