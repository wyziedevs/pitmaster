<script lang="ts">
  // a new casino night: its tables (the game, who deals, the limits), how the
  // chips finish (money, or raffle tickets and the prizes), and who's coming
  import Icon from "$lib/components/Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import RemoveButton from "$lib/components/RemoveButton.svelte";
  import SetupShell from "../SetupShell.svelte";
  import { Draft } from "../draft.svelte";
  import { settings } from "$lib/settings.svelte";
  import { currencySymbol, money } from "$lib/util";
  import type { CasinoSettings, CasinoTable, GameType } from "$lib/types";
  import { CASINO_DEFAULTS, nameFor, newTable } from "./index";
  import { TABLE_GAMES, TABLE_LIMITS } from "./engine";
  import { gameName } from "./actions";
  import { t } from "$lib/i18n";

  // (this form is only ever a casino night)
  let {}: { type: GameType } = $props();
  const draft = new Draft("casino");
  const d = draft.src?.casino ?? CASINO_DEFAULTS();
  const day = new Date().toLocaleDateString(settings.language, { weekday: "long" });
  const sym = $derived(currencySymbol());
  let tables = $state<CasinoTable[]>(d.tables.map((x) => ({ ...x, id: newTable(x.game).id })));
  let finish = $state<CasinoSettings["finish"]>(d.finish);
  let ticket = $state(d.ticket);
  let prizes = $state(d.prizes.join("\n"));
  let adding = $state<CasinoTable["game"]>("blackjack");

  const floor = $derived<CasinoSettings>({ tables, finish, ticket, prizes: [] });
  /** a new game at a table brings its usual limits */
  function regame(x: CasinoTable) {
    [x.min, x.max] = TABLE_LIMITS[x.game];
  }
  const rules = (): CasinoSettings => ({
    tables: tables.map((x) => ({ ...x, dealer: x.dealer.trim(), min: Math.max(0, x.min || 0), max: Math.max(x.min || 0, x.max || 0) })),
    finish,
    ticket: Math.max(0, ticket || 0),
    prizes: prizes
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  });
</script>

<SetupShell {draft} defaultName={`${day} ${t("casino.label")}`} fewPlayers={t("casino.setup.fewPlayers")} rules={() => ({ casino: rules() })}>
  {#snippet children()}
    <fieldset>
      <legend>{t("casino.setup.tablesLegend")}</legend>
      {#each tables as x (x.id)}
        <div class="row items-end">
          <label><span>{t("casino.setup.game")}</span>
            <select bind:value={x.game} onchange={() => regame(x)}>
              {#each TABLE_GAMES as g (g)}<option value={g}>{gameName(g)}</option>{/each}
            </select>
          </label>
          <label><span>{t("casino.setup.dealer")}</span><input type="text" class="w-[130px]" bind:value={x.dealer} placeholder={t("casino.setup.dealerPlaceholder")} /></label>
          <label><span>{t("casino.setup.min", { sym })}</span><input type="number" min="0" step="any" class="w-[80px]" bind:value={x.min} /></label>
          <label><span>{t("casino.setup.max", { sym })}</span><input type="number" min="0" step="any" class="w-[80px]" bind:value={x.max} /></label>
          <span class="mb-2"><RemoveButton label={t("casino.setup.removeTable", { name: nameFor(floor, x) })} onclick={() => (tables = tables.filter((y) => y !== x))} /></span>
        </div>
      {:else}
        <p class="small muted">{t("casino.setup.noTables")}</p>
      {/each}
      <div class="row items-end">
        <select bind:value={adding} aria-label={t("casino.setup.game")}>
          {#each TABLE_GAMES as g (g)}<option value={g}>{gameName(g)}</option>{/each}
        </select>
        <button data-sound="chips" onclick={() => tables.push(newTable(adding))}><Icon icon={Plus} />{t("casino.setup.addTable")}</button>
      </div>
      <p class="small muted">{t("casino.setup.tablesHint")}</p>
    </fieldset>

    <fieldset>
      <legend>{t("casino.setup.finishLegend")}</legend>
      <label class="across"><input type="radio" name="finish" value="money" bind:group={finish} /><span>{t("casino.setup.finishMoney")}</span></label>
      <label class="across"><input type="radio" name="finish" value="raffle" bind:group={finish} /><span>{t("casino.setup.finishRaffle")}</span></label>
      {#if finish === "raffle"}
        <div class="row mt-2">
          <label><span>{t("casino.setup.ticket", { sym })}</span><input type="number" min="0" step="any" bind:value={ticket} /></label>
        </div>
        <label>
          <span>{t("casino.setup.prizes")}</span>
          <textarea bind:value={prizes} rows="4" placeholder={t("casino.setup.prizesPlaceholder")}></textarea>
        </label>
        <p class="small muted -mt-1">{t("casino.setup.prizesHint")}</p>
      {/if}
    </fieldset>
  {/snippet}
  {#snippet preview()}
    <h2>{t("casino.setup.previewHeading")}</h2>
    <table>
      <tbody>
        {#each tables as x (x.id)}
          <tr><td>{nameFor(floor, x)}</td><td class="num">{t("casino.play.limits", { min: money(x.min || 0), max: money(x.max || 0) })}</td></tr>
        {:else}
          <tr><td class="muted">{t("casino.setup.noTables")}</td></tr>
        {/each}
      </tbody>
    </table>
    <p class="small">{finish === "raffle" ? t("casino.setup.previewRaffle", { amount: money(ticket || 0) }) : t("casino.setup.previewMoney")}</p>
  {/snippet}
</SetupShell>
