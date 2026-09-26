<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { pagehead } from "$lib/pagehead";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";
  import Bookmark from "@lucide/svelte/icons/bookmark";
  import Plus from "@lucide/svelte/icons/plus";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { getChipSets, getDefaultChipSetId, saveGame, getTemplates, getTemplate, saveTemplate, getGame, knownPlayers } from "$lib/store";
  import { gameChips, distribute, maxStack } from "$lib/chips";
  import { generateStructure, defaultPayouts, payoutAmounts, plannedMinutes, structureMinutes } from "$lib/blinds";
  import { newGame } from "$lib/game";
  import type { CashRake, CashSettings, GameType, Level, Template, TourneySettings } from "$lib/types";
  import { amt, currencySymbol, duration, money, nameKey, timeOfDay, uid } from "$lib/util";
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

  const type = $derived<GameType>(page.url.searchParams.get("type") === "tournament" ? "tournament" : "cash");
  const isCash = $derived(type === "cash");

  const sets = getChipSets();
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  // "Friday Cash Game": the day, not "night", since plenty of games run in the afternoon
  const defaultName = () => `${day} ${type === "cash" ? "Cash Game" : "Tournament"}`;

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
  let levels = $state<Level[]>([]);
  let customized = $state(false);

  // sensible defaults whenever the type / chip set changes
  let lastKey = "";
  $effect(() => {
    const key = `${type}|${chipSetId}`;
    if (key === lastKey || !chipSet) return;
    lastKey = key;
    const printed = gameChips(chipSet, 1);
    const smallest = printed[0]?.value ?? 1;
    if (!name || /^\w+day (cash game|tournament)$/i.test(name)) name = defaultName();
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
  let tonight = $state({ rake: false, cut: false, bounty: false, rebuys: false });
  const rakeOn = $derived(settings.useRake || tonight.rake);
  const cutOn = $derived(settings.useHouseCut || tonight.cut);
  const bountyOn = $derived(settings.useBounties || tonight.bounty);
  const rebuysOn = $derived(settings.useRebuys || tonight.rebuys);
  const addable = $derived(
    (isCash
      ? [!rakeOn && { key: "rake", label: "Rake or Seat Fee" }]
      : [!rebuysOn && { key: "rebuys", label: "Rebuys & Add-Ons" }, !bountyOn && { key: "bounty", label: "Bounty" }, !cutOn && { key: "cut", label: "House Cut" }]
    ).filter((x) => !!x) as { key: keyof typeof tonight; label: string }[]
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
      cashPlayers = Math.max(cashPlayers, x.players.length || 0);
    }
    const t = x.tourney;
    if (t) {
      ({ buyIn, stack, expected, levelMinutes, breakEvery, breakMinutes, anteFrom, depth, rakePct, bounty, fee, payoutRound } = t);
      hours = t.targetMinutes / 60;
      ({ on: rebuyOn, cost: rebuyCost, chips: rebuyChips, untilLevel: rebuyUntil } = t.rebuy);
      ({ on: addOnOn, cost: addOnCost, chips: addOnChips } = t.addOn);
      lateReg = t.lateRegLevel;
      payoutText = t.payouts.join(", ");
      if (bounty) tonight.bounty = true;
      if (fee || rakePct) tonight.cut = true;
      if (t.rebuy.on || t.addOn.on) tonight.rebuys = true;
    }
    if (x.levels?.length) {
      levels = x.levels;
      customized = true;
    } else customized = false;
  }

  let allTemplates = $state(getTemplates());
  const templates = $derived(allTemplates.filter((t) => t.type === type));
  let loadedFrom = "";
  $effect(() => {
    const tid = page.url.searchParams.get("template");
    const gid = page.url.searchParams.get("from");
    const key = `${tid}|${gid}`;
    if (key === loadedFrom || (!tid && !gid)) return;
    loadedFrom = key;
    if (tid) {
      const t = getTemplate(tid);
      if (!t) return void toast("That template no longer exists", "bad");
      fill(t);
      toast(`Loaded “${t.name}”`, "info");
    } else if (gid) {
      const g = getGame(gid);
      if (!g) return void toast("That game no longer exists", "bad");
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
      toast(`Copied the setup from “${g.name}”. Change what you need, then deal.`, "info");
    }
  });

  function pickTemplate(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    (e.target as HTMLSelectElement).value = "";
    if (id) goto(`/new?type=${type}&template=${id}`, { replaceState: true, noScroll: true, keepFocus: true });
  }

  let naming = $state(false);
  let templateName = $state("");
  function saveAsTemplate(e: SubmitEvent) {
    e.preventDefault();
    const label = templateName.trim();
    if (!label) return;
    const same = getTemplates().find((t) => t.type === type && nameKey(t.name) === nameKey(label));
    if (same && !confirm(`Replace the template “${same.name}”?`)) return;
    const t: Template = {
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
    saveTemplate(t);
    allTemplates = getTemplates();
    naming = false;
    templateName = "";
    toast(`Saved “${label}”. It's in the template list and Commands (${keyLabel(settings.paletteKey)}).`);
  }

  // regulars one click away, most games first; anyone already listed drops out
  const regulars = knownPlayers().slice(0, 16);
  const unlisted = $derived(regulars.filter((r) => !names.some((n) => nameKey(n) === nameKey(r.name))));
  function addRegular(n: string) {
    playerNames = (playerNames.trim() ? playerNames.trim() + "\n" : "") + n;
  }

  function create() {
    if (!chipSet) return alert("Make a chip set first");
    if (type === "tournament" && !levels.length) return alert("The blind structure is empty");
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
    if (type === "cash" && useRake !== "none") g.house = houseName.trim() || "The House";
    if (settings.seatsPerTable !== 9) g.seatsPerTable = settings.seatsPerTable;
    // cash players named up front get the default buy-in
    saveGame(g);
    goto(`/game/${g.id}`);
  }
</script>

<svelte:head><title>New {isCash ? "Cash Game" : "Tournament"} · PitMaster</title></svelte:head>

<div class="spread" use:pagehead>
  <h1>New {isCash ? "Cash Game" : "Tournament"}</h1>
  <span class="row small head-tools">
    {#if naming}
      <form autocomplete="off" class="row" onsubmit={saveAsTemplate} in:slide={reveal()}>
        <!-- svelte-ignore a11y_autofocus -->
        <input type="text" bind:value={templateName} placeholder="Template Name" aria-label="Template name" autocomplete="off" autofocus onkeydown={(e) => e.key === "Escape" && (play("close"), (naming = false))} />
        <button>Save</button>
        <button type="button" class="link muted" data-sound="close" onclick={() => (naming = false)}>Cancel</button>
      </form>
    {:else}
      {#if templates.length}
        <select onchange={pickTemplate} aria-label="Load a template">
          <option value="">Load a Template…</option>
          {#each templates as t (t.id)}<option value={t.id}>{t.name}</option>{/each}
        </select>
      {/if}
      <button class="link" data-sound="open" onclick={() => ((naming = true), (templateName = name))}><Icon icon={Bookmark} size="1em" />Save as Template</button>
      {#if isCash}<a class="with-icon" href="/new?type=tournament">Switch to Tournament<Icon icon={ArrowRight} size="1em" /></a>{:else}<a class="with-icon" href="/new?type=cash">Switch to Cash Game<Icon icon={ArrowRight} size="1em" /></a>{/if}
    {/if}
  </span>
</div>

<div class="cols">
  <!-- LEFT: settings -->
  <div>
    <fieldset>
      <legend class="ruled">The Basics</legend>
      <label><span>Name</span><input type="text" bind:value={name} style="width:100%" /></label>
      <label>
        <span class="links">Chip Set <a href="/settings#chips">Edit Sets</a></span>
        <select bind:value={chipSetId}>
          {#each sets as s (s.id)}<option value={s.id}>{s.name}{s.owned ? " (Yours)" : ""}</option>{/each}
        </select>
      </label>
      <!-- the printed value times this is what a chip is worth in the game; the
           hint says it in chips so nobody has to do the math -->
      <label for="mult" class="mult-l"><span>Chip Values</span></label>
      <div class="row mult">
        <select id="mult" bind:value={multiplier}>
          {#each [0.01, 0.05, 0.1, 0.25, 0.5, 1, 5, 10, 20, 25, 50, 100, 1000] as m (m)}<option value={m}>{m === 1 ? "As Printed" : `Printed ×${m}`}</option>{/each}
        </select>
        {#if chips[0]}
          <span class="small muted">A {chips[0].label || money(chips[0].printed)} chip plays as <b class="num">{isCash ? money(chips[0].value) : amt(chips[0].value)}</b></span>
        {/if}
      </div>
      <div class="block legend-box">
        <ChipLegend {chips} {isCash} size={44} />
      </div>
    </fieldset>

    {#if isCash}
      <fieldset>
        <legend class="ruled">Blinds</legend>
        <div class="row">
          <label><span>Small Blind {sym}</span><input type="number" step="any" min="0" bind:value={sb} /></label>
          <label><span>Big Blind {sym}</span><input type="number" step="any" min="0" bind:value={bb} /></label>
          <label class="inline"><input type="checkbox" bind:checked={straddle} /><span>Straddles Allowed</span></label>
        </div>
      </fieldset>
      <fieldset>
        <legend class="ruled">Buy-Ins</legend>
        <div class="row">
          <label><span>Min {sym}</span><input type="number" step="any" min="0" bind:value={minBuyIn} /></label>
          <label><span>Standard {sym}</span><input type="number" step="any" min="0" bind:value={defaultBuyIn} /></label>
          <label><span>Max {sym}</span><input type="number" step="any" min="0" bind:value={maxBuyIn} /></label>
        </div>
        <p class="small muted">Standard buy-in = <span class="num" use:bump={deepBB}>{deepBB}</span> big blinds.</p>
      </fieldset>
      <fieldset>
        <legend class="ruled">Length</legend>
        <label>
          <span>Play for About <b>{duration(cashHours * 60)}</b></span>
          <input type="range" min="0.5" max="10" step="0.5" bind:value={cashHours} style="width:100%" />
        </label>
        <p class="small muted under">Ends around {timeOfDay(time.now + cashHours * 3600000)} if you start now.</p>
      </fieldset>
      {#if rakeOn}
      <fieldset transition:slide={reveal()}>
        <legend class="ruled">Rake{#if !settings.useRake}<button class="link small opt" data-sound="off" onclick={() => ((tonight.rake = false), (rakeMode = "none"))}>Remove</button>{/if}</legend>
        <RakeFields bind:mode={rakeMode} bind:pct={rakeCashPct} bind:cap={rakeCap} bind:fee={seatFee} bind:house={houseName} />
      </fieldset>
      {/if}
    {:else}
      <fieldset>
        <legend class="ruled">Buy-In + Stacks</legend>
        <div class="row">
          <label><span>Buy-In {sym}</span><input type="number" min="0" step="any" bind:value={buyIn} /></label>
          <label><span>Starting Stack</span><input type="number" min="1" step="any" bind:value={stack} /></label>
          <label><span>Expected Players</span><input type="number" min="2" max="100" bind:value={expected} /></label>
        </div>
        <label>
          <span>Starting Depth</span>
          <GameSelect of="depth" bind:value={depth} />
        </label>
      </fieldset>

      <fieldset>
        <legend class="ruled">Length</legend>
        <label>
          <span>Wrap Up in About <b>{duration(hours * 60)}</b></span>
          <input type="range" min="1" max="8" step="0.25" bind:value={hours} style="width:100%" />
        </label>
        <div class="row">
          <label>
            <span>Level Length</span>
            <GameSelect of="level" bind:value={levelMinutes} />
          </label>
          <label><span>Levels Between Breaks (0 = None)</span><input type="number" min="0" bind:value={breakEvery} /></label>
          <label><span>Break Minutes</span><input type="number" min="1" bind:value={breakMinutes} /></label>
          <label><span>Antes From Level (0 = None)</span><input type="number" min="0" bind:value={anteFrom} /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend class="ruled">{[rebuysOn ? "Rebuys & Add-On" : "", "Late Registration", bountyOn ? "Bounty" : ""].filter(Boolean).join(" / ")}</legend>
        {#if rebuysOn}
        <label class="inline"><input type="checkbox" bind:checked={rebuyOn} /><span>Rebuys</span></label>
        {#if rebuyOn}
          <div class="row" transition:slide={reveal()}>
            <label><span>Cost {sym}</span><input type="number" min="0" step="any" bind:value={rebuyCost} /></label>
            <label><span>Chips</span><input type="number" min="0" step="any" bind:value={rebuyChips} /></label>
            <label><span>Through Level</span><input type="number" min="1" bind:value={rebuyUntil} /></label>
          </div>
        {/if}
        <label class="inline"><input type="checkbox" bind:checked={addOnOn} /><span>Add-On (At the First Break)</span></label>
        {#if addOnOn}
          <div class="row" transition:slide={reveal()}>
            <label><span>Cost {sym}</span><input type="number" min="0" step="any" bind:value={addOnCost} /></label>
            <label><span>Chips</span><input type="number" min="0" step="any" bind:value={addOnChips} /></label>
          </div>
        {/if}
        {/if}
        <div class="row">
          <label><span>Late Registration Through Level</span><input type="number" min="0" bind:value={lateReg} /></label>
          {#if bountyOn}<label><span>Bounty {sym} (Part of the Buy-In, 0 = None)</span><input type="number" min="0" step="any" max={buyIn} bind:value={bounty} /></label>{/if}
        </div>
      </fieldset>

      <fieldset>
        <legend class="ruled">Payouts</legend>
        <label>
          <span>Percentages, 1st Place First (Blank = Auto)</span>
          <input type="text" bind:value={payoutText} placeholder={defaultPayouts(expected).join(", ")} />
        </label>
        {#if payoutSum !== 100}<p class="warn small" transition:slide={reveal()}>Adds up to {payoutSum}%, not 100%</p>{/if}
        <label>
          <span>Round Payouts To</span>
          <GameSelect of="round" bind:value={payoutRound} />
        </label>
        <p class="small">
          With {expected} players the pool is ~<b>{money(estPool)}</b>{#if useBounty || estHouse > 0.001}{" "}(after {[useBounty ? `${money(useBounty)} a head in bounties` : "", estHouse > 0.001 ? `${money(estHouse)} to the house` : ""].filter(Boolean).join(" and ")}){/if}:
          {#each payoutAmounts(estPool, payouts, payoutRound) as p, i (i)}<span class="payout num" use:bump={p}>{i + 1}. {money(p)}</span>{/each}
        </p>
      </fieldset>

      {#if cutOn}
      <fieldset transition:slide={reveal()}>
        <legend class="ruled">House Cut <span class="small opt">Optional</span>{#if !settings.useHouseCut}<button class="link small opt" data-sound="off" onclick={() => (tonight.cut = false)}>Remove</button>{/if}</legend>
        <HouseCutFields bind:fee bind:pct={rakePct} {buyIn} />
      </fieldset>
      {/if}
    {/if}

    {#if addable.length}
      <p class="small links tonight">
        <span class="muted">Also for This Game:</span>
        {#each addable as x (x.key)}<button class="link" data-sound="on" onclick={() => addTonight(x.key)}><Icon icon={Plus} size="1em" />{x.label}</button>{/each}
        <a class="muted" href="/settings#game">Turn On for Every Game</a>
      </p>
    {/if}

    <fieldset>
      <legend class="ruled">Players <span class="small opt">Optional, or Add Them Later</span></legend>
      <label>
        <span>Names, One per Line or Split by Commas</span>
        <textarea bind:value={playerNames} rows="4" placeholder="Alex, Sam, Jordan"></textarea>
      </label>
      {#if unlisted.length}
        <p class="small links regulars">
          <span class="muted">Regulars:</span>
          {#each unlisted as r (r.name)}<button class="link" data-sound="chips" onclick={() => addRegular(r.name)} title="{r.games} game{r.games > 1 ? 's' : ''}"><Icon icon={Plus} size="1em" />{r.name}</button>{/each}
        </p>
      {/if}
      {#if isCash}
        <label><span>How Many Players for Chip Math</span><input type="number" min="1" bind:value={cashPlayers} /></label>
      {/if}
      <label>
        <span>House Rules / Notes, One per Line (Shown on the TV)</span>
        <textarea bind:value={notes} rows={Math.min(8, Math.max(2, notes.split("\n").length + 1))} placeholder="No string bets. One player to a hand. Cards stay on the table."></textarea>
      </label>
      <p class="small rules-l links">
        {#if houseRules().length && rulesMissing}<button class="link" data-sound="card" onclick={addHouseRules}><Icon icon={Plus} size="1em" />Add the House Rules</button>{/if}
        <a href="/settings#house">{houseRules().length ? "Edit" : "Write"} Your House Rules</a>
      </p>
    </fieldset>
  </div>

  <!-- RIGHT: live preview -->
  <div class="preview">
    {#if isCash}
      <h2>Each Buy-In ({money(defaultBuyIn)}) Gets</h2>
      <div class="felt"><Breakdown breakdown={cBreakdown} isCash target={defaultBuyIn} /></div>
      <p class="small">
        {#if buyInsCovered}
          This set covers about <b>{buyInsCovered}</b> standard buy-ins in all{#if buyInsCovered < cashPlayers}{" "}<span class="bad">(fewer than {cashPlayers} players). You'll run short.</span>{/if}
        {:else}
          <span class="bad">Can't make that buy-in from this set.</span>
        {/if}
      </p>
      <hr />
      <h2>Summary</h2>
      <table>
        <tbody>
          <tr><td>Blinds</td><td class="num">{money(sb)} / {money(bb)}{straddle ? " (straddles allowed)" : ""}</td></tr>
          <tr><td>Buy-In</td><td class="num">{money(minBuyIn)}–{money(maxBuyIn)}</td></tr>
          <tr><td>Length</td><td class="num">{duration(cashHours * 60)}</td></tr>
          {#if rakeOn}
            <tr>
              <td>Rake</td>
              <td class="num">{useRake === "pot" ? `${rakeCashPct}% up to ${money(rakeCap)}` : useRake === "seat" ? `${money(seatFee)} a seat` : "None"}</td>
            </tr>
          {/if}
        </tbody>
      </table>
    {:else}
      <h2>Each Player Starts With</h2>
      <div class="felt"><Breakdown breakdown={tBreakdown} target={stack} /></div>
      {#if chips.length}
        <p class="small muted">
          {amt(stack)} chips = {levels[0] ? Math.round(stack / levels[0].bb) : "?"} big blinds at level 1.
          Biggest even stack for {expected} players ≈ {amt(maxStack(chips, expected))}.
        </p>
      {/if}
      <hr />
      <div class="spread">
        <h2>Blind Structure</h2>
        <span class="small">
          {#if customized}<button class="link" data-sound="rewind" onclick={regenerate}><Icon icon={RotateCw} size="1em" />Reset to Auto</button>{:else}<span class="muted">Auto · Edit Any Cell to Change It</span>{/if}
        </span>
      </div>
      <p class="small">
        {levels.filter((l) => !l.isBreak && !l.overtime).length} levels over <b>{duration(planned)}</b>
        {#if lastPlanned}(ends around {amt(lastPlanned.sb)}/{amt(lastPlanned.bb)}){/if}
        · ~{timeOfDay(time.now + planned * 60000)} if you start now.
        Overtime levels (italic) are there in case it runs long. Total with overtime: {duration(structureMinutes(levels))}.
      </p>
      <StructureTable bind:levels {chips} editable onedit={() => (customized = true)} />
    {/if}
  </div>
</div>

<hr />
<p class="row actions">
  <button class="big" data-sound="riffle" onclick={create}>Deal It<Icon icon={ArrowRight} /></button>
  <a href="/" data-sound="close">Cancel</a>
</p>

<style>
  /* each group is a bold heading and its fields, no box around it */
  fieldset {
    border: 0;
    margin: 0 0 22px;
    padding: 0;
    min-width: 0;
  }
  /* its name is a subhead like the h3s elsewhere: bold, on its rule (.ruled) */
  legend {
    width: 100%;
    padding-inline: 0;
    font-size: 15px;
    font-weight: bold;
    line-height: 1.2;
  }
  .legend-box {
    margin-bottom: 10px;
  }
  .mult-l {
    margin: 0;
  }
  .mult {
    margin-bottom: 10px;
  }
  legend .opt {
    font-weight: normal;
    color: var(--muted);
    margin-left: 6px;
  }
  legend button.opt {
    margin-left: 8px;
  }
  .payout {
    margin-left: 8px;
  }
  .actions {
    justify-content: space-between;
  }
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
  .head-tools {
    gap: 8px 14px;
  }
  .head-tools form {
    gap: 6px;
  }
  /* a line that belongs to the field above it sits up close to it */
  .rules-l,
  .under {
    margin: -6px 0 0;
  }
  .tonight {
    margin: -8px 0 22px;
  }
  .regulars {
    margin: -4px 0 10px;
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
