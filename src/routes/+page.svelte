<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import CalcIcon from "@lucide/svelte/icons/calculator";
  import Search from "@lucide/svelte/icons/search";
  import CircleHelp from "@lucide/svelte/icons/circle-help";
  import HardDriveDownload from "@lucide/svelte/icons/hard-drive-download";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";
  import Bookmark from "@lucide/svelte/icons/bookmark";
  import { goto } from "$app/navigation";
  import { getGames, deleteGame, getChipSet, getDefaultChipSetId, saveGame, getTemplates, onOtherTab, lastExport } from "$lib/store";
  import { vault } from "$lib/lock.svelte";
  import { rerun } from "$lib/game";
  import { headline, leaderboard } from "$lib/stats";
  import { listedKinds, offeredKinds, kind as kindOf } from "$lib/kinds";
  import { ago, amt, day, money, signed } from "$lib/util";
  import { totalCount } from "$lib/chips";
  import { calc, CALC_KEY } from "$lib/calcbox.svelte";
  import { palette } from "$lib/commands.svelte";
  import { settings } from "$lib/settings.svelte";
  import { keyLabel, DEFAULT_PALETTE_KEY } from "$lib/keys";
  import { time } from "$lib/now.svelte";
  import { toast } from "$lib/toast.svelte";
  import { t, tp } from "$lib/i18n";
  import type { Game } from "$lib/types";
  import Chip from "$lib/components/Chip.svelte";
  import Intro from "$lib/components/Intro.svelte";
  import Toys from "$lib/components/Toys.svelte";
  import { leave, reveal, slide } from "$lib/motion";
  import { fade } from "svelte/transition";
  import { play } from "$lib/sound";
  import { HOME_TITLE } from "$lib/site";

  let games = $state<Game[]>(getGames());
  const chipSet = getChipSet(getDefaultChipSetId());
  // a game running in another tab: the list keeps up with it
  $effect(() => onOtherTab(() => (games = getGames())));

  // safari, and every browser on an iphone or ipad, deletes a site's saved data
  // after seven days without a visit, unless the site's on the home screen.
  // once there are games that haven't been exported, say so
  let evictable = $state(false);
  $effect(() => {
    const ua = navigator.userAgent;
    const webkit = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|OPR|Android/.test(ua);
    const installed = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    const newest = Math.max(0, ...games.map((g) => g.updatedAt));
    if (!webkit || installed || vault.state !== "open" || !newest || newest <= lastExport()) return void (evictable = false);
    const keep = navigator.storage?.persisted?.();
    if (!keep) return void (evictable = true);
    keep.then((p) => (evictable = !p)).catch(() => (evictable = true));
  });

  const live = $derived(games.filter((g) => !g.finished));
  const done = $derived(games.filter((g) => g.finished));

  // past games: search by game or player name, filter by type, ten at a time
  let q = $state("");
  let kind = $state<string>("all");
  let showAll = $state(false);
  const found = $derived(
    done.filter((g) => {
      if (kind !== "all" && g.type !== kind) return false;
      const needle = q.trim().toLowerCase();
      return !needle || g.name.toLowerCase().includes(needle) || g.players.some((p) => p.name.toLowerCase().includes(needle));
    })
  );
  const shown = $derived(showAll ? found : found.slice(0, 10));

  // the side: ways to start fast, the chips you're playing with, who's up,
  // and the tools that aren't in the header
  const templates = getTemplates().slice(0, 4);
  // the last few different games, newest first, to run back in one click
  const recent = $derived(done.filter((g, i) => done.findIndex((x) => x.name === g.name && x.type === g.type) === i).slice(0, 3));
  const board = $derived(leaderboard(done).slice(0, 5));
  const chipCount = chipSet ? totalCount(chipSet.chips) : 0;
  const paletteKey = $derived(keyLabel(settings.paletteKey || DEFAULT_PALETTE_KEY));
  // "No games running. Start one above, or {link}." split around the inline link
  const noGamesParts = $derived(t("toys.now.empty.text").split("{link}"));

  function openCalc() {
    play("open");
    calc.open = true;
  }
  function openCommands() {
    palette.open = true;
  }

  /** what a running game is doing right now, ticking */
  function now(g: Game) {
    if (g.clock.status === "idle") return "";
    return kindOf(g.type).now(g, time.now);
  }

  function runItBack(g: Game) {
    const n = rerun(g);
    saveGame(n);
    toast(t("toys.toastRunningBack", { name: g.name }));
    goto(`/game/${n.id}`);
  }

  /** the setup in a line. a running cash game already says what's on the table, so it skips the bank */
  const summary = (g: Game, running = false) => kindOf(g.type).summary(g, running);

  function status(g: Game) {
    if (g.finished) return t("toys.now.status.finished");
    return g.clock.status === "running" ? t("toys.now.status.running") : g.clock.status === "paused" ? t("toys.now.status.paused") : t("toys.now.status.notStarted");
  }

  function remove(g: Game) {
    if (!confirm(t("toys.confirmDeleteGame", { name: g.name }))) return;
    deleteGame(g.id);
    games = getGames();
  }
