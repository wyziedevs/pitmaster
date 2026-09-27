<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { pagehead } from "$lib/pagehead";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";
  import Bookmark from "@lucide/svelte/icons/bookmark";
  import Plus from "@lucide/svelte/icons/plus";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { getChipSets, getDefaultChipSetId, saveGame, getTemplates, getTemplate, saveTemplate, getGame, getGames, getLeagues, knownPlayers } from "$lib/store";
  import { currentLeague } from "$lib/stats";
  import { gameChips, distribute, maxStack } from "$lib/chips";
  import { generateStructure, defaultPayouts, payoutAmounts, plannedMinutes, structureMinutes } from "$lib/blinds";
  import { newGame, unusedSeats } from "$lib/game";
  import type { BountyKind, CashRake, CashSettings, GameType, Level, Template, TourneySettings } from "$lib/types";
  import { PRESETS, getPreset, type Preset } from "$lib/presets";
  import { amt, currencySymbol, duration, money, nameKey, round2, timeOfDay, uid } from "$lib/util";
  import { toast } from "$lib/toast.svelte";
  import { time } from "$lib/now.svelte";
  import ChipLegend from "$lib/components/ChipLegend.svelte";
  import Breakdown from "$lib/components/Breakdown.svelte";
  import StructureTable from "$lib/components/StructureTable.svelte";
  import RakeFields from "$lib/components/RakeFields.svelte";
  import HouseCutFields from "$lib/components/HouseCutFields.svelte";
  import GameSelect from "$lib/components/GameSelect.svelte";
  import { bump, reveal, slide } from "$lib/motion";
  import { play } from "$lib/sound";
  import { settings, houseRules } from "$lib/settings.svelte";
  import { keyLabel } from "$lib/keys";
  import { t, tp } from "$lib/i18n";

  const type = $derived<GameType>(page.url.searchParams.get("type") === "tournament" ? "tournament" : "cash");
  const isCash = $derived(type === "cash");

  const sets = getChipSets();
  const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });
  // "Friday Cash Game": the day, not "night", since plenty of games run in the afternoon
  const defaultName = () => `${day} ${type === "cash" ? t("gameSetup.header.cashGame") : t("gameSetup.header.tournament")}`;

  // ---- shared ----
  let name = $state("");
  // every new game starts with the default set (Settings > Chip Sets)
  let chipSetId = $state(getDefaultChipSetId() || sets[0]?.id);
  let multiplier = $state(1);
  let playerNames = $state("");
  // the house rules ride along on every new game unless the host said not to
  let notes = $state(settings.rulesOnNew ? houseRules().join("\n") : "");
  const rulesMissing = $derived(houseRules().some((r) => !notes.includes(r)));
  function addHouseRules() {
    const add = houseRules().filter((r) => !notes.includes(r));
    notes = [notes.trim(), ...add].filter(Boolean).join("\n");
  }
  const chipSet = $derived(sets.find((s) => s.id === chipSetId) ?? sets[0]);
  const chips = $derived(chipSet ? gameChips(chipSet, multiplier) : []);
  const names = $derived(
    playerNames
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
  );

  // ---- the league it counts toward: the one that's on for this kind of game ----
  const leagues = getLeagues();
  const leagueChoices = $derived(leagues.filter((l) => l.types.includes(type)));
  let leagueId = $state("");
  let leagueFor = "";
  $effect(() => {
    if (leagueFor === type) return;
    leagueFor = type;
    leagueId = currentLeague(leagues, type)?.id ?? "";
  });

  // ---- cash ----
  let sb = $state(0.25);
  let bb = $state(0.5);
  let straddle = $state(settings.cashStraddle);
  let minBuyIn = $state(20);
  let maxBuyIn = $state(100);
  let defaultBuyIn = $state(50);
  let cashHours = $state(settings.cashHours);
  let cashPlayers = $state(8);
  let rakeMode = $state<CashRake["mode"]>(settings.cashRakeMode);
  let rakeCashPct = $state(settings.cashRakePct);
  let rakeCap = $state(settings.cashRakeCap);
  let seatFee = $state(settings.cashSeatFee);
  let houseName = $state(settings.houseName);
  // side games: the amounts start from the host's usual, in big blinds
  let bombOn = $state(true);
  let bombAnte = $state(0);
  let bombEvery = $state(settings.cashBombEvery);
  let bombDouble = $state(settings.cashBombDouble);
  let sevenTwoOn = $state(true);
  let sevenTwoAmount = $state(0);
  let highHandOn = $state(true);
  let highHandPrize = $state(settings.cashHighHandPrize);
  let highHandEvery = $state(settings.cashHighHandEvery);

  // ---- tournament ----
  let buyIn = $state(settings.tBuyIn);
  let stack = $state(settings.tStack || 10000);
  let expected = $state(settings.tPlayers);
  let hours = $state(settings.tHours);
  let levelMinutes = $state(settings.tLevel);
  let breakEvery = $state(settings.tBreakEvery);
  let breakMinutes = $state(settings.tBreakMinutes);
  let anteFrom = $state(settings.tAnteFrom);
  let depth = $state(settings.tDepth);
  let rebuyOn = $state(settings.tRebuy);
  let rebuyCost = $state(settings.tBuyIn);
  let rebuyChips = $state(10000);
  let rebuyUntil = $state(settings.tRebuyUntil);
  let addOnOn = $state(settings.tAddOn);
  let addOnCost = $state(settings.tAddOnCost);
  let addOnChips = $state(5000);
  let lateReg = $state(settings.tLateReg);
  let payoutText = $state(settings.tPayouts);
  let rakePct = $state(settings.tRakePct);
  let fee = $state(settings.tFee);
  let payoutRound = $state(settings.payoutRound);
  let bounty = $state(settings.tBounty);
  let bountyKind = $state<BountyKind>(settings.tBountyKind);
  let mysteryFrom = $state(0);
  // the format: a shootout, and a satellite whose prizes are seats worth this much
  let shootoutOn = $state(false);
  let satelliteOn = $state(false);
  let seatValue = $state(0);
  let levels = $state<Level[]>([]);
  let customized = $state(false);

  // sensible defaults whenever the type / chip set changes
  let lastKey = "";
  // tracks the last auto-filled name (in whatever language it was written) so
  // switching cash/tournament can tell a still-untouched name from one the
  // host actually typed, without guessing at English weekday/type words
  let lastDefault = "";
  $effect(() => {
    const key = `${type}|${chipSetId}`;
    if (key === lastKey || !chipSet) return;
    lastKey = key;
    const printed = gameChips(chipSet, 1);
    const smallest = printed[0]?.value ?? 1;
    const nextDefault = defaultName();
    if (!name || name === lastDefault) name = nextDefault;
    lastDefault = nextDefault;
    if (type === "tournament") {
      // coin chips (25¢, 50¢…) read as 25, 50… ; dollar chips play at face value
      multiplier = smallest < 1 ? 100 : 1;
      const cs = gameChips(chipSet, multiplier);
      // the host's usual stack, or one that fits this set
      stack = settings.tStack || niceBelow(maxStack(cs, expected) * 0.6);
      rebuyChips = stack;
      addOnChips = niceBelow(stack / 2);
    } else {
      multiplier = 1;
      sb = smallest;
      bb = +(smallest * 2).toFixed(2);
      // the buy-ins are the host's usual depths, in big blinds
      defaultBuyIn = +(bb * (settings.cashDepth || 100)).toFixed(2);
      minBuyIn = +(bb * (settings.cashMinBB || 40)).toFixed(2);
      maxBuyIn = +(bb * (settings.cashMaxBB || 200)).toFixed(2);
      bombAnte = +(bb * settings.cashBombBB).toFixed(2);
      sevenTwoAmount = +(bb * settings.cashSevenTwoBB).toFixed(2);
    }
  });

  function niceBelow(x: number) {
    const m = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8];
    let best = 0;
    for (let k = 0; k < 9; k++) for (const v of m) if (v * 10 ** k <= x && v * 10 ** k > best) best = v * 10 ** k;
    return best || Math.floor(x);
  }

  // regenerate the blind structure when settings change (until hand-edited)
  $effect(() => {
    if (type !== "tournament" || customized) return;
    levels = generateStructure({
      stack,
      players: expected,
      targetMinutes: hours * 60,
      levelMinutes,
      chips,
      depth,
      anteFrom,
      breakEvery,
      breakMinutes,
    });
  });

  function regenerate() {
    customized = false;
  }

  const payouts = $derived(
    payoutText.trim()
      ? payoutText
          .split(/[\s,]+/)
          .map(Number)
          .filter((n) => n > 0)
      : defaultPayouts(expected)
  );
  const payoutSum = $derived(payouts.reduce((s, p) => s + p, 0));

  // what the host switched on (Settings > Your Game) decides what's on the form.
  // anything off can still be added for just this game, and a template or rerun
  // that used it brings it along. off means off: it isn't in the game at all.
  let tonight = $state({ rake: false, cut: false, bounty: false, rebuys: false, bomb: false, sevenTwo: false, highHand: false, format: false });
  const rakeOn = $derived(settings.useRake || tonight.rake);
  const cutOn = $derived(settings.useHouseCut || tonight.cut);
  const bountyOn = $derived(settings.useBounties || tonight.bounty);
  const rebuysOn = $derived(settings.useRebuys || tonight.rebuys);
  const bombShown = $derived(settings.useBombPots || tonight.bomb);
  const sevenTwoShown = $derived(settings.useSevenTwo || tonight.sevenTwo);
  const highHandShown = $derived(settings.useHighHand || tonight.highHand);
  const satelliteShown = $derived(settings.useSatellites || tonight.format);
  const shootoutShown = $derived(settings.useShootouts || tonight.format);
  const satellite = $derived(satelliteShown && satelliteOn && seatValue > 0);
  const addable = $derived(
    (isCash
      ? [
          !rakeOn && { key: "rake", labelKey: "gameSetup.addable.rakeOrSeatFee" },
          !bombShown && { key: "bomb", labelKey: "gameSetup.cash.sides.bombPots" },
          !sevenTwoShown && { key: "sevenTwo", labelKey: "gameSetup.cash.sides.sevenTwo" },
          !highHandShown && { key: "highHand", labelKey: "gameSetup.cash.sides.highHand" },
        ]
      : [
          !rebuysOn && { key: "rebuys", labelKey: "gameSetup.addable.rebuysAddOns" },
          !bountyOn && { key: "bounty", labelKey: "gameSetup.addable.bounty" },
          !cutOn && { key: "cut", labelKey: "gameSetup.tournament.houseCut.legend" },
          !(satelliteShown && shootoutShown) && { key: "format", labelKey: "gameSetup.tournament.format.addable" },
        ]
    ).filter((x) => !!x) as { key: keyof typeof tonight; labelKey: string }[]
  );
  function addTonight(key: keyof typeof tonight) {
    tonight[key] = true;
    // a rake added for the night should rake something
    if (key === "rake" && rakeMode === "none") rakeMode = "pot";
  }

  const useFee = $derived(cutOn ? Math.max(0, fee) : 0);
  const useRakePct = $derived(cutOn ? rakePct : 0);
  const useBounty = $derived(bountyOn ? Math.max(0, Math.min(bounty, buyIn)) : 0);
  const useRebuy = $derived(rebuysOn && rebuyOn);
  const useAddOn = $derived(rebuysOn && addOnOn);
  const useRake = $derived<CashRake["mode"]>(rakeOn ? rakeMode : "none");

  const estPool = $derived(expected * Math.max(0, buyIn - useBounty - useFee) * (1 - useRakePct / 100));
  const estHouse = $derived(expected * Math.max(0, buyIn - useBounty) - estPool);
  // a satellite: how many seats that pool covers, and what's left for the next place
  const estSeats = $derived(satellite ? Math.floor(round2(estPool / seatValue)) : 0);
  const estRest = $derived(satellite ? round2(estPool - estSeats * seatValue) : 0);
  const sym = $derived(currencySymbol());
  const deepBB = $derived(bb ? Math.round(defaultBuyIn / bb) : 0); // the standard buy-in, in big blinds

  const tBreakdown = $derived(distribute(stack, chips, expected));
  const cBreakdown = $derived(distribute(defaultBuyIn, chips, cashPlayers));
  const oneBuyIn = $derived(distribute(defaultBuyIn, chips, 1));
  const buyInsCovered = $derived(
    oneBuyIn.short > 0 || !oneBuyIn.rows.length ? 0 : Math.min(...oneBuyIn.rows.map((r) => Math.floor(r.chip.count / r.n)))
  );
  const planned = $derived(plannedMinutes(levels));
  const lastPlanned = $derived(levels.filter((l) => !l.isBreak && !l.overtime).at(-1));

  const tourneySettings = (): TourneySettings => ({
    buyIn,
    stack,
    expected,
    targetMinutes: hours * 60,
    levelMinutes,
    breakEvery,
    breakMinutes,
    anteFrom,
    depth,
    rebuy: { on: useRebuy, cost: rebuyCost, chips: rebuyChips, untilLevel: rebuyUntil },
    addOn: { on: useAddOn, cost: addOnCost, chips: addOnChips },
    lateRegLevel: lateReg,
    payouts: payoutText.trim() ? payouts : [],
    rakePct: useRakePct,
    fee: useFee,
    payoutRound,
    bounty: useBounty,
    bountyKind,
    mysteryFrom: Math.max(0, Math.round(mysteryFrom || 0)),
    satellite: satellite ? { seatValue } : null,
    format: shootoutShown && shootoutOn ? "shootout" : "standard",
  });
  const cashSettings = (): CashSettings => ({
    sb,
    bb,
    straddle,
    minBuyIn,
    maxBuyIn,
    defaultBuyIn,
    plannedMinutes: cashHours * 60,
    rake: { mode: useRake, pct: rakeCashPct, cap: rakeCap, fee: seatFee },
    bomb: { on: bombShown && bombOn, ante: Math.max(0, bombAnte), doubleBoard: bombDouble, everyMinutes: Math.max(0, Math.round(bombEvery || 0)) },
    sevenTwo: { on: sevenTwoShown && sevenTwoOn, amount: Math.max(0, sevenTwoAmount) },
    highHand: { on: highHandShown && highHandOn, prize: Math.max(0, highHandPrize), everyMinutes: Math.max(0, Math.round(highHandEvery || 0)) },
  });

  // ---- templates, and "tweak and rerun" from an old game ----
  // both fill the form in; the type/chip-set defaults above must not then
  // stomp on what was loaded, so lastKey is moved first.
  interface Setup {
    chipSetId?: string;
    multiplier: number;
    notes: string;
    players: string[];
    levels?: Level[];
    tourney?: TourneySettings;
    cash?: CashSettings;
    name?: string;
  }

  function fill(x: Setup) {
    if (x.chipSetId && sets.some((s) => s.id === x.chipSetId)) chipSetId = x.chipSetId;
    lastKey = `${type}|${chipSetId}`;
    multiplier = x.multiplier;
    notes = x.notes;
    playerNames = x.players.join("\n");
    if (x.name) name = x.name;
    if (x.cash) {
      ({ sb, bb, straddle, minBuyIn, maxBuyIn, defaultBuyIn } = x.cash);
      cashHours = x.cash.plannedMinutes / 60;
      ({ mode: rakeMode, pct: rakeCashPct, cap: rakeCap, fee: seatFee } = x.cash.rake);
      if (rakeMode !== "none") tonight.rake = true;
      ({ on: bombOn, ante: bombAnte, doubleBoard: bombDouble, everyMinutes: bombEvery } = x.cash.bomb);
      ({ on: sevenTwoOn, amount: sevenTwoAmount } = x.cash.sevenTwo);
      ({ on: highHandOn, prize: highHandPrize, everyMinutes: highHandEvery } = x.cash.highHand);
      if (bombOn) tonight.bomb = true;
      if (sevenTwoOn) tonight.sevenTwo = true;
      if (highHandOn) tonight.highHand = true;
      cashPlayers = Math.max(cashPlayers, x.players.length || 0);
    }
    const ts = x.tourney;
    if (ts) {
      ({ buyIn, stack, expected, levelMinutes, breakEvery, breakMinutes, anteFrom, depth, rakePct, bounty, bountyKind, mysteryFrom, fee, payoutRound } = ts);
      hours = ts.targetMinutes / 60;
      ({ on: rebuyOn, cost: rebuyCost, chips: rebuyChips, untilLevel: rebuyUntil } = ts.rebuy);
      ({ on: addOnOn, cost: addOnCost, chips: addOnChips } = ts.addOn);
      lateReg = ts.lateRegLevel;
      payoutText = ts.payouts.join(", ");
      if (bounty) tonight.bounty = true;
      if (fee || rakePct) tonight.cut = true;
      if (ts.rebuy.on || ts.addOn.on) tonight.rebuys = true;
      satelliteOn = !!ts.satellite;
      if (ts.satellite) seatValue = ts.satellite.seatValue;
      shootoutOn = ts.format === "shootout";
      if (satelliteOn || shootoutOn) tonight.format = true;
    }
    if (x.levels?.length) {
      levels = x.levels;
      customized = true;
    } else customized = false;
  }

  /** a built-in preset only changes what makes it what it is; the rest of the form stays as it was */
  function applyPreset(p: Preset) {
    if (p.levelMinutes) levelMinutes = p.levelMinutes;
    if (p.hours) hours = p.hours;
    if (p.depth) depth = p.depth;
    if (p.breakEvery !== undefined) breakEvery = p.breakEvery;
    if (p.lateReg !== undefined) lateReg = p.lateReg;
    if (p.rebuys !== undefined) rebuyOn = p.rebuys;
    if (p.addOn !== undefined) addOnOn = p.addOn;
    if (p.expected) expected = p.expected;
    if (p.payouts) payoutText = p.payouts.join(", ");
    if (p.bountyKind) {
      bountyKind = p.bountyKind;
      if (p.bountyShare) bounty = Math.round(buyIn * p.bountyShare * 100) / 100;
      tonight.bounty = true;
    }
    customized = false;
  }

  let allTemplates = $state(getTemplates());
  const templates = $derived(allTemplates.filter((tmpl) => tmpl.type === type));
  // presets are tournament setups; a cash game only lists the host's own templates
  const presets = $derived(type === "tournament" ? PRESETS : []);
  let loadedFrom = "";
  $effect(() => {
    const tid = page.url.searchParams.get("template");
    const gid = page.url.searchParams.get("from");
    const pid = page.url.searchParams.get("preset");
    const key = `${tid}|${gid}|${pid}`;
    if (key === loadedFrom || (!tid && !gid && !pid)) return;
    loadedFrom = key;
    if (pid) {
      const p = getPreset(pid);
      if (!p || type !== "tournament") return void toast(t("gameSetup.alerts.presetGone"), "bad");
      applyPreset(p);
      toast(t("gameSetup.alerts.loadedTemplate", { name: t(`gameSetup.header.presets.${p.id}`) }), "info");
    } else if (tid) {
      const tpl = getTemplate(tid);
      if (!tpl) return void toast(t("gameSetup.alerts.templateGone"), "bad");
      fill(tpl);
      toast(t("gameSetup.alerts.loadedTemplate", { name: tpl.name }), "info");
    } else if (gid) {
      const g = getGame(gid);
      if (!g) return void toast(t("gameSetup.alerts.gameGone"), "bad");
      fill({
        chipSetId: sets.find((s) => s.name === g.chipSetName)?.id,
        multiplier: g.multiplier,
        notes: g.notes,
        players: [...new Map(g.players.map((p) => [nameKey(p.name), p.name])).values()],
        levels: g.levels,
        tourney: g.tourney,
        cash: g.cash,
        name: g.name,
      });
      if (g.house) houseName = g.house;
      if (g.leagueId && leagues.some((l) => l.id === g.leagueId && l.types.includes(type))) leagueId = g.leagueId;
      toast(t("gameSetup.alerts.copiedSetup", { name: g.name }), "info");
    }
  });

  function pickTemplate(e: Event) {
    // "preset:turbo" or "template:<id>"
    const [kind, id] = (e.target as HTMLSelectElement).value.split(":");
    (e.target as HTMLSelectElement).value = "";
    if (id) goto(`/new?type=${type}&${kind}=${id}`, { replaceState: true, noScroll: true, keepFocus: true });
  }

  let naming = $state(false);
  let templateName = $state("");
  function saveAsTemplate(e: SubmitEvent) {
    e.preventDefault();
    const label = templateName.trim();
    if (!label) return;
    const same = getTemplates().find((tmpl) => tmpl.type === type && nameKey(tmpl.name) === nameKey(label));
    if (same && !confirm(t("gameSetup.alerts.replaceTemplateConfirm", { name: same.name }))) return;
    const tmpl: Template = {
      id: same?.id ?? uid(),
      name: label,
      type,
      createdAt: Date.now(),
      chipSetId,
      multiplier,
      notes,
      players: names,
      levels: type === "tournament" && customized ? $state.snapshot(levels) : undefined,
      tourney: type === "tournament" ? tourneySettings() : undefined,
      cash: type === "cash" ? cashSettings() : undefined,
    };
    saveTemplate(tmpl);
    allTemplates = getTemplates();
    naming = false;
    templateName = "";
    toast(t("gameSetup.alerts.savedTemplate", { name: label, key: keyLabel(settings.paletteKey) }));
  }

  // regulars one click away, most games first; anyone already listed drops out
  const regulars = knownPlayers().slice(0, 16);
  const unlisted = $derived(regulars.filter((r) => !names.some((n) => nameKey(n) === nameKey(r.name))));
  function addRegular(n: string) {
    playerNames = (playerNames.trim() ? playerNames.trim() + "\n" : "") + n;
  }

  // seats won in satellites come in with their buy-in paid by the ticket
  const seatWinners = unusedSeats(getGames());
  let tickets = $state<Record<string, string>>({});
  // each satellite's winners not brought in yet
  const seatsWaiting = $derived(
    type === "tournament" ? seatWinners.map((w) => ({ ...w, winners: w.winners.filter((p) => tickets[nameKey(p.name)] !== w.game.id) })).filter((w) => w.winners.length) : []
  );
  function addWinners(from: string, winners: { name: string }[]) {
    for (const p of winners) {
      if (!names.some((n) => nameKey(n) === nameKey(p.name))) addRegular(p.name);
      tickets[nameKey(p.name)] = from;
    }
  }

  function create() {
    if (!chipSet) return alert(t("gameSetup.alerts.makeChipSetFirst"));
    if (type === "tournament" && !levels.length) return alert(t("gameSetup.alerts.structureEmpty"));
    const g = newGame({
      name: name.trim() || defaultName(),
      type,
      chipSetName: chipSet.name,
      multiplier,
      chips: $state.snapshot(chips),
      notes,
      players: names,
      levels: type === "tournament" ? $state.snapshot(levels) : [],
      tourney: type === "tournament" ? tourneySettings() : undefined,
      cash: type === "cash" ? cashSettings() : undefined,
    });
    const from = page.url.searchParams.get("from");
    if (from) g.from = from;
    if (type === "cash" && useRake !== "none") g.house = houseName.trim() || t("gameSetup.cash.rake.defaultHouseName");
    if (settings.seatsPerTable !== 9) g.seatsPerTable = settings.seatsPerTable;
    if (leagueId && leagueChoices.some((l) => l.id === leagueId)) g.leagueId = leagueId;
    for (const p of g.players) if (type === "tournament" && tickets[nameKey(p.name)]) p.ticket = tickets[nameKey(p.name)];
    // cash players named up front get the default buy-in
    saveGame(g);
    goto(`/game/${g.id}`);
  }
