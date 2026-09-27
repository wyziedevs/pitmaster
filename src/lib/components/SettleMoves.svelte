<script lang="ts">
  // settle-up's payments, cash or tournament: who pays who, with pay links,
  // and a Paid box on each once the host ticks them off (Settings > Your Game)
  import type { Game } from "$lib/types";
  import { settleUp, stillOwed, anyPaid, markPaid, unmarkPaid } from "$lib/settle";
  import { getHandles } from "$lib/store";
  import { settings } from "$lib/settings.svelte";
  import { money, nameKey, payLinks } from "$lib/util";
  import { play } from "$lib/sound";
  import { reveal, leave, slide } from "$lib/motion";
  import { t } from "$lib/i18n";

  let { game = $bindable(), persist }: { game: Game; persist: () => void } = $props();

  const moves = $derived(settleUp(game));
  const owed = $derived(stillOwed(game));
  // the switch, unless this game already has payments ticked off
  const ledgerOn = $derived(settings.useLedger || !!game.paid?.length);
  const handles = getHandles();
  const linksFor = (name: string, amount: number) => (settings.usePayLinks ? payLinks(handles[nameKey(name)] ?? null, amount, game.name) : []);
  const pair = (from: string, to: string) => [nameKey(from), nameKey(to)].sort().join(">");
  // what's still owed between two people once the ticked-off payments come off
  const left = (from: string, to: string) => owed.find((o) => pair(o.from, o.to) === pair(from, to)) ?? null;

  function tick(from: string, to: string, on: boolean) {
    if (on) {
      play("register");
      markPaid(game, from, to);
    } else unmarkPaid(game, from, to);
    persist();
  }
</script>

<ul class="moves" class:ticks={ledgerOn} in:slide={reveal()}>
  {#each moves as m, i (`${m.from}>${m.to}`)}
    {@const rest = left(m.from, m.to)}
    {@const done = ledgerOn && !rest && anyPaid(game, m.from, m.to)}
    {@const back = !!rest && nameKey(rest.from) !== nameKey(m.from)}
    {@const links = done ? [] : back ? linksFor(rest!.to, rest!.amount) : linksFor(m.to, rest?.amount ?? m.amount)}
    <li class="mb-1" class:done in:slide={reveal()} out:slide={leave()} style:--i={i}>
      {#if ledgerOn}<input type="checkbox" class="m-0 me-2 align-middle" checked={done} onchange={(e) => tick(m.from, m.to, e.currentTarget.checked)} aria-label={t("gamePlay.shared.markPaidAria", { from: m.from, to: m.to })} title={t("gamePlay.shared.paid")} />{/if}
      <b>{m.from}</b> {t("gamePlay.cash.pays")} <b>{m.to}</b> <span class="num amount">{money(m.amount)}</span>
      {#if done}<span class="small muted ml-2">{t("gamePlay.shared.paid")}</span>
      {:else if rest && anyPaid(game, m.from, m.to)}
        <!-- the game changed after it was paid: the rest, or what comes back when it was paid too much -->
        <span class="small text-accent ml-2">{!back ? t("gamePlay.shared.leftToPay", { amount: money(rest.amount) }) : t("gamePlay.shared.paidBack", { from: rest.from, to: rest.to, amount: money(rest.amount) })}</span>
      {/if}
      {#if links.length}<span class="small pay links ml-3">{#each links as l (l.label)}<a href={l.href} target="_blank" rel="noopener noreferrer" title={t("gamePlay.shared.payLinkTitle", { handle: l.handle, label: l.label })}>{l.label}</a>{/each}</span>{/if}
    </li>
  {/each}
</ul>

<style>
  .moves {
    padding-inline-start: 18px;
  }
  /* with Paid boxes, the box is the bullet */
  .moves.ticks {
    list-style: none;
    padding-inline-start: 0;
  }
  .done {
    color: var(--muted);
  }
  .done .amount {
    text-decoration: line-through;
  }
</style>
