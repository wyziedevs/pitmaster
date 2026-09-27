<script lang="ts">
  // on a phone following the game: type your name to see your seat, your
  // bounty and where you stand. it only reads the snapshot the tv already
  // has, and what's typed stays on this page (nothing is saved or sent).
  import type { Game } from "$lib/types";
  import { bountyBook, koCount, paidFor, tableCounts, tourneyStats } from "$lib/game";
  import { duration, money, nameKey, ordinal } from "$lib/util";
  import { prefs } from "$lib/settings.svelte";
  import { time } from "$lib/now.svelte";
  import { t, tp } from "$lib/i18n";

  let { game }: { game: Game } = $props();

  let q = $state("");
  const key = $derived(nameKey(q));
  const showMoney = $derived(prefs().tvMoney !== false);
  const isCash = $derived(game.type === "cash");
  const stats = $derived(!isCash && game.tourney ? tourneyStats(game) : null);
  const tables = $derived(tableCounts(game).length);

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

  function lines(f: Found): { text: string; tone?: "good" | "hot" }[] {
    const p = f.player;
    if (!p) {
      const w = game.waitlist![f.waiting!];
      return [{ text: t("tv.find.waiting", { place: ordinal(f.waiting! + 1) }), tone: "good" }, { text: t("tv.find.waited", { time: duration(Math.max(1, (time.now - w.at) / 60000)) }) }];
    }
    const out: { text: string; tone?: "good" | "hot" }[] = [];
    const seatText = p.seat ? (tables > 1 ? t("tv.find.tableSeat", { table: String(p.seat.table), seat: String(p.seat.seat) }) : t("tv.find.seat", { seat: String(p.seat.seat) })) : "";
    if (isCash) {
      if (p.cashOut === null) {
        out.push({ text: seatText || t("tv.find.playing"), tone: "good" });
        if (showMoney) out.push({ text: t("tv.find.inFor", { amount: money(p.cashIn) }) });
      } else out.push({ text: showMoney ? t("tv.find.cashedOutFor", { amount: money(p.cashOut) }) : t("tv.find.cashedOut") });
      return out;
    }
    const s = stats!;
    const seatWon = !!p.place && p.place <= s.seats;
    if (p.place === 1 && !seatWon) out.push({ text: t("tv.find.winner"), tone: "good" });
    else if (seatWon) out.push({ text: t("tv.find.wonSeat"), tone: "good" });
    else if (p.out) out.push({ text: t("tv.find.outIn", { place: ordinal(p.place ?? 0) }), tone: "hot" });
    else {
      out.push({ text: seatText || (tables ? t("tv.find.noSeat") : t("tv.find.stillIn")), tone: "good" });
      out.push({ text: tp("tv.find.left", s.left) });
    }
    // what they took home, once they finished in the money
    const won = p.place && !seatWon ? paidFor(game, p.id, p.place, s.payouts) : 0;
    if (showMoney && won > 0) out.push({ text: t("tv.find.won", { amount: money(won) }), tone: "good" });
    const kind = game.tourney!.bounty ? game.tourney!.bountyKind : null;
    if (!p.out && showMoney && kind === "progressive") out.push({ text: t("tv.find.bountyOn", { amount: money(bountyBook(game).head[p.id] ?? 0) }) });
    else if (!p.out && showMoney && kind === "flat") out.push({ text: t("tv.find.bountyOn", { amount: money(game.tourney!.bounty) }) });
    const kos = koCount(game, p.id);
    if (kos) out.push({ text: tp("tv.find.knockouts", kos) });
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
