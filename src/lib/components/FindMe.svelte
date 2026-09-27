<script lang="ts">
  // on a phone following the game: type your name to see your seat, your
  // bounty and where you stand. it only reads the snapshot the tv already
  // has, and what's typed stays on this page (nothing is saved or sent).
  import type { Game } from "$lib/types";
  import { kind } from "$lib/kinds";
  import type { Line } from "$lib/kinds/kind";
  import { duration, nameKey, ordinal } from "$lib/util";
  import { time } from "$lib/now.svelte";
  import { t } from "$lib/i18n";

  let { game }: { game: Game } = $props();

  let q = $state("");
  const key = $derived(nameKey(q));

  // players first, then whoever's waiting for a seat; a name typed in full wins outright
  type Found = { id: string; name: string; player?: Game["players"][number]; waiting?: number };
  const everyone = $derived<Found[]>([
    ...game.players.map((p) => ({ id: p.id, name: p.name, player: p })),
    ...(game.waitlist ?? []).map((w, i) => ({ id: w.id, name: w.name, waiting: i })),
  ]);
  const matches = $derived.by(() => {
    if (!key) return [];
    const exact = everyone.filter((f) => nameKey(f.name) === key);
    if (exact.length) return exact;
    const starts = everyone.filter((f) => nameKey(f.name).startsWith(key));
    return starts.length ? starts : everyone.filter((f) => nameKey(f.name).includes(key));
  });
  const me = $derived(matches.length === 1 ? matches[0] : null);

  function lines(f: Found): Line[] {
    const p = f.player;
    if (!p) {
      const w = game.waitlist![f.waiting!];
      return [{ text: t("tv.find.waiting", { place: ordinal(f.waiting! + 1) }), tone: "good" }, { text: t("tv.find.waited", { time: duration(Math.max(1, (time.now - w.at) / 60000)) }) }];
    }
    // what there is to say about them depends on the kind of game
    return withLeague(kind(game.type).find(game, p), p.name);
  }

  // a league game: where they stand in it, if they're on the board the host sent
  function withLeague(out: Line[], name: string) {
    const rows = game.league?.rows ?? [];
    const i = rows.findIndex((r) => nameKey(r.name) === nameKey(name));
    if (i >= 0) out.push({ text: t("tv.find.league", { place: ordinal(i + 1), name: game.league!.name, points: String(rows[i].points) }) });
    return out;
  }
</script>

<section class="find">
  <label class="fk" for="find-me">{t("tv.find.heading")}</label>
  <input id="find-me" type="search" bind:value={q} placeholder={t("tv.find.placeholder")} autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="search" />
  {#if me}
    <div class="card" aria-live="polite">
      <b class="who">{me.name}</b>
      {#each lines(me) as l, i (i)}<span class:good={l.tone === "good"} class:hot={l.tone === "hot"}>{l.text}</span>{/each}
    </div>
  {:else if matches.length > 1}
    <div class="pick">
      <span class="fk">{t("tv.find.which")}</span>
      {#each matches.slice(0, 8) as m (m.id)}<button onclick={() => (q = m.name)}>{m.name}</button>{/each}
    </div>
  {:else if key}
    <p class="none">{t("tv.find.noMatch")}</p>
  {/if}
</section>

<style>
  .find {
    grid-area: find;
    border-top: var(--hair) solid var(--tv-line);
    padding: 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 17px;
  }
  .fk {
    display: block;
    color: var(--tv-muted);
    font-size: 14px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin: 0;
  }
  input {
    width: 100%;
    font-size: 17px;
    background: var(--tv-bg);
    color: var(--tv-fg);
    border-color: var(--tv-line);
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .who {
    font: 26px / 1.15 var(--font-serif);
    letter-spacing: -0.01em;
    margin-bottom: 2px;
  }
  .good {
    color: var(--tv-good);
    font-weight: 700;
  }
  .hot {
    color: var(--tv-hot);
    font-weight: 700;
  }
  .pick {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .pick .fk {
    flex-basis: 100%;
  }
  .none {
    margin: 0;
    color: var(--tv-muted);
  }
</style>
