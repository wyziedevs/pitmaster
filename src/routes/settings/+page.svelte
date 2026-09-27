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
  import { LANGS } from "$lib/i18n/langs";
  import { t, tp } from "$lib/i18n";
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

  const THEMES = $derived<{ id: Theme; label: string; icon: typeof Sun }[]>([
    { id: "system", label: t("settings.appearance.theme.system"), icon: Monitor },
    { id: "light", label: t("settings.appearance.theme.light"), icon: Sun },
    { id: "dark", label: t("settings.appearance.theme.dark"), icon: Moon },
  ]);

  // the six most traded, in that order; each name is translated below
  const CURRENCY_CODES = ["USD", "EUR", "JPY", "GBP", "CNY", "AUD"] as const;

  // one tab at a time. the tab rides in the url's #, so a link can open any
  // of them (/settings#chips), and a link to a part of one (#data) opens its tab.
  // only the open one is on the page, so it can rise in when it's picked; the
  // one it replaces goes at once, so the two never stack.
  const GROUPS = $derived([
    {
      label: t("settings.nav.groups.games"),
      tabs: [
        { id: "game", label: t("settings.nav.tabs.game"), icon: Spade },
        { id: "defaults", label: t("settings.nav.tabs.defaults"), icon: CirclePlus },
        { id: "chips", label: t("settings.nav.tabs.chips"), icon: Coins },
        { id: "tv", label: t("settings.nav.tabs.tv"), icon: Tv },
      ],
    },
    {
      label: t("settings.nav.groups.you"),
      tabs: [
        { id: "general", label: t("settings.nav.tabs.general"), icon: Sliders },
        { id: "yours", label: t("settings.nav.tabs.yours"), icon: ShieldCheck },
      ],
    },
  ]);
  const TABS = $derived(GROUPS.flatMap((g) => g.tabs.map((t) => t.id)));
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

  const AUTO_LOCK = $derived<[number, string][]>([
    [30, t("settings.lock.autoLock.options.sec30")],
    [60, t("settings.lock.autoLock.options.min1")],
    [120, t("settings.lock.autoLock.options.min2")],
    [300, t("settings.lock.autoLock.options.min5")],
    [600, t("settings.lock.autoLock.options.min10")],
    [900, t("settings.lock.autoLock.options.min15")],
    [1800, t("settings.lock.autoLock.options.min30")],
    [3600, t("settings.lock.autoLock.options.hour1")],
    [0, t("settings.lock.autoLock.options.onClose")],
  ]);
  // same order, worded to slot into "PitMaster locks {phrase} with no input."
  const AUTO_LOCK_PHRASE = $derived<Record<number, string>>({
    30: t("settings.lock.autoLock.phrase.sec30"),
    60: t("settings.lock.autoLock.phrase.min1"),
    120: t("settings.lock.autoLock.phrase.min2"),
    300: t("settings.lock.autoLock.phrase.min5"),
    600: t("settings.lock.autoLock.phrase.min10"),
    900: t("settings.lock.autoLock.phrase.min15"),
    1800: t("settings.lock.autoLock.phrase.min30"),
    3600: t("settings.lock.autoLock.phrase.hour1"),
    0: t("settings.lock.autoLock.phrase.onClose"),
  });

  let templates = $state(getTemplates());
  const sym = $derived(currencySymbol());

  function removeTemplate(id: string, name: string) {
    if (!confirm(t("settings.defaults.templates.deleteConfirm", { name }))) return;
    deleteTemplate(id);
    templates = getTemplates();
    toast(t("settings.defaults.templates.deletedToast", { name }), "info");
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
  type Extra = "useBounties" | "useRebuys" | "useSeats" | "useDeals" | "usePayLinks" | "useBombPots" | "useSevenTwo" | "useHighHand";
  const EXTRAS = $derived<{ key: Extra; label: string; hint: string }[]>([
    { key: "useBounties", label: t("settings.game.extras.bounties.label"), hint: t("settings.game.extras.bounties.hint") },
    { key: "useRebuys", label: t("settings.game.extras.rebuys.label"), hint: t("settings.game.extras.rebuys.hint") },
    { key: "useSeats", label: t("settings.game.extras.seats.label"), hint: t("settings.game.extras.seats.hint") },
    { key: "useDeals", label: t("settings.game.extras.deals.label"), hint: t("settings.game.extras.deals.hint") },
    { key: "usePayLinks", label: t("settings.game.extras.payLinks.label"), hint: t("settings.game.extras.payLinks.hint") },
    { key: "useBombPots", label: t("settings.game.extras.bombPots.label"), hint: t("settings.game.extras.bombPots.hint") },
    { key: "useSevenTwo", label: t("settings.game.extras.sevenTwo.label"), hint: t("settings.game.extras.sevenTwo.hint") },
    { key: "useHighHand", label: t("settings.game.extras.highHand.label"), hint: t("settings.game.extras.highHand.hint") },
  ]);

  function pickMotion(m: "system" | "reduced") {
    settings.motion = m;
    saveSettings();
  }

  // table rules most games play by, whatever their size, one click to add
  const COMMON_RULES = $derived([
    t("settings.house.commonRules.cardsSpeak"),
    t("settings.house.commonRules.showOneShowAll"),
    t("settings.house.commonRules.verbalBinding"),
    t("settings.house.commonRules.noStringBets"),
    t("settings.house.commonRules.onePlayerToAHand"),
    t("settings.house.commonRules.protectYourHand"),
    t("settings.house.commonRules.chipsStayOnTable"),
    t("settings.house.commonRules.straddlesWelcome"),
    t("settings.house.commonRules.runItTwice"),
    t("settings.house.commonRules.chopBlinds"),
    t("settings.house.commonRules.phonesDown"),
    t("settings.house.commonRules.rebuysBetweenHands"),
    t("settings.house.commonRules.newDeckOnRequest"),
    t("settings.house.commonRules.lastHandAnnounced"),
    t("settings.house.commonRules.settleUp"),
    t("settings.house.commonRules.finalSay"),
  ]);
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
    speak(t("settings.tv.announcer.sample"));
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
    keyNote = { text: t("settings.keyboard.openCommands.saved", { key: keyLabel(combo) }), bad: false };
    play("on");
  }

  function resetKey() {
    settings.paletteKey = DEFAULT_PALETTE_KEY;
    saveSettings();
    keyNote = { text: t("settings.keyboard.openCommands.resetTo", { key: keyLabel(DEFAULT_PALETTE_KEY) }), bad: false };
  }

  // the rest of the keys, for reference
  // a number box that can be left blank (blank = automatic, saved as 0)
  function setAuto(key: "tStack", e: Event) {
    settings[key] = Math.max(0, Number((e.currentTarget as HTMLInputElement).value) || 0);
    saveSettings();
  }

  // ---------- export + import ----------
  /** "a, b and c", joined the way this language does it */
  const list = (xs: (string | false | 0)[]) => {
    const ys = xs.filter(Boolean) as string[];
    return ys.length > 1 ? t("settings.data.summary.join", { rest: ys.slice(0, -1).join(", "), last: ys.at(-1)! }) : (ys[0] ?? "");
  };
  function contents(d: Backup["data"]) {
    const live = d.games.filter((g) => !g.finished).length;
    const people = Object.keys(d.handles).length;
    return list([
      tp("settings.data.count.games", d.games.length, { n: d.games.length }) + (live ? ` ${t("settings.data.count.inProgress", { n: live })}` : ""),
      d.chipSets.length > 0 && tp("settings.data.count.chipSets", d.chipSets.length, { n: d.chipSets.length }),
      (d.templates?.length ?? 0) > 0 && tp("settings.data.count.templates", d.templates!.length, { n: d.templates!.length }),
      people > 0 && tp("settings.data.count.payLinksFor", people, { n: people }),
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
    next.length < MIN_PASSCODE ? t("settings.lock.passcode.tooShort", { n: MIN_PASSCODE }) : next !== again ? t("settings.lock.passcode.mismatch") : ""
  );
  const autoLockLabel = () => AUTO_LOCK_PHRASE[settings.autoLock] ?? t("settings.lock.autoLock.phrase.awhile");

  async function passcode(to: string | null, e?: SubmitEvent) {
    e?.preventDefault();
    lockBusy = true;
    lockErr = "";
    try {
      await setPasscode(to, current);
      current = next = again = "";
      // (its button clicked shut or open on the way down; the toast says it worked)
      toast(!to ? t("settings.lock.toast.off") : settings.autoLock ? t("settings.lock.toast.onWithAuto", { phrase: autoLockLabel() }) : t("settings.lock.toast.on"));
    } catch (err) {
      lockErr = (err as Error).message === "wrong" ? t("settings.lock.error.wrongPasscode") : t("settings.lock.error.generic");
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
      toast(locking ? t("settings.data.export.toast.locked") : t("settings.data.export.toast.plain"));
    } catch {
      toast(t("settings.data.export.toast.lockFailed"), "bad");
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
    if (file.size > MAX_IMPORT) return void toast(t("settings.data.import.error.tooBig"), "bad");
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
      toast(t("settings.data.import.error.failed", { message: (err as Error).message }), "bad");
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
    toast(tp("settings.data.import.importedToast", backup.data.games.length, { n: backup.data.games.length }));
  }

  function takeBack() {
    if (!undoable || !undoImport()) return;
    if (undoable.settings) adoptSettings(undoable.settings);
    undoable = null;
    arrived = [];
    templates = getTemplates();
    rev++;
    play("rewind");
    toast(t("settings.data.import.undoneToast"), "info");
  }

  function startOver() {
    if (!confirm(t("settings.data.startOver.confirm"))) return;
    wipeAll();
    templates = getTemplates();
    arrived = [];
    undoable = null;
    rev++;
    toast(t("settings.data.startOver.doneToast"));
  }
</script>

<svelte:head><title>{t("settings.page.title")} · PitMaster</title></svelte:head>
<svelte:window onhashchange={() => (hash = location.hash)} />

<h1>{t("settings.page.heading")}</h1>
<p class="muted">{t("settings.page.savedHint")} <a href="#data">{t("settings.page.exportLink")}</a> {t("settings.page.savedHintEnd")}</p>

<div class="settings grid grid-cols-[176px_minmax(0,1fr)] gap-x-12 gap-y-0 items-start mt-[26px] max-[760px]:grid-cols-[minmax(0,1fr)] max-[760px]:mt-[18px]" bind:this={panes}>
<nav class="side flex flex-col gap-0.5 max-[760px]:grid max-[760px]:grid-cols-[repeat(3,minmax(0,1fr))] max-[760px]:gap-1 max-[760px]:mb-[26px] max-[380px]:grid-cols-[repeat(2,minmax(0,1fr))]" aria-label={t("settings.page.heading")}>
  {#each GROUPS as g (g.label)}
    <p class="eyebrow group mt-[18px] mx-0 mb-1 pl-[11px] first:mt-0 max-[760px]:hidden">{g.label}</p>
    {#each g.tabs as t (t.id)}
      <a href="#{t.id}" class="flex items-center gap-2.5 min-h-[var(--control-h-big)] py-0 px-[10px] border-[length:var(--hair)] border-solid border-transparent text-fg no-underline hover:bg-block max-[760px]:gap-[7px] max-[760px]:px-2 max-[760px]:py-0 max-[760px]:border-line" data-sound="soft" aria-current={tab === t.id ? "page" : undefined} onclick={(e) => pickTab(e, t.id)}><Icon icon={t.icon} />{t.label}</a>
    {/each}
  {/each}
</nav>

<div class="panes">
{#if tab === "game"}
<section id="game" class="max-w-[760px] mb-[30px]" in:fly={rise(6)}>
  <h2 class="flex items-center gap-2 first:mt-0">{t("settings.game.heading")}</h2>
  <p class="small muted lede -mt-1 mx-0 mb-1 max-w-[88ch]">{t("settings.game.lede")}</p>
  <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
    <div class="what flex flex-col gap-px">
      <b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.game.rake.label")}</b>
      <span class="small muted">{t("settings.game.rake.hint")}</span>
    </div>
    <div>
      <label class="across m-0"><input type="checkbox" checked={settings.useRake} onchange={toggleRake} /><span>{t("settings.game.rake.checkbox")}</span></label>
      {#if settings.useRake}
        <div class="more mt-2" transition:slide={reveal()}>
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
  <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
    <div class="what flex flex-col gap-px">
      <b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.game.houseCut.label")}</b>
      <span class="small muted">{t("settings.game.houseCut.hint")}</span>
    </div>
    <div>
      <label class="across m-0"><input type="checkbox" bind:checked={settings.useHouseCut} onchange={saveSettings} /><span>{t("settings.game.houseCut.checkbox")}</span></label>
      {#if settings.useHouseCut}
        <div class="more mt-2" transition:slide={reveal()}>
          <HouseCutFields bind:fee={settings.tFee} bind:pct={settings.tRakePct} buyIn={settings.tBuyIn} onchange={saveSettings} />
        </div>
      {/if}
    </div>
  </div>
  <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.game.extras.heading")}</b><span class="small muted">{t("settings.game.extras.hint")}</span></div>
    <div class="vstack">
      {#each EXTRAS as x (x.key)}
        <label class="opt grid grid-cols-[auto_1fr] gap-2 items-start cursor-pointer m-0">
          <input type="checkbox" class="mt-[3px] mx-0" bind:checked={settings[x.key]} onchange={saveSettings} />
          <span class="flex flex-col"><span class="name">{x.label}</span><span class="small muted">{x.hint}</span></span>
        </label>
      {/each}
    </div>
  </div>
  <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start" id="house">
    <label class="what flex flex-col gap-px m-0" for="rules"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.house.heading")}</b><span class="small muted">{t("settings.house.hint")}</span></label>
    <div>
      <textarea id="rules" rows={Math.min(10, Math.max(3, houseRules().length + 1))} value={settings.houseRules} oninput={typeRules} onchange={flushRules} placeholder={t("settings.house.placeholder")}></textarea>
      {#if unusedRules.length}
        <p class="small links common mt-1.5 mx-0 mb-2">
          <span class="muted">{t("settings.house.commonOnes")}</span>
          {#each unusedRules as r (r)}<button class="link" data-sound="card" onclick={() => addRule(r)}><Icon icon={Plus} size="1em" />{r}</button>{/each}
        </p>
      {/if}
      <label class="across m-0"><input type="checkbox" bind:checked={settings.rulesOnNew} onchange={saveSettings} /><span>{t("settings.house.onNewGame")}</span></label>
    </div>
  </div>
</section>
{/if}

{#if tab === "defaults"}
<section id="defaults" class="max-w-[760px] mb-[30px]" in:fly={rise(6)}>
  <h2 class="flex items-center gap-2 first:mt-0">{t("settings.defaults.heading")}</h2>
  <p class="small muted lede -mt-1 mx-0 mb-1 max-w-[88ch]">{t("settings.defaults.lede")}</p>

  <h3 class="mt-[22px]">{t("settings.defaults.tournaments.heading")}</h3>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="t-buyin"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.buyIn.label", { sym })}</b><span class="small muted">{t("settings.defaults.tournaments.buyIn.hint")}</span></label>
    <input id="t-buyin" type="number" min="0" step="any" bind:value={settings.tBuyIn} onchange={saveSettings} />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="t-players"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.players.label")}</b><span class="small muted">{t("settings.defaults.tournaments.players.hint")}</span></label>
    <input id="t-players" type="number" min="2" max="100" bind:value={settings.tPlayers} onchange={saveSettings} />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="t-stack"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.startingStack.label")}</b><span class="small muted">{t("settings.defaults.tournaments.startingStack.hint")}</span></label>
    <input id="t-stack" type="number" min="0" step="any" placeholder={t("settings.defaults.auto")} value={settings.tStack || ""} onchange={(e) => setAuto("tStack", e)} />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="t-depth"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.startingDepth.label")}</b><span class="small muted">{t("settings.defaults.tournaments.startingDepth.hint")}</span></label>
    <GameSelect of="depth" id="t-depth" bind:value={settings.tDepth} onchange={saveSettings} />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="t-hours"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.length.label")}</b><span class="small muted">{t("settings.defaults.tournaments.length.hint")}</span></label>
    <select id="t-hours" bind:value={settings.tHours} onchange={saveSettings}>
      {#each [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8] as h (h)}<option value={h}>{t("settings.defaults.length.about", { time: duration(h * 60) })}</option>{/each}
    </select>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="t-level"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.levelLength.label")}</b></label>
    <GameSelect of="level" id="t-level" bind:value={settings.tLevel} onchange={saveSettings} />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.breaks.label")}</b><span class="small muted">{t("settings.defaults.tournaments.breaks.hint")}</span></div>
    <div class="row">
      <label class="m-0"><span>{t("settings.defaults.tournaments.breaks.levelsBetween")}</span><input type="number" min="0" bind:value={settings.tBreakEvery} onchange={saveSettings} /></label>
      <label class="m-0"><span>{t("settings.defaults.tournaments.breaks.minutes")}</span><input type="number" min="1" bind:value={settings.tBreakMinutes} onchange={saveSettings} /></label>
    </div>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.antes.label")}</b><span class="small muted">{t("settings.defaults.tournaments.antes.hint")}</span></div>
    <div class="row">
      <label class="m-0"><span>{t("settings.defaults.tournaments.antes.antesFrom")}</span><input type="number" min="0" bind:value={settings.tAnteFrom} onchange={saveSettings} /></label>
      <label class="m-0"><span>{t("settings.defaults.tournaments.antes.lateRegThrough")}</span><input type="number" min="0" bind:value={settings.tLateReg} onchange={saveSettings} /></label>
    </div>
  </div>
  {#if settings.useRebuys}
    <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start" transition:slide={reveal()}>
      <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.rebuys.label")}</b><span class="small muted">{t("settings.defaults.tournaments.rebuys.hint")}</span></div>
      <div class="vstack fields items-start">
        <!-- a switch's number opens out beside it -->
        <div class="row">
          <label class="across m-0"><input type="checkbox" bind:checked={settings.tRebuy} onchange={saveSettings} /><span>{t("settings.defaults.tournaments.rebuys.checkbox")}</span></label>
          {#if settings.tRebuy}<label class="across beside whitespace-nowrap m-0" transition:slide={{ ...reveal(), axis: "x" }}><span>{t("settings.defaults.tournaments.rebuys.throughLevel")}</span><input type="number" min="1" bind:value={settings.tRebuyUntil} onchange={saveSettings} /></label>{/if}
        </div>
        <div class="row">
          <label class="across m-0"><input type="checkbox" bind:checked={settings.tAddOn} onchange={saveSettings} /><span>{t("settings.defaults.tournaments.rebuys.addOnCheckbox")}</span></label>
          {#if settings.tAddOn}<label class="across beside whitespace-nowrap m-0" transition:slide={{ ...reveal(), axis: "x" }}><span>{t("settings.defaults.tournaments.rebuys.cost", { sym })}</span><input type="number" min="0" step="any" bind:value={settings.tAddOnCost} onchange={saveSettings} /></label>{/if}
        </div>
      </div>
    </div>
  {/if}
  {#if settings.useBounties}
    <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center" transition:slide={reveal()}>
      <label class="what flex flex-col gap-px m-0" for="t-bounty"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.bounty.label", { sym })}</b><span class="small muted">{t("settings.defaults.tournaments.bounty.hint")}</span></label>
      <input id="t-bounty" type="number" min="0" step="any" bind:value={settings.tBounty} onchange={saveSettings} />
    </div>
    <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center" transition:slide={reveal()}>
      <label class="what flex flex-col gap-px m-0" for="t-bounty-kind"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.bountyKind.label")}</b><span class="small muted">{t("settings.defaults.tournaments.bountyKind.hint")}</span></label>
      <select id="t-bounty-kind" bind:value={settings.tBountyKind} onchange={saveSettings}>
        <option value="flat">{t("gameSetup.tournament.rebuys.kindFlat")}</option>
        <option value="progressive">{t("gameSetup.tournament.rebuys.kindProgressive")}</option>
        <option value="mystery">{t("gameSetup.tournament.rebuys.kindMystery")}</option>
      </select>
    </div>
  {/if}
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="t-payouts"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.payouts.label")}</b><span class="small muted">{t("settings.defaults.tournaments.payouts.hint")}</span></label>
    <input id="t-payouts" type="text" class="w-[220px]" placeholder={t("settings.defaults.auto")} bind:value={settings.tPayouts} onchange={saveSettings} />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="t-round"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.tournaments.roundTo.label")}</b><span class="small muted">{t("settings.defaults.tournaments.roundTo.hint", { amount: money(37.4) })}</span></label>
    <GameSelect of="round" id="t-round" bind:value={settings.payoutRound} onchange={saveSettings} />
  </div>

  <h3 class="mt-[22px]">{t("settings.defaults.cash.heading")}</h3>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.cash.buyIn.label")}</b><span class="small muted">{t("settings.defaults.cash.buyIn.hint")}</span></div>
    <div class="row">
      <label class="m-0"><span>{t("settings.defaults.cash.buyIn.min")}</span><input type="number" min="1" bind:value={settings.cashMinBB} onchange={saveSettings} /></label>
      <label class="m-0"><span>{t("settings.defaults.cash.buyIn.standard")}</span><input type="number" min="1" bind:value={settings.cashDepth} onchange={saveSettings} /></label>
      <label class="m-0"><span>{t("settings.defaults.cash.buyIn.max")}</span><input type="number" min="1" bind:value={settings.cashMaxBB} onchange={saveSettings} /></label>
    </div>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="c-hours"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.length.label")}</b><span class="small muted">{t("settings.defaults.cash.length.hint")}</span></label>
    <select id="c-hours" bind:value={settings.cashHours} onchange={saveSettings}>
      {#each [1, 2, 3, 4, 5, 6, 8, 10] as h (h)}<option value={h}>{t("settings.defaults.length.about", { time: duration(h * 60) })}</option>{/each}
    </select>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.cash.straddles.label")}</b></div>
    <label class="across m-0"><input type="checkbox" bind:checked={settings.cashStraddle} onchange={saveSettings} /><span>{t("settings.defaults.cash.straddles.checkbox")}</span></label>
  </div>
  {#if settings.useBombPots}
    <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center" transition:slide={reveal()}>
      <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.cash.bomb.label")}</b><span class="small muted">{t("settings.defaults.cash.bomb.hint")}</span></div>
      <div class="row">
        <label class="m-0"><span>{t("settings.defaults.cash.bomb.anteBB")}</span><input type="number" min="0" step="any" bind:value={settings.cashBombBB} onchange={saveSettings} /></label>
        <label class="m-0"><span>{t("settings.defaults.cash.bomb.every")}</span><input type="number" min="0" step="1" bind:value={settings.cashBombEvery} onchange={saveSettings} /></label>
        <label class="across m-0"><input type="checkbox" bind:checked={settings.cashBombDouble} onchange={saveSettings} /><span>{t("gameSetup.cash.sides.doubleBoard")}</span></label>
      </div>
    </div>
  {/if}
  {#if settings.useSevenTwo}
    <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center" transition:slide={reveal()}>
      <label class="what flex flex-col gap-px m-0" for="c-72"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.cash.sevenTwo.label")}</b><span class="small muted">{t("settings.defaults.cash.sevenTwo.hint")}</span></label>
      <input id="c-72" type="number" min="0" step="any" bind:value={settings.cashSevenTwoBB} onchange={saveSettings} />
    </div>
  {/if}
  {#if settings.useHighHand}
    <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center" transition:slide={reveal()}>
      <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.cash.highHand.label")}</b><span class="small muted">{t("settings.defaults.cash.highHand.hint")}</span></div>
      <div class="row">
        <label class="m-0"><span>{t("gameSetup.cash.sides.prize", { sym })}</span><input type="number" min="0" step="any" bind:value={settings.cashHighHandPrize} onchange={saveSettings} /></label>
        <label class="m-0"><span>{t("gameSetup.cash.sides.highHandEvery")}</span><input type="number" min="0" step="1" bind:value={settings.cashHighHandEvery} onchange={saveSettings} /></label>
      </div>
    </div>
  {/if}

  {#if settings.useSeats}
    <h3 class="mt-[22px]" transition:slide={reveal()}>{t("settings.defaults.both.heading")}</h3>
    <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center" transition:slide={reveal()}>
      <label class="what flex flex-col gap-px m-0" for="seats"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.both.seatsPerTable.label")}</b><span class="small muted">{t("settings.defaults.both.seatsPerTable.hint")}</span></label>
      <select id="seats" bind:value={settings.seatsPerTable} onchange={saveSettings}>
        {#each [4, 5, 6, 7, 8, 9, 10] as n (n)}<option value={n}>{t("settings.defaults.both.seatsPerTable.option", { n })}</option>{/each}
      </select>
    </div>
  {/if}
  <h3 id="templates" class="mt-[22px]">{t("settings.defaults.templates.heading")}</h3>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px">
      <b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.templates.savedSetups.label")}</b>
      <span class="small muted">{t("settings.defaults.templates.savedSetups.hintBefore")} <b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.defaults.templates.savedSetups.saveAsTemplate")}</b> {t("settings.defaults.templates.savedSetups.hintAfter")} (<kbd>{keyLabel(paletteKey)}</kbd>).</span>
    </div>
    {#if templates.length}
      <ul class="bare templates">
        {#each templates as tpl (tpl.id)}
          <li class="flex gap-2 items-baseline py-0.5 px-0">
            <a href="/new?type={tpl.type}&template={tpl.id}">{tpl.name}</a>
            <span class="small muted">{tpl.type === "cash" ? t("settings.defaults.templates.typeCash") : t("settings.defaults.templates.typeTournament")}{tpl.players.length ? ` · ${tp("settings.defaults.templates.playersCount", tpl.players.length, { n: tpl.players.length })}` : ""}</span>
            <button class="link small muted" data-sound="thud" onclick={() => removeTemplate(tpl.id, tpl.name)} aria-label={t("settings.defaults.templates.deleteAriaLabel", { name: tpl.name })}>{t("common.delete")}</button>
          </li>
        {/each}
      </ul>
    {:else}
      <span class="empty">{t("settings.defaults.templates.empty")}</span>
    {/if}
  </div>
</section>
{/if}

<!-- wider than the rest: a set list beside a table of chips -->
{#if tab === "chips"}
<section id="chips" class="max-w-none mb-[30px]" in:fly={rise(6)}>
  <h2 class="flex items-center gap-2 first:mt-0">{t("settings.chips.heading")}</h2>
  <p class="small muted lede -mt-1 mx-0 mb-1 max-w-[88ch]">{t("settings.chips.lede")}</p>
  <!-- an import or a fresh start swaps what's saved, so it reads them again -->
  {#key rev}<ChipSets />{/key}
</section>
{/if}

{#if tab === "tv"}
<section id="tv" class="max-w-[760px] mb-[30px]" in:fly={rise(6)}>
  <h2 class="flex items-center gap-2 first:mt-0">{t("settings.tv.heading")}</h2>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="warn"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.tv.levelWarning.label")}</b><span class="small muted">{t("settings.tv.levelWarning.hint")}</span></label>
    <select id="warn" bind:value={settings.levelWarning} onchange={saveSettings}>
      <option value={0}>{t("common.off")}</option>
      <option value={1}>{t("settings.tv.levelWarning.before1")}</option>
      <option value={2}>{t("settings.tv.levelWarning.before2")}</option>
      <option value={5}>{t("settings.tv.levelWarning.before5")}</option>
    </select>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.tv.sound.label")}</b><span class="small muted">{t("settings.tv.sound.hint")}</span></div>
    <label class="across m-0"><input type="checkbox" bind:checked={settings.tvSound} onchange={saveSettings} /><span>{t("settings.tv.sound.checkbox")}</span></label>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="tv-vol"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.tv.volume.label")}</b><span class="small muted">{t("settings.tv.volume.hint")}</span></label>
    <div class="vol flex items-center gap-2.5">
      <input id="tv-vol" type="range" class="w-[200px]" min="0" max="100" step="5" bind:value={settings.tvVolume} onchange={() => (saveSettings(), sounds.level())} />
      <span class="num small min-w-[4ch] text-right">{settings.tvVolume}%</span>
    </div>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.tv.keepAwake.label")}</b><span class="small muted">{t("settings.tv.keepAwake.hint")}</span></div>
    <label class="across m-0"><input type="checkbox" bind:checked={settings.tvAwake} onchange={saveSettings} /><span>{t("settings.tv.keepAwake.checkbox")}</span></label>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.tv.announcer.label")}</b><span class="small muted">{t("settings.tv.announcer.hint")}</span></div>
    <div class="row">
      <label class="across m-0"><input type="checkbox" bind:checked={settings.tvVoice} onchange={saveSettings} /><span>{t("settings.tv.announcer.checkbox")}</span></label>
      <button class="link small" onclick={testVoice}>{t("settings.tv.announcer.hearIt")}</button>
    </div>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.tv.money.label")}</b><span class="small muted">{t("settings.tv.money.hint")}</span></div>
    <label class="across m-0"><input type="checkbox" bind:checked={settings.tvMoney} onchange={saveSettings} /><span>{t("settings.tv.money.checkbox")}</span></label>
  </div>
</section>
{/if}

{#if tab === "general"}
<section id="general" class="max-w-[760px] mb-[30px]" in:fly={rise(6)}>
  <h2 class="flex items-center gap-2 first:mt-0">{t("settings.general.heading")}</h2>
  <h3 id="appearance" class="mt-[22px]">{t("settings.appearance.heading")}</h3>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px">
      <b id="theme-l" class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.appearance.theme.label")}</b>
      <span class="small muted">{t("settings.appearance.theme.hint")}</span>
    </div>
    <Seg labelledby="theme-l" value={settings.theme} options={THEMES} onpick={pickTheme} />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px">
      <b id="sound-l" class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.appearance.sounds.label")}</b>
      <span class="small muted">{t("settings.appearance.sounds.hint")}</span>
    </div>
    <Seg
      labelledby="sound-l"
      value={settings.sounds ? "on" : "off"}
      options={[
        { id: "off", label: t("common.off"), icon: VolumeX },
        { id: "on", label: t("common.on"), icon: Volume2 },
      ]}
      onpick={pickSounds}
    />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="ui-vol"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.appearance.volume.label")}</b><span class="small muted">{t("settings.appearance.volume.hint")} {settings.sounds ? t("settings.appearance.volume.hintOn") : t("settings.appearance.volume.hintOff")}</span></label>
    <!-- (the title sits on the box: a disabled slider shows no tooltip of its own) -->
    <div class="vol flex items-center gap-2.5" title={settings.sounds ? undefined : t("settings.appearance.volume.disabledTitle")}>
      <input id="ui-vol" type="range" class="w-[200px]" min="0" max="100" step="5" bind:value={settings.volume} onchange={() => (saveSettings(), play("chips"))} disabled={!settings.sounds} />
      <span class="num small min-w-[4ch] text-right">{settings.volume}%</span>
    </div>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px">
      <b id="motion-l" class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.appearance.motion.label")}</b>
      <span class="small muted">{t("settings.appearance.motion.hint")}</span>
    </div>
    <Seg
      labelledby="motion-l"
      value={settings.motion}
      options={[
        { id: "system", label: t("settings.appearance.motion.system"), icon: Sparkles },
        { id: "reduced", label: t("settings.appearance.motion.reduced"), icon: Minimize },
      ]}
      onpick={pickMotion}
    />
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px">
      <b id="toys-l" class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.appearance.toys.label")}</b>
      <span class="small muted">{t("settings.appearance.toys.hint")}</span>
    </div>
    <Seg
      labelledby="toys-l"
      value={settings.toys ? "on" : "off"}
      options={[
        { id: "off", label: t("common.off"), icon: EyeOff },
        { id: "on", label: t("common.on"), icon: Dices },
      ]}
      onpick={pickToys}
    />
  </div>
  <h3 id="keys" class="mt-[22px]">{t("settings.keyboard.heading")}</h3>
  <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
    <div class="what flex flex-col gap-px">
      <b id="pal-l" class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.keyboard.openCommands.label")}</b>
      <span class="small muted">{t("settings.keyboard.openCommands.hint")}</span>
    </div>
    <div>
      <div class="row">
        <button class="keycap gap-2 min-w-[170px] justify-start" class:listening aria-labelledby="pal-l" aria-describedby="pal-note" data-sound="none" onclick={listen} onkeydown={record} onblur={() => (listening = false)}>
          <Icon icon={Keyboard} />
          {#if listening}
            {#if holding}<kbd>{holding}</kbd><span class="muted">{t("settings.keyboard.openCommands.andAKey")}</span>{:else}<span class="muted">{t("settings.keyboard.openCommands.pressNewKeys")}</span>{/if}
          {:else}
            <kbd>{keyLabel(paletteKey)}</kbd>
          {/if}
        </button>
        {#if listening}
          <span class="small muted" in:fade={reveal()}>{t("settings.keyboard.openCommands.escToKeep", { key: keyLabel(paletteKey) })}</span>
        {:else if paletteKey !== DEFAULT_PALETTE_KEY}
          <button class="link small muted" data-sound="rewind" onclick={resetKey}>{t("settings.keyboard.openCommands.resetButton", { key: keyLabel(DEFAULT_PALETTE_KEY) })}</button>
        {/if}
      </div>
      <!-- always there, so the row doesn't jump and a screen reader hears each new note -->
      <p id="pal-note" class="small note min-h-[1.5em] mt-1.5 mx-0" class:bad={keyNote?.bad} class:muted={!keyNote?.bad} aria-live="polite">
        {#key keyNote}<span in:fade={reveal()}>{keyNote?.text ?? ""}</span>{/key}
      </p>
    </div>
  </div>
  <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.keyboard.otherShortcuts.label")}</b><span class="small muted">{t("settings.keyboard.otherShortcuts.hint")}</span></div>
    <KeyList class="small" />
  </div>
  <h3 id="region" class="mt-[22px]">{t("settings.region.heading")}</h3>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="lang"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.language.title")}</b><span class="small muted">{t("settings.language.hint")}</span></label>
    <select id="lang" bind:value={settings.language} onchange={saveSettings}>
      {#each LANGS as { code, native } (code)}<option value={code} lang={code}>{native}</option>{/each}
    </select>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <label class="what flex flex-col gap-px m-0" for="cur"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.region.currency.label")}</b><span class="small muted">{t("settings.region.currency.hint")} <span class="num">{money(1250.5)}</span>. {t("settings.region.currency.hintEnd")}</span></label>
    <select id="cur" bind:value={settings.currency} onchange={saveSettings}>
      {#each CURRENCY_CODES as code (code)}<option value={code}>{t(`settings.region.currency.names.${code}`)}</option>{/each}
    </select>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b id="clock-l" class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.region.time.label")}</b><span class="small muted">{t("settings.region.time.hint", { time: timeOfDay(Date.now()) })}</span></div>
    <Seg
      labelledby="clock-l"
      value={settings.clock}
      options={[
        { id: "12h", label: t("settings.region.time.h12"), hint: "7:30 PM" },
        { id: "24h", label: t("settings.region.time.h24"), hint: "19:30" },
      ]}
      onpick={pickClock}
    />
  </div>
</section>
{/if}

{#if tab === "yours"}
<section id="yours" class="max-w-[760px] mb-[30px]" in:fly={rise(6)}>
  <h2 class="flex items-center gap-2 first:mt-0">{t("settings.yours.heading")}</h2>
  <h3 id="lock" class="mt-[22px]">{t("settings.lock.heading")}</h3>
  <p class="small muted lede -mt-1 mx-0 mb-1 max-w-[88ch]">{t("settings.lock.intro")}</p>
  {#if vault.state === "memory"}
    <p class="small muted">{t("settings.lock.needsHttps")}</p>
  {:else if !vault.passcode}
    <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
      <div class="what flex flex-col gap-px">
        <b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.lock.passcode.label")}</b>
        <span class="small muted">{t("settings.lock.passcode.hint", { n: MIN_PASSCODE })}</span>
      </div>
      <form class="vstack fields items-start" onsubmit={(e) => passcode(next, e)}>
        <!-- password managers file a passcode under a name; this is the one the lock screen uses -->
        <input type="text" autocomplete="username" value="PitMaster" hidden />
        <input type="password" bind:value={next} autocomplete="new-password" minlength={MIN_PASSCODE} placeholder={t("settings.lock.passcode.newPlaceholder")} aria-label={t("settings.lock.passcode.newAriaLabel")} />
        <input type="password" bind:value={again} autocomplete="new-password" placeholder={t("settings.lock.passcode.againPlaceholder")} aria-label={t("settings.lock.passcode.againAriaLabel")} />
        {#if next && nextProblem}<p class="small muted" transition:slide={reveal()}>{nextProblem}</p>{/if}
        <button data-sound="lock" disabled={lockBusy || !!nextProblem} title={nextProblem || undefined}><Icon icon={Lock} />{lockBusy ? t("settings.lock.passcode.turningOn") : t("settings.lock.passcode.turnOnButton")}</button>
        {#if lockErr}<p class="small bad" aria-live="polite" transition:slide={reveal()}>{lockErr}</p>{/if}
      </form>
    </div>
  {:else}
    <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
      <label class="what flex flex-col gap-px m-0" for="auto-lock"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.lock.autoLock.label")}</b><span class="small muted">{t("settings.lock.autoLock.hint")}</span></label>
      <div class="row">
        <select id="auto-lock" bind:value={settings.autoLock} onchange={saveSettings}>
          {#each AUTO_LOCK as [s, label] (s)}<option value={s}>{label}</option>{/each}
        </select>
        <button data-sound="lock" onclick={lockNow}><Icon icon={Lock} />{t("settings.lock.autoLock.lockNowButton")}</button>
      </div>
    </div>
    <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
      <div class="what flex flex-col gap-px">
        <b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.lock.changeOrOff.label")}</b>
        <span class="small muted">{t("settings.lock.changeOrOff.hint")}</span>
      </div>
      <form class="vstack fields items-start" onsubmit={(e) => passcode(next, e)}>
        <input type="text" autocomplete="username" value="PitMaster" hidden />
        <input type="password" bind:value={current} autocomplete="current-password" placeholder={t("settings.lock.changeOrOff.currentPlaceholder")} aria-label={t("settings.lock.changeOrOff.currentAriaLabel")} />
        <input type="password" bind:value={next} autocomplete="new-password" minlength={MIN_PASSCODE} placeholder={t("settings.lock.passcode.newPlaceholder")} aria-label={t("settings.lock.passcode.newAriaLabel")} />
        <input type="password" bind:value={again} autocomplete="new-password" placeholder={t("settings.lock.passcode.againPlaceholder")} aria-label={t("settings.lock.passcode.againAriaLabel")} />
        {#if next && nextProblem}<p class="small muted" transition:slide={reveal()}>{nextProblem}</p>{/if}
        <div class="row">
          <button data-sound="lock" disabled={lockBusy || !current || !!nextProblem} title={!current ? t("settings.lock.changeOrOff.typeCurrentFirst") : nextProblem || undefined}>{lockBusy ? t("settings.lock.changeOrOff.changingBusy") : t("settings.lock.changeOrOff.changeButton")}</button>
          <button type="button" data-sound="unlock" disabled={lockBusy || !current} title={current ? undefined : t("settings.lock.changeOrOff.typeCurrentFirst")} onclick={() => passcode(null)}>{t("settings.lock.changeOrOff.turnOffButton")}</button>
        </div>
        {#if lockErr}<p class="small bad" aria-live="polite" transition:slide={reveal()}>{lockErr}</p>{/if}
      </form>
    </div>
  {/if}
  <h3 id="data" class="mt-[22px]">{t("settings.data.heading")}</h3>
  <p class="small muted lede -mt-1 mx-0 mb-1 max-w-[88ch]">
    {t("settings.data.lede", { summary: here.summary, kb: here.kb })}
    <a href="/privacy">{t("settings.data.privacyLink")}</a>
  </p>
  <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
    <div class="what flex flex-col gap-px">
      <b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.data.export.label")}</b>
      <span class="small muted">{t("settings.data.export.hint")}{#if exportedAt}{" "}{t("settings.data.export.lastExported", { time: ago(exportedAt) })}{/if}</span>
    </div>
    <div class="vstack fields items-start">
      <div>
        <button
          onclick={exportEverything}
          disabled={exporting || (locking && exportPassword.length < MIN_PASSWORD)}
          title={locking && exportPassword.length < MIN_PASSWORD ? t("settings.data.export.passwordTitle", { n: MIN_PASSWORD }) : undefined}
        ><Icon icon={Download} />{exporting ? t("settings.data.export.busy") : t("settings.data.export.button")}</button>
      </div>
      <label class="across m-0"><input type="checkbox" bind:checked={withSettings} /><span>{t("settings.data.export.includeSettings")}</span></label>
      <label class="across m-0"><input type="checkbox" bind:checked={locking} /><span>{t("settings.data.export.lockWithPassword")}</span></label>
      {#if locking}
        <div class="vstack fields items-start" transition:slide={reveal()}>
          <input type="password" bind:value={exportPassword} autocomplete="new-password" minlength={MIN_PASSWORD} placeholder={t("settings.data.export.passwordPlaceholder")} aria-label={t("settings.data.export.passwordAriaLabel")} aria-describedby="pw-note" />
          <p id="pw-note" class="small muted m-0">{t("settings.data.export.passwordNote", { n: MIN_PASSWORD })}</p>
        </div>
      {/if}
    </div>
  </div>
  <div class="set top grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-start">
    <div class="what flex flex-col gap-px">
      <b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.data.import.label")}</b>
      <span class="small muted">{t("settings.data.import.hint")}</span>
    </div>
    <div>
      {#if pending}
        <div class="vstack fields slab items-start" transition:slide={reveal()}>
          <p class="with-icon file [overflow-wrap:anywhere]"><Icon icon={FileJson} /><b>{pending.name}</b></p>
          <p class="small muted m-0">
            {t(pending.backup.kind === "game" ? "settings.data.import.kindGame" : "settings.data.import.kindEverything")}, {t("settings.data.import.exportedAt", { day: day(pending.backup.exportedAt), time: timeOfDay(pending.backup.exportedAt) })}:
            {contents(pending.backup.data)}{pending.backup.settings ? t("settings.data.import.plusSettings") : ""}.
          </p>
          {#if whole}
            <Seg
              labelledby="mode-l"
              value={mode}
              options={[
                { id: "merge", label: t("settings.data.import.modeMerge"), icon: Merge },
                { id: "replace", label: t("settings.data.import.modeReplace"), icon: Replace },
              ]}
              onpick={(m: ImportMode) => (mode = m)}
            />
            <span id="mode-l" class="sr-only">{t("settings.data.import.modeAriaLabel")}</span>
          {/if}
          {#if plan}
            <p class="small">
              {#if whole && mode === "replace"}
                <span class="bad">{tp("settings.data.import.replaceCount", plan.here, { n: plan.here })} {pending.backup.data.games.length}.</span> {t("settings.data.import.replaceOthers")}
              {:else}
                {list([plan.added > 0 && tp("settings.data.count.newGames", plan.added, { n: plan.added }), plan.updated > 0 && t("settings.data.import.newerCount", { n: plan.updated }), plan.kept > 0 && t("settings.data.import.keptCount", { n: plan.kept })]) || t("settings.data.import.noGames")}. {t("settings.data.import.nothingDeleted")}
              {/if}
            </p>
          {/if}
          {#if pending.backup.settings}
            <label class="opt grid grid-cols-[auto_1fr] gap-2 items-start cursor-pointer m-0">
              <input type="checkbox" class="mt-[3px] mx-0" bind:checked={takeSettings} />
              <span class="flex flex-col"><span class="name">{t("settings.data.import.useSettingsToo.label")}</span><span class="small muted">{t("settings.data.import.useSettingsToo.hint")}</span></span>
            </label>
          {/if}
          <div class="row">
            {#if whole && mode === "replace"}
              <button class="danger" data-sound="thud" onclick={runImport}><Icon icon={Replace} />{t("settings.data.import.modeReplace")}</button>
            {:else}
              <button onclick={runImport}><Icon icon={Upload} />{t("settings.data.import.importButton")}</button>
            {/if}
            <button class="link muted" data-sound="close" onclick={() => (pending = null)}>{t("common.cancel")}</button>
          </div>
        </div>
      {:else if lockedFile}
        <form class="vstack fields slab items-start" onsubmit={unlockFile} transition:slide={reveal()}>
          <p class="with-icon file [overflow-wrap:anywhere]"><Icon icon={Lock} /><b>{lockedFile.name}</b></p>
          <p class="small muted">
            {t(lockedFile.file.kind === "game" ? "settings.data.import.kindGame" : "settings.data.import.kindEverything")}, {t("settings.data.import.exportedAt", { day: day(lockedFile.file.exportedAt), time: timeOfDay(lockedFile.file.exportedAt) })}. {t("settings.data.import.lockedWithPassword")}
          </p>
          <div class="row">
            <input type="password" bind:value={password} autocomplete="off" placeholder={t("settings.data.export.passwordPlaceholder")} aria-label={t("settings.data.import.filePasswordAriaLabel")} aria-invalid={!!unlockErr} />
            <!-- (it clicks open, or doesn't, once the password's been tried) -->
            <button data-sound="none" disabled={!password || unlocking} title={password ? undefined : t("settings.data.import.typePasswordFirst")}><Icon icon={Lock} />{unlocking ? t("settings.data.import.unlockingBusy") : t("settings.data.import.unlockButton")}</button>
            <button type="button" class="link muted" data-sound="close" onclick={() => (lockedFile = null)}>{t("common.cancel")}</button>
          </div>
          {#if unlockErr}<p class="small bad" aria-live="polite" transition:slide={reveal()}>{unlockErr}</p>{/if}
        </form>
      {:else}
        <!-- drop a file anywhere on this box, or pick one -->
        <div
          class="drop flex items-center gap-2.5 flex-wrap p-[14px] border-[length:var(--hair)] border-dashed border-line-strong"
          class:over={dragging}
          role="group"
          aria-label={t("settings.data.import.dropAriaLabel")}
          ondragenter={(e) => (e.preventDefault(), (dragging = true))}
          ondragover={(e) => e.preventDefault()}
          ondragleave={(e) => !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node) && (dragging = false)}
          ondrop={onDrop}
        >
          <label class="btn m-0"><Icon icon={Upload} />{t("settings.data.import.chooseFile")}<input class="sr-only" type="file" accept=".json,application/json" onchange={pickFile} /></label>
          <span class="small muted">{t("settings.data.import.orDropHere")}</span>
        </div>
        {#if undoable}
          <p class="small links arrived mt-2 mx-0" transition:slide={reveal()}>
            <span class="good">{t("settings.data.import.importedLabel")}</span>
            {#if arrived.length}
              {arrived.length === 1 ? t("settings.data.import.readyToRun") : t("settings.data.import.inProgress")}
              {#each arrived.slice(0, 4) as g (g.id)}<a class="with-icon" href="/game/{g.id}">{g.name}<Icon icon={ArrowRight} size="1em" /></a>{/each}
            {/if}
            <button class="link muted with-icon" data-sound="none" onclick={takeBack}><Icon icon={Undo2} size="1em" />{t("settings.data.import.undoButton")}</button>
          </p>
        {/if}
      {/if}
    </div>
  </div>
  <div class="set grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-7 gap-y-1.5 py-3 px-0 border-b-[length:var(--hair)] border-solid border-line last:border-b-0 max-[600px]:grid-cols-[1fr] items-center">
    <div class="what flex flex-col gap-px"><b class="inline-flex items-center gap-1.5 font-normal text-fg">{t("settings.data.startOver.label")}</b><span class="small muted">{t("settings.data.startOver.hint")}</span></div>
    <div><button class="danger" data-sound="thud" onclick={startOver}><Icon icon={Trash} />{t("settings.data.startOver.button")}</button></div>
  </div>
</section>
{/if}
</div>
</div>

<style>
  /* a subsection opens on its own rule, so the row above it drops its one */
  .set:has(+ h3) {
    border-bottom: 0;
  }
  .side {
    position: sticky;
    top: calc(var(--head, 0px) + 16px);
  }
  /* a short screen can't hold the whole list still: it scrolls with the page */
  @media (max-height: 500px) {
    .side {
      position: static;
    }
  }
  .side a {
    transition:
      background-color var(--dur-hover) var(--ease-out),
      border-color var(--dur-hover) var(--ease-out);
  }
  .side a :global(svg) {
    color: var(--muted);
    transition: color var(--dur-hover) var(--ease-out);
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
  /* a phone: the tabs become a small grid over the open one */
  @media (max-width: 760px) {
    .side {
      position: static;
    }
  }
  /* (global: some are drawn by shared components) */
  .set :global(select) {
    justify-self: start;
    min-width: 220px;
  }
  /* the shortcut, shown as the keys themselves. while it records, its edge
     goes to ink over the lighter field face, like the picked side of a switch */
  .keycap kbd {
    pointer-events: none;
  }
  .keycap.listening,
  .keycap.listening:hover {
    border-color: var(--fg);
    background: var(--field);
  }
  /* the file box is hidden inside its label, so the label wears the focus ring */
  label.btn:has(:focus-visible) {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  /* the import target: a quiet box that lights up when a file is over it */
  .drop {
    transition:
      background-color var(--dur-hover) var(--ease-out),
      border-color var(--dur-hover) var(--ease-out);
  }
  .drop.over {
    background: var(--block);
    border-color: var(--focus);
    border-style: solid;
  }
  /* a press anywhere on the row presses its box, as a press on the box does */
  .opt:active input {
    transform: scale(0.86);
  }
  @media (max-width: 600px) {
    .set :global(select) {
      width: 100%;
    }
  }
</style>