</script>

<svelte:head><title>{HOME_TITLE}</title></svelte:head>

<div class="home">
<section class="hero slab pt-5 px-5 pb-[22px]">
  {#if settings.toys}<div class="fidget -mt-[6px] mx-0 mb-[6px]"><Toys /></div>{/if}
  <h1>{t("toys.hero.title")}</h1>
  <p class="mt-0 mx-0 mb-4 max-w-[60ch]">{t("toys.hero.subtitle")}</p>
  <div class="row">
    {#each offeredKinds() as k (k.id)}<a class="btn big max-[480px]:flex-[1_1_100%]" href="/new?type={k.id}"><Icon icon={Plus} />{k.newLabel()}</a>{/each}
  </div>
</section>

<section class="now">
  {#if evictable}
    <p class="warn small mt-0 mx-0 mb-[18px]" transition:slide={reveal()}>
      {t("toys.evict.text")}
      <a href="/settings#data">{t("toys.evict.exportLink")}</a>{t("toys.evict.suffix")}
    </p>
  {/if}
  <h2>{t("toys.now.heading")}</h2>
  {#if live.length}
    <ul class="list bare">
      {#each live as g (g.id)}
        <!-- the name and where it's at on top; the details and the way out underneath -->
        <li class="py-[10px] border-b-[length:var(--hair)] border-solid border-line" out:slide={leave()}>
          <div class="spread">
            <span><span class="pill">{kindOf(g.type).label()}</span> <a class="game" href="/game/{g.id}">{g.name}</a></span>
            <span class="pill" data-s={g.clock.status}>{status(g)}</span>
          </div>
          <div class="small muted mt-[2px]">
            {#if now(g)}<span class="tabular-nums">{now(g)}</span>{:else}{t("toys.now.made", { time: ago(g.createdAt) })}{/if} · {summary(g, !!now(g))}
          </div>
          <div class="small links mt-[2px]">
            <a href="/game/{g.id}/tv" target="_blank">{t("toys.now.tvView")} <Icon icon={ExternalLink} size="1em" /></a>
            <button class="link muted" data-sound="thud" onclick={() => remove(g)}>{t("common.delete")}</button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <div class="empty flex items-center gap-3">
      {#if chipSet?.chips[0]}<Chip chip={chipSet.chips[0]} size={30} />{/if}
      <p class="m-0">{noGamesParts[0]}<a href="/settings#data">{t("toys.now.empty.importLink")}</a>{noGamesParts[1]}</p>
    </div>
  {/if}
</section>

{#if done.length}
  <section class="past">
    <div class="spread">
      <h2>{t("toys.past.heading")}</h2>
      <span class="small"><a href="/players">{t("toys.past.playerStats")} <Icon icon={ArrowRight} size="1em" /></a></span>
    </div>
    <div class="row mb-2">
      <input class="w-[min(280px,100%)]" type="search" bind:value={q} placeholder={t("toys.past.searchPlaceholder")} aria-label={t("toys.past.searchAria")} />
      <select bind:value={kind} aria-label={t("toys.past.typeAria")}>
        <option value="all">{t("toys.past.allGames")}</option>
        {#each listedKinds(done.map((g) => g.type)) as k (k.id)}<option value={k.id}>{k.plural()}</option>{/each}
      </select>
      <span class="small muted">{t("toys.past.countOf", { shown: String(found.length), total: String(done.length) })}</span>
    </div>
    <table class="max-[600px]:block">
      <thead class="max-[600px]:hidden">
        <tr><th>{t("toys.past.table.date")}</th><th>{t("toys.past.table.game")}</th><th>{t("toys.past.table.result")}</th><th class="hide-sm">{t("toys.past.table.setup")}</th><th></th></tr>
      </thead>
      <tbody class="max-[600px]:block">
        {#each shown as g (g.id)}
          <!-- rows can't slide (a table row won't shrink below its text), so they fade -->
          <tr class="max-[600px]:grid max-[600px]:grid-cols-[auto_minmax(0,1fr)] max-[600px]:gap-x-[10px] max-[600px]:gap-y-[2px] max-[600px]:py-2 max-[600px]:border-b-[length:var(--hair)] max-[600px]:border-solid max-[600px]:border-line" in:fade={reveal()} out:fade={leave()}>
            <td class="mono nowrap max-[600px]:p-0 max-[600px]:border-0">{day(g.clock.startedAt ?? g.createdAt)}</td>
            <td class="max-[600px]:p-0 max-[600px]:border-0"><span class="pill">{kindOf(g.type).label()}</span> <a href="/game/{g.id}">{g.name}</a></td>
            <td class="res max-[600px]:p-0 max-[600px]:border-0 max-[600px]:col-start-2">{headline(g)}</td>
            <td class="small muted hide-sm">{summary(g)}</td>
            <td class="nowrap small acts max-[600px]:p-0 max-[600px]:border-0 max-[600px]:col-start-2">
              <span class="links">
                <button class="link" data-sound="riffle" onclick={() => runItBack(g)}>{t("toys.past.runItBack")}</button>
                <button class="link muted" data-sound="thud" onclick={() => remove(g)}>{t("common.delete")}</button>
              </span>
            </td>
          </tr>
        {:else}
          <tr class="max-[600px]:grid max-[600px]:grid-cols-[auto_minmax(0,1fr)] max-[600px]:gap-x-[10px] max-[600px]:gap-y-[2px] max-[600px]:py-2 max-[600px]:border-b-[length:var(--hair)] max-[600px]:border-solid max-[600px]:border-line"><td colspan="5" class="empty max-[600px]:p-0 max-[600px]:border-0 max-[600px]:col-span-full">{t("toys.past.table.empty")}</td></tr>
        {/each}
      </tbody>
    </table>
    {#if found.length > shown.length}
      <p class="small"><button class="link" data-sound="open" onclick={() => (showAll = true)}>{t("toys.past.showAll", { count: String(found.length) })}</button></p>
    {/if}
  </section>
{/if}

<aside class="side">
  <section>
    <h2 class="pb-[4px] mb-[2px]">{t("toys.quickStart.heading")}</h2>
    {#if templates.length || recent.length}
      <ul class="rows bare">
        {#each templates as tpl (tpl.id)}
          <li class="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 min-h-[30px] py-[2px] border-b-[length:var(--hair)] border-solid border-line">
            <span class="muted inline-flex justify-self-center" aria-hidden="true"><Icon icon={Bookmark} size="1em" /></span>
            <a class="justify-self-start max-w-full truncate text-left" href="/new?type={tpl.type}&template={tpl.id}">{tpl.name}</a>
            <span class="small muted">{kindOf(tpl.type).label()}</span>
          </li>
        {/each}
        {#each recent as g (g.id)}
          <li class="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 min-h-[30px] py-[2px] border-b-[length:var(--hair)] border-solid border-line">
            <span class="muted inline-flex justify-self-center" aria-hidden="true"><Icon icon={RotateCw} size="1em" /></span>
            <button class="link justify-self-start max-w-full truncate text-left" data-sound="riffle" title={t("toys.quickStart.runBackTitle", { name: g.name })} onclick={() => runItBack(g)}>{g.name}</button>
            <span class="small muted nowrap">{day(g.clock.startedAt ?? g.createdAt)}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty small mt-[6px] mx-0 mb-0">{t("toys.quickStart.empty")}</p>
    {/if}
  </section>

  {#if chipSet}
    <section>
      <div class="spread pb-[4px] mb-[2px]">
        <h2>{t("toys.chips.heading")}</h2>
        <a class="small" href="/settings#chips">{t("toys.chips.change")}</a>
      </div>
      <ul class="rows bare chips max-[599px]:grid max-[599px]:grid-cols-2 max-[599px]:gap-x-[18px]">
        {#each chipSet.chips as c (c.id)}
          <li class="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 min-h-[28px] py-[2px] border-b-[length:var(--hair)] border-solid border-line">
            <Chip chip={c} size={20} />
            <b class="num justify-self-start max-w-full truncate text-left">{amt(c.value)}</b>
            <span class="num muted small">×{c.count}</span>
          </li>
        {/each}
      </ul>
      <p class="small muted foot mt-[6px] mx-0 mb-0">{chipSet.name} · {tp("toys.chips.count", chipCount)}</p>
    </section>
  {/if}

  {#if board.length}
    <section>
      <div class="spread pb-[4px] mb-[2px]">
        <h2>{t("toys.players.heading")}</h2>
        <a class="small" href="/players">{t("toys.players.allStats")}</a>
      </div>
      <ol class="rows bare board">
        {#each board as p, i (p.key)}
          <li class="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 min-h-[30px] py-[2px] border-b-[length:var(--hair)] border-solid border-line">
            <span class="num muted small justify-self-center">{i + 1}</span>
            <a class="justify-self-start max-w-full truncate text-left" href="/players">{p.name}</a>
            <span class="num" class:good={p.net > 0} class:bad={p.net < 0}>{signed(p.net)}</span>
          </li>
        {/each}
      </ol>
    </section>
  {/if}

  <section>
    <h2 class="pb-[4px] mb-[2px]">{t("toys.tools.heading")}</h2>
    <ul class="rows bare tools">
      <li class="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 min-h-[30px] py-[2px] border-b-[length:var(--hair)] border-solid border-line">
        <span class="muted inline-flex justify-self-center" aria-hidden="true"><Icon icon={CalcIcon} size="1em" /></span>
        <button class="link justify-self-start max-w-full truncate text-left" data-sound="none" onclick={openCalc}>{t("toys.tools.calculator")}</button>
        <kbd class="keys-hint">{keyLabel(CALC_KEY)}</kbd>
      </li>
      <li class="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 min-h-[30px] py-[2px] border-b-[length:var(--hair)] border-solid border-line">
        <span class="muted inline-flex justify-self-center" aria-hidden="true"><Icon icon={Search} size="1em" /></span>
        <!-- the palette makes its own sound as it opens -->
        <button class="link justify-self-start max-w-full truncate text-left" data-sound="none" onclick={openCommands}>{t("toys.tools.commands")}</button>
        <kbd class="keys-hint">{paletteKey}</kbd>
      </li>
      <li class="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 min-h-[30px] py-[2px] border-b-[length:var(--hair)] border-solid border-line">
        <span class="muted inline-flex justify-self-center" aria-hidden="true"><Icon icon={HardDriveDownload} size="1em" /></span>
        <a class="justify-self-start max-w-full truncate text-left" href="/settings#data">{t("toys.tools.manageData")}</a>
      </li>
      <li class="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 min-h-[30px] py-[2px] border-b-[length:var(--hair)] border-solid border-line">
        <span class="muted inline-flex justify-self-center" aria-hidden="true"><Icon icon={CircleHelp} size="1em" /></span>
        <a class="justify-self-start max-w-full truncate text-left" href="/help">{t("toys.tools.howItWorks")}</a>
      </li>
    </ul>
  </section>
</aside>
</div>

<Intro />

<style>
  /* one column on a phone: the way in, what's running, the side, then the
     past. on a wide screen the side runs down the right the whole way */
  .home {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "hero" "now" "side" "past";
    gap: 26px;
  }
  .hero {
    grid-area: hero;
  }
  .now {
    grid-area: now;
  }
  .past {
    grid-area: past;
  }
  .side {
    grid-area: side;
    display: grid;
    align-content: start;
    gap: 22px;
  }
  /* a tablet: the side's sections sit side by side instead of stacking */
  @media (min-width: 600px) and (max-width: 899px) {
    .side {
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 22px 28px;
    }
  }
  @media (min-width: 900px) {
    .home {
      grid-template-columns: minmax(0, 1fr) 264px;
      grid-template-areas: "hero side" "now side" "past side";
      grid-template-rows: auto auto 1fr;
      gap: 26px 36px;
    }
  }
  /* the side's sections are peers of the ones beside them (h2s), set a step
     down (an h3's size) so the main column leads */
  .side h2 {
    font-size: var(--fs-lg);
  }
  /* wide enough: the toys sit beside the headline instead of over it (and
     with them turned off in Settings, the headline has the block to itself) */
  @media (min-width: 700px) {
    .hero:has(> .fidget) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      column-gap: 24px;
    }
    .hero > :global(*) {
      grid-column: 1;
    }
    .hero > .fidget {
      grid-column: 2;
      grid-row: 1 / span 3;
      align-self: center;
      margin: 0;
    }
  }
  .list .game {
    font-size: var(--fs-md);
  }
</style>