</script>

<svelte:head><title>{isCash ? t("gameSetup.header.titleCash") : t("gameSetup.header.titleTournament")} · PitMaster</title></svelte:head>

<div class="spread" use:pagehead>
  <h1>{isCash ? t("gameSetup.header.titleCash") : t("gameSetup.header.titleTournament")}</h1>
  <span class="row small gap-y-2 gap-x-[14px]">
    {#if naming}
      <form autocomplete="off" class="row gap-[6px]" onsubmit={saveAsTemplate} in:slide={reveal()}>
        <!-- svelte-ignore a11y_autofocus -->
        <input type="text" bind:value={templateName} placeholder={t("gameSetup.header.templateNamePlaceholder")} aria-label={t("gameSetup.header.templateNameAria")} autocomplete="off" autofocus onkeydown={(e) => e.key === "Escape" && (play("close"), (naming = false))} />
        <button>{t("common.save")}</button>
        <button type="button" class="link muted" data-sound="close" onclick={() => (naming = false)}>{t("common.cancel")}</button>
      </form>
    {:else}
      {#if presets.length || templates.length}
        <select onchange={pickTemplate} aria-label={t("gameSetup.header.loadTemplateAria")}>
          <option value="">{t("gameSetup.header.startFromOption")}</option>
          {#if templates.length}
            <optgroup label={t("gameSetup.header.yourTemplates")}>
              {#each templates as tmpl (tmpl.id)}<option value="template:{tmpl.id}">{tmpl.name}</option>{/each}
            </optgroup>
          {/if}
          {#if presets.length}
            <optgroup label={t("gameSetup.header.builtIn")}>
              {#each presets as p (p.id)}<option value="preset:{p.id}">{t(`gameSetup.header.presets.${p.id}`)}</option>{/each}
            </optgroup>
          {/if}
        </select>
      {/if}
      <button class="link" data-sound="open" onclick={() => ((naming = true), (templateName = name))}><Icon icon={Bookmark} size="1em" />{t("gameSetup.header.saveAsTemplate")}</button>
      {#if isCash}<a class="with-icon" href="/new?type=tournament">{t("gameSetup.header.switchToTournament")}<span class="flip-rtl"><Icon icon={ArrowRight} size="1em" /></span></a>{:else}<a class="with-icon" href="/new?type=cash">{t("gameSetup.header.switchToCash")}<span class="flip-rtl"><Icon icon={ArrowRight} size="1em" /></span></a>{/if}
    {/if}
  </span>
</div>

<div class="cols">
  <!-- LEFT: settings -->
  <div>
    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.basics.legend")}</legend>
      <label><span>{t("gameSetup.basics.name")}</span><input type="text" bind:value={name} style="width:100%" /></label>
      {#if leagueChoices.length}
        <label>
          <span class="links">{t("gameSetup.basics.league")} <a href="/players#leagues">{t("gameSetup.basics.editLeagues")}</a></span>
          <select bind:value={leagueId}>
            <option value="">{t("gameSetup.basics.noLeague")}</option>
            {#each leagueChoices as l (l.id)}<option value={l.id}>{l.name}</option>{/each}
          </select>
        </label>
      {/if}
      <label>
        <span class="links">{t("gameSetup.basics.chipSet")} <a href="/settings#chips">{t("gameSetup.basics.editSets")}</a></span>
        <select bind:value={chipSetId}>
          {#each sets as s (s.id)}<option value={s.id}>{s.name}{s.owned ? ` (${t("gameSetup.basics.yours")})` : ""}</option>{/each}
        </select>
      </label>
      <!-- the printed value times this is what a chip is worth in the game; the
           hint says it in chips so nobody has to do the math -->
      <label for="mult" class="m-0"><span>{t("gameSetup.basics.chipValues")}</span></label>
      <div class="row mb-[10px]">
        <select id="mult" bind:value={multiplier}>
          {#each [0.01, 0.05, 0.1, 0.25, 0.5, 1, 5, 10, 20, 25, 50, 100, 1000] as m (m)}<option value={m}>{m === 1 ? t("gameSetup.basics.asPrinted") : t("gameSetup.basics.printedTimes", { n: m })}</option>{/each}
        </select>
        {#if chips[0]}
          <span class="small muted">{t("gameSetup.basics.chipPlaysAs", { chip: chips[0].label || money(chips[0].printed), value: isCash ? money(chips[0].value) : amt(chips[0].value) })}</span>
        {/if}
      </div>
      <div class="slab mb-[10px]">
        <ChipLegend {chips} {isCash} size={44} />
      </div>
    </fieldset>

    {#if isCash}
      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
        <legend class="ruled w-full px-0">{t("gameSetup.cash.blinds.legend")}</legend>
        <div class="row">
          <label><span>{t("gameSetup.cash.blinds.smallBlind", { sym })}</span><input type="number" step="any" min="0" bind:value={sb} /></label>
          <label><span>{t("gameSetup.cash.blinds.bigBlind", { sym })}</span><input type="number" step="any" min="0" bind:value={bb} /></label>
          <label class="across"><input type="checkbox" bind:checked={straddle} /><span>{t("gameSetup.cash.blinds.straddlesAllowed")}</span></label>
        </div>
      </fieldset>
      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
        <legend class="ruled w-full px-0">{t("gameSetup.cash.buyIns.legend")}</legend>
        <div class="row">
          <label><span>{t("gameSetup.cash.buyIns.min", { sym })}</span><input type="number" step="any" min="0" bind:value={minBuyIn} /></label>
          <label><span>{t("gameSetup.cash.buyIns.standard", { sym })}</span><input type="number" step="any" min="0" bind:value={defaultBuyIn} /></label>
          <label><span>{t("gameSetup.cash.buyIns.max", { sym })}</span><input type="number" step="any" min="0" bind:value={maxBuyIn} /></label>
        </div>
        <p class="small muted">{t("gameSetup.cash.buyIns.standardBefore")}<span class="num" use:bump={deepBB}>{deepBB}</span>{t("gameSetup.cash.buyIns.standardAfter")}</p>
      </fieldset>
      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
        <legend class="ruled w-full px-0">{t("gameSetup.cash.length.legend")}</legend>
        <label>
          <span>{t("gameSetup.cash.length.playForAbout", { duration: duration(cashHours * 60) })}</span>
          <input type="range" min="0.5" max="10" step="0.5" bind:value={cashHours} style="width:100%" />
        </label>
        <p class="small muted -mt-[6px] mx-0 mb-0">{t("gameSetup.cash.length.endsAround", { time: timeOfDay(time.now + cashHours * 3600000) })}</p>
      </fieldset>
      {#if rakeOn}
      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0" transition:slide={reveal()}>
        <legend class="ruled w-full px-0">{t("gameSetup.cash.rake.legend")}{#if !settings.useRake}<button class="link small opt ml-2" data-sound="off" onclick={() => ((tonight.rake = false), (rakeMode = "none"))}>{t("gameSetup.cash.rake.remove")}</button>{/if}</legend>
        <RakeFields bind:mode={rakeMode} bind:pct={rakeCashPct} bind:cap={rakeCap} bind:fee={seatFee} bind:house={houseName} />
      </fieldset>
      {/if}
      {#if bombShown || sevenTwoShown || highHandShown}
      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0" transition:slide={reveal()}>
        <legend class="ruled w-full px-0">{t("gameSetup.cash.sides.legend")}</legend>
        {#if bombShown}
          <label class="across"><input type="checkbox" bind:checked={bombOn} /><span>{t("gameSetup.cash.sides.bombPots")}</span></label>
          {#if bombOn}
            <div class="row" transition:slide={reveal()}>
              <label><span>{t("gameSetup.cash.sides.ante", { sym })}</span><input type="number" min="0" step="any" bind:value={bombAnte} /></label>
              <label><span>{t("gameSetup.cash.sides.bombEvery")}</span><input type="number" min="0" step="1" bind:value={bombEvery} /></label>
              <label class="across"><input type="checkbox" bind:checked={bombDouble} /><span>{t("gameSetup.cash.sides.doubleBoard")}</span></label>
            </div>
          {/if}
        {/if}
        {#if sevenTwoShown}
          <label class="across"><input type="checkbox" bind:checked={sevenTwoOn} /><span>{t("gameSetup.cash.sides.sevenTwo")}</span></label>
          {#if sevenTwoOn}
            <div class="row" transition:slide={reveal()}>
              <label><span>{t("gameSetup.cash.sides.eachPays", { sym })}</span><input type="number" min="0" step="any" bind:value={sevenTwoAmount} /></label>
            </div>
          {/if}
        {/if}
        {#if highHandShown}
          <label class="across"><input type="checkbox" bind:checked={highHandOn} /><span>{t("gameSetup.cash.sides.highHand")}</span></label>
          {#if highHandOn}
            <div class="row" transition:slide={reveal()}>
              <label><span>{t("gameSetup.cash.sides.prize", { sym })}</span><input type="number" min="0" step="any" bind:value={highHandPrize} /></label>
              <label><span>{t("gameSetup.cash.sides.highHandEvery")}</span><input type="number" min="0" step="1" bind:value={highHandEvery} /></label>
            </div>
          {/if}
        {/if}
        <p class="small muted -mt-1 mx-0 mb-0">{t("gameSetup.cash.sides.note")}</p>
      </fieldset>
      {/if}
    {:else}
      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
        <legend class="ruled w-full px-0">{t("gameSetup.tournament.buyInStacks.legend")}</legend>
        <div class="row">
          <label><span>{t("gameSetup.tournament.buyInStacks.buyIn", { sym })}</span><input type="number" min="0" step="any" bind:value={buyIn} /></label>
          <label><span>{t("gameSetup.tournament.buyInStacks.startingStack")}</span><input type="number" min="1" step="any" bind:value={stack} /></label>
          <label><span>{t("gameSetup.tournament.buyInStacks.expectedPlayers")}</span><input type="number" min="2" max="100" bind:value={expected} /></label>
        </div>
        <label>
          <span>{t("gameSetup.tournament.buyInStacks.startingDepth")}</span>
          <GameSelect of="depth" bind:value={depth} />
        </label>
      </fieldset>

      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
        <legend class="ruled w-full px-0">{t("gameSetup.tournament.length.legend")}</legend>
        <label>
          <span>{t("gameSetup.tournament.length.wrapUpAbout", { duration: duration(hours * 60) })}</span>
          <input type="range" min="1" max="8" step="0.25" bind:value={hours} style="width:100%" />
        </label>
        <div class="row">
          <label>
            <span>{t("gameSetup.tournament.length.levelLength")}</span>
            <GameSelect of="level" bind:value={levelMinutes} />
          </label>
          <label><span>{t("gameSetup.tournament.length.levelsBetweenBreaks")}</span><input type="number" min="0" bind:value={breakEvery} /></label>
          <label><span>{t("gameSetup.tournament.length.breakMinutes")}</span><input type="number" min="1" bind:value={breakMinutes} /></label>
          <label><span>{t("gameSetup.tournament.length.antesFromLevel")}</span><input type="number" min="0" bind:value={anteFrom} /></label>
        </div>
      </fieldset>

      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
        <legend class="ruled w-full px-0">{[rebuysOn ? t("gameSetup.tournament.rebuys.rebuysAddOn") : "", t("gameSetup.tournament.rebuys.lateRegistration"), bountyOn ? t("gameSetup.tournament.rebuys.bounty") : ""].filter(Boolean).join(" / ")}</legend>
        {#if rebuysOn}
        <label class="across"><input type="checkbox" bind:checked={rebuyOn} /><span>{t("gameSetup.tournament.rebuys.rebuysLabel")}</span></label>
        {#if rebuyOn}
          <div class="row" transition:slide={reveal()}>
            <label><span>{t("gameSetup.tournament.rebuys.cost", { sym })}</span><input type="number" min="0" step="any" bind:value={rebuyCost} /></label>
            <label><span>{t("gameSetup.tournament.rebuys.chips")}</span><input type="number" min="0" step="any" bind:value={rebuyChips} /></label>
            <label><span>{t("gameSetup.tournament.rebuys.throughLevel")}</span><input type="number" min="1" bind:value={rebuyUntil} /></label>
          </div>
        {/if}
        <label class="across"><input type="checkbox" bind:checked={addOnOn} /><span>{t("gameSetup.tournament.rebuys.addOnLabel")}</span></label>
        {#if addOnOn}
          <div class="row" transition:slide={reveal()}>
            <label><span>{t("gameSetup.tournament.rebuys.cost", { sym })}</span><input type="number" min="0" step="any" bind:value={addOnCost} /></label>
            <label><span>{t("gameSetup.tournament.rebuys.chips")}</span><input type="number" min="0" step="any" bind:value={addOnChips} /></label>
          </div>
        {/if}
        {/if}
        <div class="row">
          <label><span>{t("gameSetup.tournament.rebuys.lateRegThroughLevel")}</span><input type="number" min="0" bind:value={lateReg} /></label>
          {#if bountyOn}<label><span>{t("gameSetup.tournament.rebuys.bountyField", { sym })}</span><input type="number" min="0" step="any" max={buyIn} bind:value={bounty} /></label>{/if}
        </div>
        {#if bountyOn && bounty > 0}
          <div class="row" transition:slide={reveal()}>
            <label>
              <span>{t("gameSetup.tournament.rebuys.bountyKind")}</span>
              <select bind:value={bountyKind}>
                <option value="flat">{t("gameSetup.tournament.rebuys.kindFlat")}</option>
                <option value="progressive">{t("gameSetup.tournament.rebuys.kindProgressive")}</option>
                <option value="mystery">{t("gameSetup.tournament.rebuys.kindMystery")}</option>
              </select>
            </label>
            {#if bountyKind === "mystery"}<label transition:slide={{ ...reveal(), axis: "x" }}><span>{t("gameSetup.tournament.rebuys.mysteryFrom")}</span><input type="number" min="0" step="1" bind:value={mysteryFrom} /></label>{/if}
          </div>
          <p class="small muted -mt-1 mx-0 mb-[10px]">{t(`gameSetup.tournament.rebuys.hint.${bountyKind}`)}</p>
        {/if}
      </fieldset>

      {#if satelliteShown || shootoutShown}
      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0" transition:slide={reveal()}>
        <legend class="ruled w-full px-0">{t("gameSetup.tournament.format.legend")}{#if tonight.format}<button class="link small opt ml-2" data-sound="off" onclick={() => ((tonight.format = false), (satelliteOn = false), (shootoutOn = false))}>{t("gameSetup.tournament.format.remove")}</button>{/if}</legend>
        {#if shootoutShown}
          <label class="across"><input type="checkbox" bind:checked={shootoutOn} /><span>{t("gameSetup.tournament.format.shootout")}</span></label>
          <p class="small muted -mt-1 mx-0 mb-[10px]">{t("gameSetup.tournament.format.shootoutHint")}</p>
        {/if}
        {#if satelliteShown}
          <label class="across"><input type="checkbox" bind:checked={satelliteOn} onchange={() => satelliteOn && !seatValue && (seatValue = buyIn * 10)} /><span>{t("gameSetup.tournament.format.satellite")}</span></label>
          {#if satelliteOn}
            <div class="row" transition:slide={reveal()}>
              <label><span>{t("gameSetup.tournament.format.seatValue", { sym })}</span><input type="number" min="0" step="any" bind:value={seatValue} /></label>
            </div>
          {/if}
          <p class="small muted -mt-1 mx-0 mb-[10px]">{t("gameSetup.tournament.format.satelliteHint")}</p>
        {/if}
      </fieldset>
      {/if}

      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
        <legend class="ruled w-full px-0">{t("gameSetup.tournament.payouts.legend")}</legend>
        {#if satellite}
        <p class="small">
          {t("gameSetup.tournament.format.seatsCaption", { n: expected, pool: money(estPool), seats: tp("gameSetup.tournament.format.seats", estSeats), value: money(seatValue) })}{#if estRest > 0.004}{" "}{t("gameSetup.tournament.format.restCaption", { amount: money(estRest) })}{/if}
        </p>
        {:else}
        <label>
          <span>{t("gameSetup.tournament.payouts.percentagesLabel")}</span>
          <input type="text" bind:value={payoutText} placeholder={defaultPayouts(expected).join(", ")} />
        </label>
        {#if payoutSum !== 100}<p class="warn small" transition:slide={reveal()}>{t("gameSetup.tournament.payouts.sumWarning", { n: payoutSum })}</p>{/if}
        <label>
          <span>{t("gameSetup.tournament.payouts.roundTo")}</span>
          <GameSelect of="round" bind:value={payoutRound} />
        </label>
        <p class="small">
          {t("gameSetup.tournament.payouts.poolCaption", { n: expected, pool: money(estPool) })}{#if useBounty || estHouse > 0.001}{" "}{t("gameSetup.tournament.payouts.poolAfter", { parts: [useBounty ? t("gameSetup.tournament.payouts.bountyPart", { amount: money(useBounty) }) : "", estHouse > 0.001 ? t("gameSetup.tournament.payouts.housePart", { amount: money(estHouse) }) : ""].filter(Boolean).join(` ${t("gameSetup.tournament.payouts.joinAnd")} `) })}{/if}:
          {#each payoutAmounts(estPool, payouts, payoutRound) as p, i (i)}<span class="num ml-2" use:bump={p}>{i + 1}. {money(p)}</span>{/each}
        </p>
        {/if}
      </fieldset>

      {#if cutOn}
      <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0" transition:slide={reveal()}>
        <legend class="ruled w-full px-0">{t("gameSetup.tournament.houseCut.legend")} <span class="small opt text-muted ml-[6px]">{t("gameSetup.tournament.houseCut.optional")}</span>{#if !settings.useHouseCut}<button class="link small opt ml-2" data-sound="off" onclick={() => (tonight.cut = false)}>{t("gameSetup.tournament.houseCut.remove")}</button>{/if}</legend>
        <HouseCutFields bind:fee bind:pct={rakePct} {buyIn} />
      </fieldset>
      {/if}
    {/if}

    {#if addable.length}
      <p class="small links -mt-2 mx-0 mb-[22px]">
        <span class="muted">{t("gameSetup.addable.caption")}</span>
        {#each addable as x (x.key)}<button class="link" data-sound="on" onclick={() => addTonight(x.key)}><Icon icon={Plus} size="1em" />{t(x.labelKey)}</button>{/each}
        <a class="muted" href="/settings#game">{t("gameSetup.addable.turnOnForEvery")}</a>
      </p>
    {/if}

    <fieldset class="border-0 mt-0 mx-0 mb-[22px] p-0 min-w-0">
      <legend class="ruled w-full px-0">{t("gameSetup.players.legend")} <span class="small opt text-muted ml-[6px]">{t("gameSetup.players.optional")}</span></legend>
      <label>
        <span>{t("gameSetup.players.namesLabel")}</span>
        <textarea bind:value={playerNames} rows="4" placeholder={t("gameSetup.players.namesPlaceholder")}></textarea>
      </label>
      {#if unlisted.length}
        <p class="small links -mt-1 mx-0 mb-[10px]">
          <span class="muted">{t("gameSetup.players.regulars")}</span>
          {#each unlisted as r (r.name)}<button class="link" data-sound="chips" onclick={() => addRegular(r.name)} title={tp("gameSetup.players.gamesCount", r.games)}><Icon icon={Plus} size="1em" />{r.name}</button>{/each}
        </p>
      {/if}
      {#if seatsWaiting.length}
        <p class="small links -mt-1 mx-0 mb-[10px]">
          <span class="muted">{t("gameSetup.players.satelliteWinners")}</span>
          {#each seatsWaiting as w (w.game.id)}
            <button class="link" data-sound="chips" onclick={() => addWinners(w.game.id, w.winners)} title={t("gameSetup.players.seatsFrom", { game: w.game.name })}><Icon icon={Plus} size="1em" />{w.winners.map((p) => p.name).join(", ")}</button>
          {/each}
        </p>
      {/if}
      {#if isCash}
        <label><span>{t("gameSetup.cash.chipMath")}</span><input type="number" min="1" bind:value={cashPlayers} /></label>
      {/if}
      <label>
        <span>{t("gameSetup.players.notesLabel")}</span>
        <textarea bind:value={notes} rows={Math.min(8, Math.max(2, notes.split("\n").length + 1))} placeholder={t("gameSetup.players.notesPlaceholder")}></textarea>
      </label>
      <p class="small links -mt-[6px] mx-0 mb-0">
        {#if houseRules().length && rulesMissing}<button class="link" data-sound="card" onclick={addHouseRules}><Icon icon={Plus} size="1em" />{t("gameSetup.players.addHouseRules")}</button>{/if}
        <a href="/settings#house">{houseRules().length ? t("gameSetup.players.editHouseRules") : t("gameSetup.players.writeHouseRules")}</a>
      </p>
    </fieldset>
  </div>

  <!-- RIGHT: live preview -->
  <div class="preview">
    {#if isCash}
      <h2>{t("gameSetup.previewCash.eachBuyInGets", { amount: money(defaultBuyIn) })}</h2>
      <div class="felt"><Breakdown breakdown={cBreakdown} isCash target={defaultBuyIn} /></div>
      <p class="small">
        {#if buyInsCovered}
          {t("gameSetup.previewCash.coversAbout", { n: buyInsCovered })}{#if buyInsCovered < cashPlayers}{" "}<span class="bad">{t("gameSetup.previewCash.fewerThan", { n: cashPlayers })}</span>{/if}
        {:else}
          <span class="bad">{t("gameSetup.previewCash.cantMake")}</span>
        {/if}
      </p>
      <hr />
      <h2>{t("gameSetup.previewCash.summary")}</h2>
      <table>
        <tbody>
          <tr><td>{t("gameSetup.previewCash.rowBlinds")}</td><td class="num">{money(sb)} / {money(bb)}{straddle ? t("gameSetup.previewCash.straddlesInline") : ""}</td></tr>
          <tr><td>{t("gameSetup.previewCash.rowBuyIn")}</td><td class="num">{money(minBuyIn)}–{money(maxBuyIn)}</td></tr>
          <tr><td>{t("gameSetup.previewCash.rowLength")}</td><td class="num">{duration(cashHours * 60)}</td></tr>
          {#if rakeOn}
            <tr>
              <td>{t("gameSetup.previewCash.rowRake")}</td>
              <td class="num">{useRake === "pot" ? t("gameSetup.previewCash.rakePct", { pct: rakeCashPct, cap: money(rakeCap) }) : useRake === "seat" ? t("gameSetup.previewCash.rakeSeat", { fee: money(seatFee) }) : t("gameSetup.previewCash.rakeNone")}</td>
            </tr>
          {/if}
        </tbody>
      </table>
    {:else}
      <h2>{t("gameSetup.previewTournament.eachPlayerStarts")}</h2>
      <div class="felt"><Breakdown breakdown={tBreakdown} target={stack} /></div>
      {#if chips.length}
        <p class="small muted">
          {t("gameSetup.previewTournament.chipMathCaption", {
            chips: amt(stack),
            bb: levels[0] ? Math.round(stack / levels[0].bb) : "?",
            n: expected,
            amount: amt(maxStack(chips, expected)),
          })}
        </p>
      {/if}
      <hr />
      <div class="spread">
        <h2>{t("gameSetup.previewTournament.blindStructure")}</h2>
        <span class="small">
          {#if customized}<button class="link" data-sound="rewind" onclick={regenerate}><Icon icon={RotateCw} size="1em" />{t("gameSetup.previewTournament.resetToAuto")}</button>{:else}<span class="muted">{t("gameSetup.previewTournament.autoEdit")}</span>{/if}
        </span>
      </div>
      <p class="small">
        {t("gameSetup.previewTournament.levelsOver", { n: levels.filter((l) => !l.isBreak && !l.overtime).length, duration: duration(planned) })}
        {#if lastPlanned}{t("gameSetup.previewTournament.endsAroundLevel", { sb: amt(lastPlanned.sb), bb: amt(lastPlanned.bb) })}{/if}
        {t("gameSetup.previewTournament.startNowTime", { time: timeOfDay(time.now + planned * 60000) })}
        {t("gameSetup.previewTournament.overtimeNote", { duration: duration(structureMinutes(levels)) })}
      </p>
      <StructureTable bind:levels {chips} editable onedit={() => (customized = true)} />
    {/if}
  </div>
</div>

<hr />
<p class="row actions justify-between">
  <button class="big" data-sound="riffle" onclick={create}>{t("gameSetup.actions.dealIt")}<span class="flip-rtl"><Icon icon={ArrowRight} /></span></button>
  <a href="/" data-sound="close">{t("common.cancel")}</a>
</p>

<style>
  /* the form runs long on a phone, so Deal It stays at the bottom of the screen */
  @media (max-width: 600px) {
    .actions {
      position: sticky;
      bottom: 0;
      z-index: 30;
      margin: 0 -16px;
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      background: var(--bg);
      border-top: var(--hair) solid var(--line);
    }
  }
  .preview {
    position: sticky;
    top: calc(var(--head, 0px) + var(--title, 0px) + 12px);
    align-self: start;
  }
  @media (max-width: 800px) {
    .preview {
      position: static;
    }
  }
</style>
