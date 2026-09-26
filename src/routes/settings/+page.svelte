<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Monitor from "@lucide/svelte/icons/monitor";
  import Sun from "@lucide/svelte/icons/sun";
  import Moon from "@lucide/svelte/icons/moon";
  import Download from "@lucide/svelte/icons/download";
  import Upload from "@lucide/svelte/icons/upload";
  import Trash from "@lucide/svelte/icons/trash";
  import Volume2 from "@lucide/svelte/icons/volume-2";
  import VolumeX from "@lucide/svelte/icons/volume-x";
  import Plus from "@lucide/svelte/icons/plus";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Minimize from "@lucide/svelte/icons/minimize-2";
  import Dices from "@lucide/svelte/icons/dices";
  import EyeOff from "@lucide/svelte/icons/eye-off";
  import Merge from "@lucide/svelte/icons/merge";
  import Replace from "@lucide/svelte/icons/replace";
  import Undo2 from "@lucide/svelte/icons/undo-2";
  import FileJson from "@lucide/svelte/icons/file-json";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Keyboard from "@lucide/svelte/icons/keyboard";
  import Lock from "@lucide/svelte/icons/lock";
  import Spade from "@lucide/svelte/icons/spade";
  import CirclePlus from "@lucide/svelte/icons/circle-plus";
  import Coins from "@lucide/svelte/icons/coins";
  import Tv from "@lucide/svelte/icons/tv";
  import Sliders from "@lucide/svelte/icons/sliders-horizontal";
  import ShieldCheck from "@lucide/svelte/icons/shield-check";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { tick } from "svelte";
  import { fade, fly } from "svelte/transition";
  import KeyList from "$lib/components/KeyList.svelte";
  import Seg from "$lib/components/Seg.svelte";
  import RakeFields from "$lib/components/RakeFields.svelte";
  import HouseCutFields from "$lib/components/HouseCutFields.svelte";
  import GameSelect from "$lib/components/GameSelect.svelte";
  import { palette } from "$lib/commands.svelte";
  import { comboOf, heldLabel, keyLabel, keyProblem, DEFAULT_PALETTE_KEY } from "$lib/keys";
  import { settings, saveSettings, resolvedTheme, houseRules, adoptSettings, type Theme } from "$lib/settings.svelte";
  import { revealTheme, reveal, rise, slide } from "$lib/motion";
  import { play, speak, sounds } from "$lib/sound";
  import { toast } from "$lib/toast.svelte";
  import {
    getChipSets,
    exportAll,
    readBackup,
    lockBackup,
    unlockBackup,
    planImport,
    importBackup,
    undoImport,
    lastExport,
    wipeAll,
    getGames,
    getHandles,
    getTemplates,
    deleteTemplate,
    type Backup,
    type LockedBackup,
    type ImportMode,
  } from "$lib/store";
  import { ago, currencySymbol, day, download, duration, money, timeOfDay } from "$lib/util";
  import { savedSize } from "$lib/vault";
  import { vault, lockNow, setPasscode, MIN_PASSCODE } from "$lib/lock.svelte";
  import ChipSets from "$lib/components/ChipSets.svelte";

  const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: "system", label: "System", icon: Monitor },
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
  ];

  // native names so people can find their own language
  const LANGUAGES = [
    ["en", "English"],
    ["es", "Español"],
    ["fr", "Français"],
    ["de", "Deutsch"],
    ["pt", "Português"],
    ["it", "Italiano"],
    ["nl", "Nederlands"],
    ["pl", "Polski"],
    ["tr", "Türkçe"],
    ["vi", "Tiếng Việt"],
    ["tl", "Tagalog"],
    ["ja", "日本語"],
    ["ko", "한국어"],
    ["zh-Hans", "中文 (简体)"],
    ["zh-Hant", "中文 (繁體)"],
  ];

  const CURRENCIES = [
    ["USD", "US Dollar ($)"],
    ["CAD", "Canadian Dollar ($)"],
    ["EUR", "Euro (€)"],
    ["GBP", "British Pound (£)"],
    ["AUD", "Australian Dollar ($)"],
    ["MXN", "Mexican Peso ($)"],
    ["JPY", "Japanese Yen (¥)"],
  ];

  // one tab at a time. the tab rides in the url's #, so a link can open any
  // of them (/settings#chips), and a link to a part of one (#data) opens its tab.
  // only the open one is on the page, so it can rise in when it's picked; the
  // one it replaces goes at once, so the two never stack.
  const GROUPS = [
    {
      label: "Games",
      tabs: [
        { id: "game", label: "Your Game", icon: Spade },
        { id: "defaults", label: "New Games", icon: CirclePlus },
        { id: "chips", label: "Chip Sets", icon: Coins },
        { id: "tv", label: "TV", icon: Tv },
      ],
    },
    {
      label: "You",
      tabs: [
        { id: "general", label: "General", icon: Sliders },
        { id: "yours", label: "Your Data", icon: ShieldCheck },
      ],
    },
  ];
  const TABS = GROUPS.flatMap((g) => g.tabs.map((t) => t.id));
  const PARTS: Record<string, string> = {
    house: "game",
    templates: "defaults",
    appearance: "general",
    keys: "general",
    region: "general",
    lock: "yours",
    data: "yours",
  };
  // the # as the address bar has it. SvelteKit's page.url only follows its
  // own links and goto, not a # typed in or changed some other way.
  let hash = $state(location.hash);
  $effect(() => {
    void page.url.hash;
    hash = location.hash;
  });
  const tab = $derived.by(() => {
    const id = hash.slice(1);
    return TABS.includes(id) ? id : (PARTS[id] ?? "game");
  });

  function pickTab(e: MouseEvent, id: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (id !== tab) goto(`#${id}`, { noScroll: true, keepFocus: true });
  }

  // a new tab opens from its top, with the tabs in view; a link to a part of
  // one lands on that part once its tab is showing. (a fresh load is the
  // layout's to land.)
  let panes = $state<HTMLElement>();
  let settled = false;
  $effect(() => {
    const id = hash.slice(1);
    if (!settled) return void (settled = true);
    tick().then(() => {
      if (PARTS[id]) document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
      else if (panes && panes.getBoundingClientRect().top < 0) panes.scrollIntoView({ behavior: "instant" });
    });
  });

  const AUTO_LOCK: [number, string][] = [
    [30, "After 30 Seconds"],
    [60, "After 1 Minute"],
    [120, "After 2 Minutes"],
    [300, "After 5 Minutes"],
    [600, "After 10 Minutes"],
    [900, "After 15 Minutes"],
    [1800, "After 30 Minutes"],
    [3600, "After 1 Hour"],
    [0, "Only When PitMaster Closes"],
  ];

  let templates = $state(getTemplates());
  const sym = $derived(currencySymbol());

  function removeTemplate(id: string, name: string) {
    if (!confirm(`Delete the template “${name}”? Games made from it stay.`)) return;
    deleteTemplate(id);
    templates = getTemplates();
    toast(`Deleted “${name}”`, "info");
  }

  // the new theme wipes in from the button that was clicked
  function pickTheme(t: Theme, e: MouseEvent) {
    const before = resolvedTheme();
    const apply = () => {
      settings.theme = t;
      saveSettings();
    };
    const after = t === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : t;
    if (after === before) return apply();
    const b = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // keyboard picks have no pointer position, so start from the button's middle
    const x = e.clientX || b.left + b.width / 2;
    const y = e.clientY || b.top + b.height / 2;
    play("swish");
    revealTheme(apply, x, y);
  }

  function pickToys(on: "on" | "off") {
    settings.toys = on === "on";
    saveSettings();
  }

  function pickSounds(on: "on" | "off") {
    settings.sounds = on === "on";
    saveSettings();
    if (settings.sounds) play("chips"); // a taste of what you turned on
  }

  // turning the rake on should rake something: a pot cut unless one was picked
  function toggleRake(e: Event) {
    settings.useRake = (e.currentTarget as HTMLInputElement).checked;
    if (settings.useRake && settings.cashRakeMode === "none") settings.cashRakeMode = "pot";
    saveSettings();
  }

  // the extras a host can switch off; a game that already uses one keeps it
  const EXTRAS = [
    { key: "useBounties", label: "Bounties & Knockouts", hint: "A bounty on every head, and who knocked out who." },
    { key: "useRebuys", label: "Rebuys & Add-Ons", hint: "Buying back in, and topping up at the first break." },
    { key: "useSeats", label: "Seat Draw & Tables", hint: "Drawing seats, and balancing tables as players bust." },
    { key: "useDeals", label: "Final Table Deals", hint: "The ICM and chip-chop calculator." },
    { key: "usePayLinks", label: "Pay Links", hint: "Venmo, Cash App and PayPal links in settle-up and payouts." },
  ] as const;

  function pickMotion(m: "system" | "reduced") {
    settings.motion = m;
    saveSettings();
  }

  // table rules most games play by, whatever their size, one click to add
  const COMMON_RULES = [
    "Cards speak.",
    "Show one, show all.",
    "Verbal action is binding.",
    "No string bets.",
    "One player to a hand.",
    "Protect your hand.",
    "Chips stay on the table.",
    "Straddles are welcome.",
    "Run it twice if both players agree.",
    "Chop the blinds if it folds to them.",
    "Phones down during a hand.",
    "Rebuys between hands only.",
    "New deck on request.",
    "The last hand is announced.",
    "Settle up before you leave.",
    "Whoever runs the game has the final say.",
  ];
  const unusedRules = $derived(COMMON_RULES.filter((r) => !houseRules().includes(r)));
  function addRule(r: string) {
    settings.houseRules = [...houseRules(), r].join("\n");
    saveRules();
  }

  // every save seals all the settings again, so the rules box saves once the
  // typing pauses, and right away when it's left (or this page is)
  let rulesTimer: ReturnType<typeof setTimeout> | undefined;
  function typeRules(e: Event & { currentTarget: HTMLTextAreaElement }) {
    settings.houseRules = e.currentTarget.value;
    clearTimeout(rulesTimer);
    rulesTimer = setTimeout(saveRules, 400);
  }
  function saveRules() {
    clearTimeout(rulesTimer);
    rulesTimer = undefined;
    saveSettings();
  }
  const flushRules = () => rulesTimer && saveRules();
  $effect(() => flushRules);

  // a sample announcement, so the host hears the voice before game night
  function testVoice() {
    speak("Level 5. Blinds are 200, 400, with a 400 ante.");
  }

  function pickClock(c: "12h" | "24h") {
    settings.clock = c;
    saveSettings();
  }

  // ---------- the Commands shortcut ----------
  // click the key, press the new one. Esc backs out, Tab moves on.
  let listening = $state(false);
  let holding = $state(""); // modifiers down so far, shown while recording
  let keyNote = $state<{ text: string; bad: boolean } | null>(null);
  let savedAt = 0;
  const paletteKey = $derived(settings.paletteKey || DEFAULT_PALETTE_KEY);

  // while recording, the palette leaves every key alone
  $effect(() => {
    palette.recording = listening;
    return () => (palette.recording = false);
  });

  function listen() {
    // the Enter or Space that saved a shortcut also clicks the button on its way up
    if (listening || Date.now() - savedAt < 400) return;
    listening = true;
    holding = "";
    keyNote = null;
  }

  function record(e: KeyboardEvent) {
    if (!listening) return;
    if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) return void (listening = false);
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "Escape") {
      listening = false;
      return;
    }
    const combo = comboOf(e);
    if (!combo) return void (holding = heldLabel(e));
    const why = keyProblem(combo);
    if (why) {
      keyNote = { text: why, bad: true };
      holding = "";
      play("off");
      return;
    }
    settings.paletteKey = combo;
    saveSettings();
    listening = false;
    savedAt = Date.now();
    keyNote = { text: `Saved. ${keyLabel(combo)} opens Commands now.`, bad: false };
    play("on");
  }

  function resetKey() {
    settings.paletteKey = DEFAULT_PALETTE_KEY;
    saveSettings();
    keyNote = { text: `Back to ${keyLabel(DEFAULT_PALETTE_KEY)}.`, bad: false };
  }

  // the rest of the keys, for reference
  // a number box that can be left blank (blank = automatic, saved as 0)
  function setAuto(key: "tStack", e: Event) {
    settings[key] = Math.max(0, Number((e.currentTarget as HTMLInputElement).value) || 0);
    saveSettings();
  }

  // ---------- export + import ----------
  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  /** "a, b and c" */
  const list = (xs: (string | false | 0)[]) => {
    const ys = xs.filter(Boolean) as string[];
    return ys.length > 1 ? `${ys.slice(0, -1).join(", ")} and ${ys.at(-1)}` : (ys[0] ?? "");
  };
  function contents(d: Backup["data"]) {
    const live = d.games.filter((g) => !g.finished).length;
    const people = Object.keys(d.handles).length;
    return list([
      plural(d.games.length, "game") + (live ? ` (${live} in progress)` : ""),
      d.chipSets.length > 0 && plural(d.chipSets.length, "chip set"),
      (d.templates?.length ?? 0) > 0 && plural(d.templates!.length, "template"),
      people > 0 && `pay links for ${plural(people, "person", "people")}`,
    ]);
  }

  // what's in this browser right now (rev bumps after an import or a wipe)
  let rev = $state(0);
  const here = $derived.by(() => {
    void rev;
    const bytes = savedSize("data");
    const summary = contents({ games: getGames(), chipSets: getChipSets(), templates: getTemplates(), handles: getHandles(), defaultChipSetId: "" });
    return { summary, kb: Math.max(1, Math.round(bytes / 1024)) };
  });

  // ---- the passcode lock (the passcodes are never kept, only used) ----
  let current = $state("");
  let next = $state("");
  let again = $state("");
  let lockBusy = $state(false);
  let lockErr = $state("");
  const nextProblem = $derived(
    next.length < MIN_PASSCODE ? `At least ${MIN_PASSCODE} characters.` : next !== again ? "The two don't match yet." : ""
  );
  const autoLockLabel = () => AUTO_LOCK.find(([s]) => s === settings.autoLock)?.[1].toLowerCase() ?? "a while";

  async function passcode(to: string | null, e?: SubmitEvent) {
    e?.preventDefault();
    lockBusy = true;
    lockErr = "";
    try {
      await setPasscode(to, current);
      current = next = again = "";
      // (its button clicked shut or open on the way down; the toast says it worked)
      toast(!to ? "Lock off. Everything's still encrypted." : settings.autoLock ? `Locked with a passcode. PitMaster locks ${autoLockLabel()} with no input.` : "Locked with a passcode.");
    } catch (err) {
      lockErr = (err as Error).message === "wrong" ? "That's not the current passcode." : "Couldn't change it. Nothing was changed; try again.";
      play("error");
    }
    lockBusy = false;
  }

  let withSettings = $state(true);
  let exportedAt = $state(lastExport());
  // a password, if the file should be locked (never saved anywhere, and
  // forgotten once the file's made). it starts on: a file without one can be
  // read by anyone who gets it, so going without is the host's choice to make
  const MIN_PASSWORD = 8;
  let locking = $state(true);
  let exportPassword = $state("");
  let exporting = $state(false);

  async function exportEverything() {
    exporting = true;
    try {
      let file = exportAll(withSettings ? $state.snapshot(settings) : undefined);
      if (locking) file = await lockBackup(file, exportPassword);
      // (en-CA writes the local date as 2026-09-25; toISOString would be UTC)
      download(`pitmaster-${new Date().toLocaleDateString("en-CA")}${locking ? "-locked" : ""}.json`, file, "application/json");
      exportPassword = "";
      exportedAt = lastExport();
      toast(locking ? "Exported and locked. Importing it takes the password." : "Exported. On the other device, open it with Import.");
    } catch {
      toast("Couldn't lock the file. Try again, or export it without a password.", "bad");
    }
    exporting = false;
  }

  // a picked (or dropped) file waits here, with a preview, until the host says go
  // (raw: the file's data goes to the store as-is, not wrapped for reactivity)
  let pending = $state.raw<{ name: string; backup: Backup } | null>(null);
  let mode = $state<ImportMode>("merge");
  let takeSettings = $state(true);
  let dragging = $state(false);
  // a locked file waits here for its password
  let lockedFile = $state.raw<{ name: string; file: LockedBackup } | null>(null);
  let password = $state("");
  let unlocking = $state(false);
  let unlockErr = $state("");
  // games in progress that just came in, one click from running them
  let arrived = $state<{ id: string; name: string }[]>([]);
  /** an import just went in: it can be taken back (the settings as they were, if it brought its own) */
  let undoable = $state<{ settings: Record<string, unknown> | null } | null>(null);
  const whole = $derived(pending?.backup.kind === "everything");
  const plan = $derived(pending ? planImport(pending.backup, whole ? mode : "merge") : null);

  // far bigger than any real export, and small enough not to freeze the tab
  const MAX_IMPORT = 50 * 1024 * 1024;

  async function openFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_IMPORT) return void toast("That file is too big to be a PitMaster export.", "bad");
    try {
      const backup = readBackup(await file.text());
      arrived = [];
      undoable = null;
      play("card"); // it lands on the table, face up
      if ("locked" in backup) {
        lockedFile = { name: file.name, file: backup };
        password = "";
        unlockErr = "";
      } else preview(file.name, backup);
    } catch (err) {
      toast(`That file didn't work. ${(err as Error).message}`, "bad");
    }
  }

  function preview(name: string, backup: Backup) {
    pending = { name, backup };
    mode = "merge";
    takeSettings = !!backup.settings;
  }

  async function unlockFile(e: SubmitEvent) {
    e.preventDefault();
    if (!lockedFile) return;
    unlocking = true;
    unlockErr = "";
    try {
      preview(lockedFile.name, await unlockBackup(lockedFile.file, password));
      lockedFile = null;
      password = "";
      play("unlock");
    } catch (err) {
      unlockErr = (err as Error).message;
      play("error");
    }
    unlocking = false;
  }

  function pickFile(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    openFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    openFile(e.dataTransfer?.files[0]);
  }

  function runImport() {
    if (!pending) return;
    const { backup } = pending;
    const taking = takeSettings && !!backup.settings;
    undoable = { settings: taking ? ($state.snapshot(settings) as unknown as Record<string, unknown>) : null };
    importBackup(backup, whole ? mode : "merge");
    if (taking) adoptSettings(backup.settings!);
    templates = getTemplates();
    rev++;
    arrived = backup.data.games.filter((g) => !g.finished).map((g) => ({ id: g.id, name: g.name }));
    pending = null;
    toast(`Imported ${plural(backup.data.games.length, "game")}`);
  }

  function takeBack() {
    if (!undoable || !undoImport()) return;
    if (undoable.settings) adoptSettings(undoable.settings);
    undoable = null;
    arrived = [];
    templates = getTemplates();
    rev++;
    play("rewind");
    toast("Import undone. Everything's as it was.", "info");
  }

  function startOver() {
    if (!confirm("Delete every game and custom chip set? This can't be undone. Export first if you might want them.")) return;
    wipeAll();
    templates = getTemplates();
    arrived = [];
    undoable = null;
    rev++;
    toast("Everything's cleared. Fresh start.");
  }
