<script lang="ts">
  // a heads-up bracket, one column a round. the dealer screen passes onpick,
  // and a match with both players in it takes a click on the winner's name
  import Icon from "./Icon.svelte";
  import Trophy from "@lucide/svelte/icons/trophy";
  import type { Game } from "$lib/types";
  import { currentRound, roundName } from "$lib/game";
  import { t } from "$lib/i18n";

  let { game, onpick, tv = false }: { game: Game; onpick?: (match: number, winner: string) => void; tv?: boolean } = $props();

  const name = (id: string | null) => (id ? (game.players.find((p) => p.id === id)?.name ?? "?") : "");
  const rounds = $derived.by(() => {
    const ms = (game.matches ?? []).map((m, i) => ({ ...m, i }));
    const n = Math.max(0, ...ms.map((m) => m.round));
    return Array.from({ length: n }, (_, r) => ms.filter((m) => m.round === r + 1).sort((a, b) => a.slot - b.slot));
  });
  const now = $derived(currentRound(game));
  const champ = $derived(game.players.find((p) => p.place === 1));
  // pairs of matches feed one match in the next round; the final stands alone
  const pairs = <T,>(xs: T[]) => (xs.length < 2 ? [xs] : Array.from({ length: xs.length / 2 }, (_, i) => xs.slice(i * 2, i * 2 + 2)));
</script>

<div class="bracket" class:tv style:--slots={rounds[0]?.length ?? 1}>
  {#each rounds as ms, r (r)}
    <div class="round" class:now={now === r + 1}>
      <span class="rname">{roundName(game, r + 1)}</span>
      <div class="col">
        {#each pairs(ms) as pair, pi (pi)}
          <div class="pair" class:single={pair.length < 2}>
            {#each pair as m (m.i)}
              {@const open = !m.winner && !!m.a && !!m.b}
              <div class="match" class:open class:first={r === 0}>
                {#each [m.a, m.b] as id, k (k)}
                  {@const won = !!m.winner && m.winner === id}
                  {@const lost = !!m.winner && !!id && m.winner !== id}
                  {#if open && onpick && id}
                    <button class="who pick" data-sound="bust" onclick={() => onpick(m.i, id)} title={t("gamePlay.bracket.pickTitle", { name: name(id) })}>{name(id)}</button>
                  {:else}
                    <span class="who" class:won class:lost class:bye={r === 0 && !id} class:tbd={r > 0 && !id}>{id ? name(id) : r === 0 ? t("gamePlay.bracket.bye") : ""}</span>
                  {/if}
                {/each}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/each}
  <div class="round champ">
    <span class="rname">{t("gamePlay.bracket.champion")}</span>
    <div class="col"><div class="pair single"><div class="match"><span class="who won">{#if champ}<Icon icon={Trophy} size="1em" /> {champ.name}{/if}</span></div></div></div>
  </div>
</div>

<style>
  .bracket {
    --gap: 22px;
    --line: var(--line-strong);
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(7.5em, 1fr);
    gap: var(--gap);
    overflow-x: auto;
    font-size: var(--fs-sm, 0.9em);
    min-height: calc(var(--slots) * 3.6em);
  }
  .round {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .rname {
    color: var(--muted);
    font-size: 0.85em;
    padding-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .now .rname {
    color: var(--fg);
    font-weight: 700;
  }
  .col {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .pair {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    position: relative;
  }
  /* the two matches of a pair join, then run on to the match they feed */
  .pair:not(.single)::after {
    content: "";
    position: absolute;
    top: 25%;
    bottom: 25%;
    right: calc(var(--gap) / -2);
    width: calc(var(--gap) / 2);
    border: var(--hair) solid var(--line);
    border-left: 0;
  }
  .match {
    position: relative;
    display: flex;
    flex-direction: column;
    border: var(--hair) solid var(--line);
    background: var(--bg);
  }
  .match:not(.first)::before,
  .champ .match::before {
    content: "";
    position: absolute;
    top: 50%;
    left: calc(var(--gap) / -2);
    width: calc(var(--gap) / 2);
    border-top: var(--hair) solid var(--line);
  }
  .match.open {
    border-color: var(--fg);
  }
  .who {
    padding: 2px 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 1.6em;
    text-align: start;
  }
  .who + .who {
    border-top: var(--hair) solid var(--line);
  }
  .pick {
    border: 0;
    border-radius: 0;
    background: transparent;
    height: auto;
    font: inherit;
    color: var(--fg);
    justify-content: flex-start;
  }
  .who.pick + .who.pick {
    border-top: var(--hair) solid var(--line);
  }
  @media (hover: hover) {
    .pick:hover {
      background: var(--block);
    }
  }
  .won {
    font-weight: 700;
  }
  .lost {
    color: var(--muted);
    text-decoration: line-through;
  }
  .bye,
  .tbd {
    color: var(--muted);
  }
  .champ .match {
    border-color: transparent;
    background: transparent;
  }

  /* on the tv: the board's colors, sized to fill the middle of the screen */
  .bracket.tv {
    --line: var(--tv-line);
    --gap: calc(var(--u) * 2.2);
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    /* each first-round match is two lines (about 3.6em with its borders), plus the round names */
    font-size: min(calc(var(--u) * 1.9), calc(88cqh / (var(--slots) * 3.6 + 2.5)));
    grid-auto-columns: minmax(0, 1fr);
  }
  .tv .rname {
    color: var(--tv-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .tv .now .rname {
    color: var(--tv-banner);
  }
  .tv .match {
    background: var(--tv-raise);
  }
  .tv .champ .match {
    background: transparent;
  }
  .tv .match.open {
    border-color: var(--tv-fg);
  }
  .tv .lost,
  .tv .bye,
  .tv .tbd {
    color: var(--tv-muted);
  }
  .tv .champ .won {
    color: var(--tv-banner);
  }
</style>