</script>

<svelte:head><title>Settings · PitMaster</title></svelte:head>
<svelte:window onhashchange={() => (hash = location.hash)} />

<h1>Settings</h1>
<p class="muted">Saved in this browser, encrypted. To take them to another device, <a href="#data">export</a> them with your games.</p>

<div class="settings" bind:this={panes}>
<nav class="side" aria-label="Settings">
  {#each GROUPS as g (g.label)}
    <p class="eyebrow group">{g.label}</p>
    {#each g.tabs as t (t.id)}
      <a href="#{t.id}" data-sound="soft" aria-current={tab === t.id ? "page" : undefined} onclick={(e) => pickTab(e, t.id)}><Icon icon={t.icon} />{t.label}</a>
    {/each}
  {/each}
</nav>

<div class="panes">
{#if tab === "game"}
<section id="game" in:fly={rise(6)}>
  <h2>Your Game</h2>
  <p class="small muted lede">Turn on what your games use, whatever their size. Anything off stays off new games and the dealer screen, and a new game can still add it just for that game.</p>
  <div class="set top">
    <div class="what">
      <b>Cash Game Rake</b>
      <span class="small muted">A cut of each pot into a rake box, or a flat fee to sit down. New games start with what you set here.</span>
    </div>
    <div>
      <label class="inline"><input type="checkbox" checked={settings.useRake} onchange={toggleRake} /><span>Take a Rake or Seat Fee</span></label>
      {#if settings.useRake}
        <div class="more" transition:slide={reveal()}>
          <RakeFields
            bind:mode={settings.cashRakeMode}
            bind:pct={settings.cashRakePct}
            bind:cap={settings.cashRakeCap}
            bind:fee={settings.cashSeatFee}
            bind:house={settings.houseName}
            onchange={saveSettings}
          />
        </div>
      {/if}
    </div>
  </div>
  <div class="set top">
    <div class="what">
      <b>Tournament House Cut</b>
      <span class="small muted">A flat fee per entry, a percent of the rest, or both.</span>
    </div>
    <div>
      <label class="inline"><input type="checkbox" bind:checked={settings.useHouseCut} onchange={saveSettings} /><span>Take a Cut of Each Buy-In</span></label>
      {#if settings.useHouseCut}
        <div class="more" transition:slide={reveal()}>
          <HouseCutFields bind:fee={settings.tFee} bind:pct={settings.tRakePct} buyIn={settings.tBuyIn} onchange={saveSettings} />
        </div>
      {/if}
    </div>
  </div>
  <div class="set top">
    <div class="what"><b>Extras</b><span class="small muted">A game that already uses one keeps it.</span></div>
    <div class="vstack">
      {#each EXTRAS as x (x.key)}
        <label class="opt">
          <input type="checkbox" bind:checked={settings[x.key]} onchange={saveSettings} />
          <span><span class="name">{x.label}</span><span class="small muted">{x.hint}</span></span>
        </label>
      {/each}
    </div>
  </div>
  <div class="set top" id="house">
    <label class="what" for="rules"><b>House Rules</b><span class="small muted">One per line. They go on the TV under the clock, taking turns when there are more than two.</span></label>
    <div>
      <textarea id="rules" rows={Math.min(10, Math.max(3, houseRules().length + 1))} value={settings.houseRules} oninput={typeRules} onchange={flushRules} placeholder="No string bets.&#10;Rebuys close at the first break."></textarea>
      {#if unusedRules.length}
        <p class="small links common">
          <span class="muted">Common Ones:</span>
          {#each unusedRules as r (r)}<button class="link" data-sound="card" onclick={() => addRule(r)}><Icon icon={Plus} size="1em" />{r}</button>{/each}
        </p>
      {/if}
      <label class="inline"><input type="checkbox" bind:checked={settings.rulesOnNew} onchange={saveSettings} /><span>Put Them on Every New Game</span></label>
    </div>
  </div>
</section>
{/if}

{#if tab === "defaults"}
<section id="defaults" in:fly={rise(6)}>
  <h2>New Games</h2>
  <p class="small muted lede">Where a new game starts. Every one of these can still be changed on the game itself, and a template sets its own.</p>

  <h3>Tournaments</h3>
  <div class="set">
    <label class="what" for="t-buyin"><b>Buy-In {sym}</b><span class="small muted">Rebuys start at the same price.</span></label>
    <input id="t-buyin" type="number" min="0" step="any" bind:value={settings.tBuyIn} onchange={saveSettings} />
  </div>
  <div class="set">
    <label class="what" for="t-players"><b>Players</b><span class="small muted">How many usually play. Stacks, chip math and payouts start from it.</span></label>
    <input id="t-players" type="number" min="2" max="100" bind:value={settings.tPlayers} onchange={saveSettings} />
  </div>
  <div class="set">
    <label class="what" for="t-stack"><b>Starting Stack</b><span class="small muted">Leave it blank and each game picks one that fits its chip set and players.</span></label>
    <input id="t-stack" type="number" min="0" step="any" placeholder="Auto" value={settings.tStack || ""} onchange={(e) => setAuto("tStack", e)} />
  </div>
  <div class="set">
    <label class="what" for="t-depth"><b>Starting Depth</b><span class="small muted">The stack in big blinds at level 1.</span></label>
    <GameSelect of="depth" id="t-depth" bind:value={settings.tDepth} onchange={saveSettings} />
  </div>
  <div class="set">
    <label class="what" for="t-hours"><b>Length</b><span class="small muted">The blind structure is built to wrap up around then.</span></label>
    <select id="t-hours" bind:value={settings.tHours} onchange={saveSettings}>
      {#each [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8] as h (h)}<option value={h}>About {duration(h * 60)}</option>{/each}
    </select>
  </div>
  <div class="set">
    <label class="what" for="t-level"><b>Level Length</b></label>
    <GameSelect of="level" id="t-level" bind:value={settings.tLevel} onchange={saveSettings} />
  </div>
  <div class="set">
    <div class="what"><b>Breaks</b><span class="small muted">0 levels means no breaks.</span></div>
    <div class="row">
      <label><span>Levels Between Breaks</span><input type="number" min="0" bind:value={settings.tBreakEvery} onchange={saveSettings} /></label>
      <label><span>Break Minutes</span><input type="number" min="1" bind:value={settings.tBreakMinutes} onchange={saveSettings} /></label>
    </div>
  </div>
  <div class="set">
    <div class="what"><b>Antes and Late Registration</b><span class="small muted">0 means no antes. Late registration closes after the level you pick.</span></div>
    <div class="row">
      <label><span>Antes From Level</span><input type="number" min="0" bind:value={settings.tAnteFrom} onchange={saveSettings} /></label>
      <label><span>Late Registration Through Level</span><input type="number" min="0" bind:value={settings.tLateReg} onchange={saveSettings} /></label>
    </div>
  </div>
  {#if settings.useRebuys}
    <div class="set top" transition:slide={reveal()}>
      <div class="what"><b>Rebuys &amp; Add-Ons</b><span class="small muted">Rebuys cost the buy-in and give a starting stack. The add-on comes at the first break.</span></div>
      <div class="vstack fields">
        <!-- a switch's number opens out beside it -->
        <div class="row">
          <label class="inline"><input type="checkbox" bind:checked={settings.tRebuy} onchange={saveSettings} /><span>Rebuys</span></label>
          {#if settings.tRebuy}<label class="inline beside" transition:slide={{ ...reveal(), axis: "x" }}><span>Through Level</span><input type="number" min="1" bind:value={settings.tRebuyUntil} onchange={saveSettings} /></label>{/if}
        </div>
        <div class="row">
          <label class="inline"><input type="checkbox" bind:checked={settings.tAddOn} onchange={saveSettings} /><span>Add-On</span></label>
          {#if settings.tAddOn}<label class="inline beside" transition:slide={{ ...reveal(), axis: "x" }}><span>Cost {sym}</span><input type="number" min="0" step="any" bind:value={settings.tAddOnCost} onchange={saveSettings} /></label>{/if}
        </div>
      </div>
    </div>
  {/if}
  {#if settings.useBounties}
    <div class="set" transition:slide={reveal()}>
      <label class="what" for="t-bounty"><b>Bounty {sym}</b><span class="small muted">The part of each buy-in that sits on the player's head. 0 means none.</span></label>
      <input id="t-bounty" type="number" min="0" step="any" bind:value={settings.tBounty} onchange={saveSettings} />
    </div>
  {/if}
  <div class="set">
    <label class="what" for="t-payouts"><b>Payouts</b><span class="small muted">Percentages, 1st place first, like 50, 30, 20. Leave it blank and they're picked by how many play.</span></label>
    <input id="t-payouts" type="text" placeholder="Auto" bind:value={settings.tPayouts} onchange={saveSettings} />
  </div>
  <div class="set">
    <label class="what" for="t-round"><b>Round Payouts To</b><span class="small muted">So no one is paid {money(37.4)}. Whatever's left over goes to 1st.</span></label>
    <GameSelect of="round" id="t-round" bind:value={settings.payoutRound} onchange={saveSettings} />
  </div>

  <h3>Cash Games</h3>
  <div class="set">
    <div class="what"><b>Buy-In</b><span class="small muted">In big blinds, so it works at any stakes. The amounts come from each game's blinds.</span></div>
    <div class="row">
      <label><span>Min</span><input type="number" min="1" bind:value={settings.cashMinBB} onchange={saveSettings} /></label>
      <label><span>Standard</span><input type="number" min="1" bind:value={settings.cashDepth} onchange={saveSettings} /></label>
      <label><span>Max</span><input type="number" min="1" bind:value={settings.cashMaxBB} onchange={saveSettings} /></label>
    </div>
  </div>
  <div class="set">
    <label class="what" for="c-hours"><b>Length</b><span class="small muted">For the end time and chip math. Cash games can always run long.</span></label>
    <select id="c-hours" bind:value={settings.cashHours} onchange={saveSettings}>
      {#each [1, 2, 3, 4, 5, 6, 8, 10] as h (h)}<option value={h}>About {duration(h * 60)}</option>{/each}
    </select>
  </div>
  <div class="set">
    <div class="what"><b>Straddles</b></div>
    <label class="inline"><input type="checkbox" bind:checked={settings.cashStraddle} onchange={saveSettings} /><span>Straddles Allowed</span></label>
  </div>

  {#if settings.useSeats}
    <h3 transition:slide={reveal()}>Both</h3>
    <div class="set" transition:slide={reveal()}>
      <label class="what" for="seats"><b>Seats per Table</b><span class="small muted">For drawing seats and balancing tables.</span></label>
      <select id="seats" bind:value={settings.seatsPerTable} onchange={saveSettings}>
        {#each [4, 5, 6, 7, 8, 9, 10] as n (n)}<option value={n}>{n} Seats</option>{/each}
      </select>
    </div>
  {/if}
  <h3 id="templates">Templates</h3>
  <div class="set">
    <div class="what">
      <b>Saved Setups</b>
      <span class="small muted">Make one from <b>Save as Template</b> on a new game; start from one there or from Commands (<kbd>{keyLabel(paletteKey)}</kbd>).</span>
    </div>
    {#if templates.length}
      <ul class="bare templates">
        {#each templates as t (t.id)}
          <li>
            <a href="/new?type={t.type}&template={t.id}">{t.name}</a>
            <span class="small muted">{t.type === "cash" ? "Cash" : "Tournament"}{t.players.length ? ` · ${t.players.length} players` : ""}</span>
            <button class="link small muted" data-sound="thud" onclick={() => removeTemplate(t.id, t.name)} aria-label="Delete template {t.name}">Delete</button>
          </li>
        {/each}
      </ul>
    {:else}
      <span class="empty">No templates yet.</span>
    {/if}
  </div>
</section>
{/if}

<!-- wider than the rest: a set list beside a table of chips -->
{#if tab === "chips"}
<section id="chips" class="wide" in:fly={rise(6)}>
  <h2>Chip Sets</h2>
  <p class="small muted lede">The chips you play with. Value is what's printed on the chip; each game can scale it (a chip printed 1 can play as 100 in a tournament). New games start with the default set.</p>
  <!-- an import or a fresh start swaps what's saved, so it reads them again -->
  {#key rev}<ChipSets />{/key}
</section>
{/if}

{#if tab === "tv"}
<section id="tv" in:fly={rise(6)}>
  <h2>TV</h2>
  <div class="set">
    <label class="what" for="warn"><b>Level Warning</b><span class="small muted">The TV beeps and the clock turns red before the blinds go up. The last minute blinks.</span></label>
    <select id="warn" bind:value={settings.levelWarning} onchange={saveSettings}>
      <option value={0}>Off</option>
      <option value={1}>1 Minute Before</option>
      <option value={2}>2 Minutes Before</option>
      <option value={5}>5 Minutes Before</option>
    </select>
  </div>
  <div class="set">
    <div class="what"><b>Sound</b><span class="small muted">Browsers need one click on the TV before it can play sound, so the TV asks for it.</span></div>
    <label class="inline"><input type="checkbox" bind:checked={settings.tvSound} onchange={saveSettings} /><span>Start TV Screens With Sound On</span></label>
  </div>
  <div class="set">
    <label class="what" for="tv-vol"><b>TV Volume</b><span class="small muted">The beeps, the countdown ticks and the announcer. A TV on another device follows this too. Let go of the slider to hear the level-up sound.</span></label>
    <div class="vol">
      <input id="tv-vol" type="range" min="0" max="100" step="5" bind:value={settings.tvVolume} onchange={() => (saveSettings(), sounds.level())} />
      <span class="num small">{settings.tvVolume}%</span>
    </div>
  </div>
  <div class="set">
    <div class="what"><b>Keep Awake</b><span class="small muted">So the screen doesn't dim in the middle of a level. Works in Chrome, Edge and Safari.</span></div>
    <label class="inline"><input type="checkbox" bind:checked={settings.tvAwake} onchange={saveSettings} /><span>Keep the TV On While the Clock Runs</span></label>
  </div>
  <div class="set">
    <div class="what"><b>Announcer</b><span class="small muted">After the beep, the TV reads the new blinds, breaks, busts and the winner out loud, in the device's own voice.</span></div>
    <div class="row">
      <label class="inline"><input type="checkbox" bind:checked={settings.tvVoice} onchange={saveSettings} /><span>Read Big Moments Out Loud</span></label>
      <button class="link small" onclick={testVoice}>Hear It</button>
    </div>
  </div>
  <div class="set">
    <div class="what"><b>Money on the TV</b><span class="small muted">Turn off to keep the prize pool, payouts and buy-ins off the big screen. The dealer screen still shows everything.</span></div>
    <label class="inline"><input type="checkbox" bind:checked={settings.tvMoney} onchange={saveSettings} /><span>Show Money Amounts on the TV</span></label>
  </div>
</section>
{/if}

{#if tab === "general"}
<section id="general" in:fly={rise(6)}>
  <h2>General</h2>
  <h3 id="appearance">Appearance</h3>
  <div class="set">
    <div class="what">
      <b id="theme-l">Theme</b>
      <span class="small muted">System follows your device. The TV screen is always dark.</span>
    </div>
    <Seg labelledby="theme-l" value={settings.theme} options={THEMES} onpick={pickTheme} />
  </div>
  <div class="set">
    <div class="what">
      <b id="sound-l">Interface Sounds</b>
      <span class="small muted">Quiet clicks under buttons and switches, chips clacking when money moves, and every chip its own note when you tap it. The TV's alarms are separate.</span>
    </div>
    <Seg
      labelledby="sound-l"
      value={settings.sounds ? "on" : "off"}
      options={[
        { id: "off", label: "Off", icon: VolumeX },
        { id: "on", label: "On", icon: Volume2 },
      ]}
      onpick={pickSounds}
    />
  </div>
  <div class="set">
    <label class="what" for="ui-vol"><b>Interface Volume</b><span class="small muted">How loud those clicks and clacks are. {settings.sounds ? "Let go of the slider to hear it." : "Turn on Interface Sounds to set it."}</span></label>
    <!-- (the title sits on the box: a disabled slider shows no tooltip of its own) -->
    <div class="vol" title={settings.sounds ? undefined : "Interface Sounds are off"}>
      <input id="ui-vol" type="range" min="0" max="100" step="5" bind:value={settings.volume} onchange={() => (saveSettings(), play("chips"))} disabled={!settings.sounds} />
      <span class="num small">{settings.volume}%</span>
    </div>
  </div>
  <div class="set">
    <div class="what">
      <b id="motion-l">Motion</b>
      <span class="small muted">System follows your device's reduce-motion setting. Reduced turns off the slides, flips and page swaps here and on the TV.</span>
    </div>
    <Seg
      labelledby="motion-l"
      value={settings.motion}
      options={[
        { id: "system", label: "System", icon: Sparkles },
        { id: "reduced", label: "Reduced", icon: Minimize },
      ]}
      onpick={pickMotion}
    />
  </div>
  <div class="set">
    <div class="what">
      <b id="toys-l">Home Page Toys</b>
      <span class="small muted">Cards to fan, chips to sort, dice, a bill counter and a roulette wheel to fidget with beside the headline. Off keeps the home page to your games.</span>
    </div>
    <Seg
      labelledby="toys-l"
      value={settings.toys ? "on" : "off"}
      options={[
        { id: "off", label: "Off", icon: EyeOff },
        { id: "on", label: "On", icon: Dices },
      ]}
      onpick={pickToys}
    />
  </div>
  <h3 id="keys">Keyboard</h3>
  <div class="set top">
    <div class="what">
      <b id="pal-l">Open Commands</b>
      <span class="small muted">The command box does anything by name: go to a page, start a template, or "bust mike" on the dealer screen. Click the shortcut, then press the keys you want.</span>
    </div>
    <div>
      <div class="row">
        <button class="keycap" class:listening aria-labelledby="pal-l" aria-describedby="pal-note" data-sound="none" onclick={listen} onkeydown={record} onblur={() => (listening = false)}>
          <Icon icon={Keyboard} />
          {#if listening}
            {#if holding}<kbd>{holding}</kbd><span class="muted">and a Key</span>{:else}<span class="muted">Press the New Keys</span>{/if}
          {:else}
            <kbd>{keyLabel(paletteKey)}</kbd>
          {/if}
        </button>
        {#if listening}
          <span class="small muted" in:fade={reveal()}>Esc to keep {keyLabel(paletteKey)}</span>
        {:else if paletteKey !== DEFAULT_PALETTE_KEY}
          <button class="link small muted" data-sound="rewind" onclick={resetKey}>Reset to {keyLabel(DEFAULT_PALETTE_KEY)}</button>
        {/if}
      </div>
      <!-- always there, so the row doesn't jump and a screen reader hears each new note -->
      <p id="pal-note" class="small note" class:bad={keyNote?.bad} class:muted={!keyNote?.bad} aria-live="polite">
        {#key keyNote}<span in:fade={reveal()}>{keyNote?.text ?? ""}</span>{/key}
      </p>
    </div>
  </div>
  <div class="set top">
    <div class="what"><b>Other Shortcuts</b><span class="small muted">These are fixed. None of them fire while you're typing in a box.</span></div>
    <KeyList class="small" />
  </div>
  <h3 id="region">Language &amp; Region</h3>
  <div class="set">
    <label class="what" for="lang"><b>Language <span class="pill">Soon</span></b><span class="small muted">PitMaster is in English for now. Your pick is saved for when translations arrive.</span></label>
    <select id="lang" bind:value={settings.language} onchange={saveSettings}>
      {#each LANGUAGES as [code, name] (code)}<option value={code} lang={code}>{name}</option>{/each}
    </select>
  </div>
  <div class="set">
    <label class="what" for="cur"><b>Currency</b><span class="small muted">How buy-ins, pots and cash chips are written: <span class="num">{money(1250.5)}</span>. Live TVs follow this one.</span></label>
    <select id="cur" bind:value={settings.currency} onchange={saveSettings}>
      {#each CURRENCIES as [code, name] (code)}<option value={code}>{name}</option>{/each}
    </select>
  </div>
  <div class="set">
    <div class="what"><b id="clock-l">Time</b><span class="small muted">Start times, bust times and the TV's clock. It's {timeOfDay(Date.now())}.</span></div>
    <Seg
      labelledby="clock-l"
      value={settings.clock}
      options={[
        { id: "12h", label: "12-Hour", hint: "7:30 PM" },
        { id: "24h", label: "24-Hour", hint: "19:30" },
      ]}
      onpick={pickClock}
    />
  </div>
</section>
{/if}

{#if tab === "yours"}
<section id="yours" in:fly={rise(6)}>
  <h2>Your Data</h2>
  <h3 id="lock">Passcode Lock</h3>
  <p class="small muted lede">
    Everything here is already encrypted. A passcode goes further: nothing saved can be opened without it, even by
    someone using this browser, and PitMaster locks itself after a while with no input. TV screens keep showing the game
    while it's locked, and nothing on them can change it.
  </p>
  {#if vault.state === "memory"}
    <p class="small muted">It needs a secure (https) page, where this browser can encrypt.</p>
  {:else if !vault.passcode}
    <div class="set top">
      <div class="what">
        <b>Passcode</b>
        <span class="small muted">At least {MIN_PASSCODE} characters, and longer is harder to crack if someone copies this browser's files. Forget it and everything saved here is gone for good, so export first.</span>
      </div>
      <form class="vstack fields" onsubmit={(e) => passcode(next, e)}>
        <!-- password managers file a passcode under a name; this is the one the lock screen uses -->
        <input type="text" autocomplete="username" value="PitMaster" hidden />
        <input type="password" bind:value={next} autocomplete="new-password" minlength={MIN_PASSCODE} placeholder="New Passcode" aria-label="New passcode" />
        <input type="password" bind:value={again} autocomplete="new-password" placeholder="Type It Again" aria-label="New passcode, again" />
        {#if next && nextProblem}<p class="small muted" transition:slide={reveal()}>{nextProblem}</p>{/if}
        <button data-sound="lock" disabled={lockBusy || !!nextProblem} title={nextProblem || undefined}><Icon icon={Lock} />{lockBusy ? "Locking…" : "Turn On the Lock"}</button>
        {#if lockErr}<p class="small bad" aria-live="polite" transition:slide={reveal()}>{lockErr}</p>{/if}
      </form>
    </div>
  {:else}
    <div class="set">
      <label class="what" for="auto-lock"><b>Auto-Lock</b><span class="small muted">After this long with no clicks, taps or keys in any PitMaster tab. TV screens don't count and don't lock.</span></label>
      <div class="row">
        <select id="auto-lock" bind:value={settings.autoLock} onchange={saveSettings}>
          {#each AUTO_LOCK as [s, label] (s)}<option value={s}>{label}</option>{/each}
        </select>
        <button data-sound="lock" onclick={lockNow}><Icon icon={Lock} />Lock Now</button>
      </div>
    </div>
    <div class="set top">
      <div class="what">
        <b>Change or Turn Off</b>
        <span class="small muted">Both take the current passcode. Everything is encrypted either way.</span>
      </div>
      <form class="vstack fields" onsubmit={(e) => passcode(next, e)}>
        <input type="text" autocomplete="username" value="PitMaster" hidden />
        <input type="password" bind:value={current} autocomplete="current-password" placeholder="Current Passcode" aria-label="Current passcode" />
        <input type="password" bind:value={next} autocomplete="new-password" minlength={MIN_PASSCODE} placeholder="New Passcode" aria-label="New passcode" />
        <input type="password" bind:value={again} autocomplete="new-password" placeholder="Type It Again" aria-label="New passcode, again" />
        {#if next && nextProblem}<p class="small muted" transition:slide={reveal()}>{nextProblem}</p>{/if}
        <div class="row">
          <button data-sound="lock" disabled={lockBusy || !current || !!nextProblem} title={!current ? "Type the current passcode first" : nextProblem || undefined}>{lockBusy ? "Changing…" : "Change Passcode"}</button>
          <button type="button" data-sound="unlock" disabled={lockBusy || !current} title={current ? undefined : "Type the current passcode first"} onclick={() => passcode(null)}>Turn Off the Lock</button>
        </div>
        {#if lockErr}<p class="small bad" aria-live="polite" transition:slide={reveal()}>{lockErr}</p>{/if}
      </form>
    </div>
  {/if}
  <h3 id="data">Export &amp; Import</h3>
  <p class="small muted lede">
    Everything is saved in this browser, encrypted: {here.summary} ({here.kb} KB). There's no account and no cloud copy, so a file is how it gets to another device.
    <a href="/privacy">How Your Data Is Handled</a>
  </p>
  <div class="set top">
    <div class="what">
      <b>Export</b>
      <span class="small muted">One file with all of it. Keep it as a backup, or import it on another device and carry on from there. Without a password, anyone who has the file can read it.{#if exportedAt}{" "}Last exported {ago(exportedAt)}.{/if}</span>
    </div>
    <div class="vstack fields">
      <div>
        <button
          onclick={exportEverything}
          disabled={exporting || (locking && exportPassword.length < MIN_PASSWORD)}
          title={locking && exportPassword.length < MIN_PASSWORD ? `Type a password of at least ${MIN_PASSWORD} characters, or turn off the lock` : undefined}
        ><Icon icon={Download} />{exporting ? "Locking…" : "Export Everything"}</button>
      </div>
      <label class="inline"><input type="checkbox" bind:checked={withSettings} /><span>Include These Settings</span></label>
      <label class="inline"><input type="checkbox" bind:checked={locking} /><span>Lock It With a Password</span></label>
      {#if locking}
        <div class="vstack fields" transition:slide={reveal()}>
          <input type="password" bind:value={exportPassword} autocomplete="new-password" minlength={MIN_PASSWORD} placeholder="Password" aria-label="Password for the file" aria-describedby="pw-note" />
          <p id="pw-note" class="small muted">At least {MIN_PASSWORD} characters, and longer is stronger. Encrypted with AES-256. Importing it takes this password, and a lost one can't be recovered, by you or by us.</p>
        </div>
      {/if}
    </div>
  </div>
  <div class="set top">
    <div class="what">
      <b>Import</b>
      <span class="small muted">A game in progress picks up right where it left off, clock, players and TV code included.</span>
    </div>
    <div>
      {#if pending}
        <div class="vstack fields block" transition:slide={reveal()}>
          <p class="with-icon file"><Icon icon={FileJson} /><b>{pending.name}</b></p>
          <p class="small muted">
            {pending.backup.kind === "game" ? "One game" : "Everything"}, exported {day(pending.backup.exportedAt)} at {timeOfDay(pending.backup.exportedAt)}:
            {contents(pending.backup.data)}{pending.backup.settings ? ", plus settings" : ""}.
          </p>
          {#if whole}
            <Seg
              labelledby="mode-l"
              value={mode}
              options={[
                { id: "merge", label: "Add to This Browser", icon: Merge },
                { id: "replace", label: "Replace Everything", icon: Replace },
              ]}
              onpick={(m: ImportMode) => (mode = m)}
            />
            <span id="mode-l" class="sr-only">How to import</span>
          {/if}
          {#if plan}
            <p class="small">
              {#if whole && mode === "replace"}
                <span class="bad">The {plural(plan.here, "game")} here {plan.here === 1 ? "is" : "are"} swapped for the file's {pending.backup.data.games.length}.</span> Chip sets, templates and pay links too.
              {:else}
                {list([plan.added > 0 && `${plural(plan.added, "new game")}`, plan.updated > 0 && `${plan.updated} newer than the copy here`, plan.kept > 0 && `${plan.kept} already up to date`]) || "No games in it"}. Nothing here is deleted.
              {/if}
            </p>
          {/if}
          {#if pending.backup.settings}
            <label class="opt">
              <input type="checkbox" bind:checked={takeSettings} />
              <span><span class="name">Use Its Settings Too</span><span class="small muted">House rules, money, game defaults and the TV. This screen's theme and sounds stay as they are.</span></span>
            </label>
          {/if}
          <div class="row">
            {#if whole && mode === "replace"}
              <button class="danger" data-sound="thud" onclick={runImport}><Icon icon={Replace} />Replace Everything</button>
            {:else}
              <button onclick={runImport}><Icon icon={Upload} />Import</button>
            {/if}
            <button class="link muted" data-sound="close" onclick={() => (pending = null)}>Cancel</button>
          </div>
        </div>
      {:else if lockedFile}
        <form class="vstack fields block" onsubmit={unlockFile} transition:slide={reveal()}>
          <p class="with-icon file"><Icon icon={Lock} /><b>{lockedFile.name}</b></p>
          <p class="small muted">
            {lockedFile.file.kind === "game" ? "One game" : "Everything"}, exported {day(lockedFile.file.exportedAt)} at {timeOfDay(lockedFile.file.exportedAt)}. It's locked with a password.
          </p>
          <div class="row">
            <input type="password" bind:value={password} autocomplete="off" placeholder="Password" aria-label="The file's password" aria-invalid={!!unlockErr} />
            <!-- (it clicks open, or doesn't, once the password's been tried) -->
            <button data-sound="none" disabled={!password || unlocking} title={password ? undefined : "Type the file's password first"}><Icon icon={Lock} />{unlocking ? "Unlocking…" : "Unlock"}</button>
            <button type="button" class="link muted" data-sound="close" onclick={() => (lockedFile = null)}>Cancel</button>
          </div>
          {#if unlockErr}<p class="small bad" aria-live="polite" transition:slide={reveal()}>{unlockErr}</p>{/if}
        </form>
      {:else}
        <!-- drop a file anywhere on this box, or pick one -->
        <div
          class="drop"
          class:over={dragging}
          role="group"
          aria-label="Import a file"
          ondragenter={(e) => (e.preventDefault(), (dragging = true))}
          ondragover={(e) => e.preventDefault()}
          ondragleave={(e) => !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node) && (dragging = false)}
          ondrop={onDrop}
        >
          <label class="btn"><Icon icon={Upload} />Choose a File<input class="sr-only" type="file" accept=".json,application/json" onchange={pickFile} /></label>
          <span class="small muted">Or Drop It Here</span>
        </div>
        {#if undoable}
          <p class="small links arrived" transition:slide={reveal()}>
            <span class="good">Imported.</span>
            {#if arrived.length}
              {arrived.length === 1 ? "Ready to Run:" : "In Progress:"}
              {#each arrived.slice(0, 4) as g (g.id)}<a class="with-icon" href="/game/{g.id}">{g.name}<Icon icon={ArrowRight} size="1em" /></a>{/each}
            {/if}
            <button class="link muted with-icon" data-sound="none" onclick={takeBack}><Icon icon={Undo2} size="1em" />Undo Import</button>
          </p>
        {/if}
      {/if}
    </div>
  </div>
  <div class="set">
    <div class="what"><b>Start Over</b><span class="small muted">Deletes every game and custom chip set in this browser. Can't be undone.</span></div>
    <div><button class="danger" data-sound="thud" onclick={startOver}><Icon icon={Trash} />Delete Everything</button></div>
  </div>
</section>
{/if}
</div>
</div>

<style>
  section {
    max-width: 760px;
    margin-bottom: 30px;
  }
  section.wide {
    max-width: none;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  /* a subsection opens on its own rule, so the row above it drops its one */
  h3 {
    margin-top: 22px;
  }
  .set:has(+ h3) {
    border-bottom: 0;
  }
  /* the tabs down the left, the open one beside them */
  .settings {
    display: grid;
    grid-template-columns: 176px minmax(0, 1fr);
    gap: 0 48px;
    align-items: start;
    margin-top: 26px;
  }
  .side {
    position: sticky;
    top: calc(var(--head, 0px) + 16px);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  /* a short screen can't hold the whole list still: it scrolls with the page */
  @media (max-height: 500px) {
    .side {
      position: static;
    }
  }
  .group {
    margin: 18px 0 4px;
    padding-left: 11px;
  }
  .group:first-child {
    margin-top: 0;
  }
  .side a {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: var(--control-h-big);
    padding: 0 10px;
    border: var(--hair) solid transparent;
    color: var(--fg);
    text-decoration: none;
    transition:
      background-color var(--dur-hover) var(--ease-out),
      border-color var(--dur-hover) var(--ease-out);
  }
  .side a :global(svg) {
    color: var(--muted);
    transition: color var(--dur-hover) var(--ease-out);
  }
  .side a:hover {
    background: var(--block);
  }
  .side a[aria-current="page"] {
    background: var(--block);
    border-color: var(--line-strong);
  }
  .side a[aria-current="page"] :global(svg) {
    color: var(--fg);
  }
  /* switching tabs isn't landing on an anchor: no flash */
  section:target {
    animation: none;
  }
  section > h2:first-child {
    margin-top: 0;
  }
  /* a phone: the tabs become a small grid over the open one */
  @media (max-width: 760px) {
    .settings {
      grid-template-columns: minmax(0, 1fr);
      margin-top: 18px;
    }
    .side {
      position: static;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 4px;
      margin-bottom: 26px;
    }
    .group {
      display: none;
    }
    .side a {
      gap: 7px;
      padding: 0 8px;
      border-color: var(--line);
    }
  }
  @media (max-width: 380px) {
    .side {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  .set {
    display: grid;
    grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
    gap: 6px 28px;
    align-items: center;
    padding: 12px 0;
    border-bottom: var(--hair) solid var(--line);
  }
  /* the heading's rule opens the section; the last row doesn't need one */
  .set:last-child {
    border-bottom: 0;
  }
  .set label {
    margin: 0;
  }
  .what {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .what b {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: normal;
    color: var(--fg);
  }
  /* rows whose control is tall (the rules box) line up at the top */
  .set.top {
    align-items: start;
  }
  .lede {
    margin: -4px 0 4px;
    max-width: 88ch;
  }
  .common {
    margin: 6px 0 8px;
  }
  /* what a switch opens up, tucked under it */
  .more {
    margin-top: 8px;
  }
  /* a column of controls, each at its own width; the gap spaces them */
  .fields {
    align-items: flex-start;
  }
  .fields p {
    margin: 0;
  }
  .fields label.inline {
    margin-right: 0;
  }
  /* a switch's number, opening out beside it. its words stay on one line, so
     while it opens they're cut off rather than folded onto two */
  .beside {
    white-space: nowrap;
  }
  /* a volume slider with its level beside it */
  .vol {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .vol input {
    width: 200px;
  }
  .vol .num {
    min-width: 4ch;
    text-align: right;
  }
  /* a switch with its name and a line on what it does */
  .opt {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px;
    align-items: start;
    cursor: pointer;
  }
  .opt input {
    margin: 3px 0 0;
  }
  /* a press anywhere on the row presses its box, as a press on the box does */
  .opt:active input {
    transform: scale(0.86);
  }
  .opt > span {
    display: flex;
    flex-direction: column;
  }
  .templates li {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 2px 0;
  }
  /* (global: some are drawn by shared components) */
  .set :global(select) {
    justify-self: start;
    min-width: 220px;
  }
  #t-payouts {
    width: 220px;
  }
  /* the shortcut, shown as the keys themselves. while it records, its edge
     goes to ink over the lighter field face, like the picked side of a switch */
  .keycap {
    gap: 8px;
    min-width: 170px;
    justify-content: flex-start;
  }
  .keycap kbd {
    pointer-events: none;
  }
  .keycap.listening,
  .keycap.listening:hover {
    border-color: var(--fg);
    background: var(--field);
  }
  .note {
    min-height: 1.5em;
    margin: 6px 0 0;
  }
  /* the file box is hidden inside its label, so the label wears the focus ring */
  label.btn:has(:focus-visible) {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  /* the import target: a quiet box that lights up when a file is over it */
  .drop {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 14px;
    border: var(--hair) dashed var(--line-strong);
    transition:
      background-color var(--dur-hover) var(--ease-out),
      border-color var(--dur-hover) var(--ease-out);
  }
  .drop.over {
    background: var(--block);
    border-color: var(--focus);
    border-style: solid;
  }
  .file {
    overflow-wrap: anywhere;
  }
  .arrived {
    margin: 8px 0 0;
  }
  @media (max-width: 600px) {
    .set {
      grid-template-columns: 1fr;
    }
    .set :global(select) {
      width: 100%;
    }
  }
</style>
