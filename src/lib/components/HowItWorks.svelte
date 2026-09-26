<script lang="ts">
  // the four steps from nothing to a game on the tv. the welcome on a first
  // visit (Intro.svelte) and the help page both show them.
  import Icon from "./Icon.svelte";
  import Coins from "@lucide/svelte/icons/coins";
  import Timer from "@lucide/svelte/icons/timer";
  import Tv from "@lucide/svelte/icons/tv";
  import Smartphone from "@lucide/svelte/icons/smartphone";
  import { t } from "$lib/i18n";

  /** deal: the steps come in one after another, like cards */
  let { deal = false }: { deal?: boolean } = $props();
</script>

<ol class="steps" class:deal>
  <li style:--i={0}>
    <span class="tile" aria-hidden="true"><Icon icon={Coins} /></span>
    <div>
      <b>{t("nav.howItWorks.step1Title")}</b>
      <p>{t("nav.howItWorks.step1Prefix")} <a href="/settings#chips">{t("nav.howItWorks.step1LinkText")}</a>{t("nav.howItWorks.step1Suffix")}</p>
    </div>
  </li>
  <li style:--i={1}>
    <span class="tile" aria-hidden="true"><Icon icon={Timer} /></span>
    <div>
      <b>{t("nav.howItWorks.step2Title")}</b>
      <p>{t("nav.howItWorks.step2Prefix")} <a href="/new?type=cash">{t("nav.howItWorks.step2CashGame")}</a> {t("nav.howItWorks.step2Mid")} <a href="/new?type=tournament">{t("nav.howItWorks.step2Tournament")}</a> {t("nav.howItWorks.step2Suffix")}</p>
    </div>
  </li>
  <li style:--i={2}>
    <span class="tile" aria-hidden="true"><Icon icon={Tv} /></span>
    <div>
      <b>{t("nav.howItWorks.step3Title")}</b>
      <p>{t("nav.howItWorks.step3Prefix")} <b>{t("nav.howItWorks.step3OpenTv")}</b> {t("nav.howItWorks.step3Mid")} <b>{t("nav.howItWorks.step3GoLive")}</b>{t("nav.howItWorks.step3CodeMid")} <code>{location.host}/live</code> {t("nav.howItWorks.step3CodeSuffix")}</p>
    </div>
  </li>
  <li style:--i={3}>
    <span class="tile" aria-hidden="true"><Icon icon={Smartphone} /></span>
    <div>
      <b>{t("nav.howItWorks.step4Title")}</b>
      <p>{t("nav.howItWorks.step4Body")}</p>
    </div>
  </li>
</ol>

<style>
  .steps {
    list-style: none;
    counter-reset: step;
    display: grid;
    gap: 14px;
    margin: 0;
    padding: 0;
  }
  li {
    counter-increment: step;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }
  /* the step's icon in a square, its number tucked into the corner */
  .tile {
    position: relative;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: var(--hair) solid var(--line-strong);
    background: var(--field);
    font-size: 17px;
  }
  .tile::after {
    content: counter(step);
    position: absolute;
    right: -7px;
    bottom: -7px;
    display: grid;
    place-items: center;
    width: 17px;
    height: 17px;
    font: bold var(--fs-xs) / 1 var(--font-mono);
    background: var(--fg);
    color: var(--bg);
  }
  b {
    display: block;
  }
  p {
    margin: 2px 0 0;
    max-width: 62ch;
  }
  p b {
    display: inline;
  }
  /* dealt in, one after another, then the icon gives a little nod. (its own
     name: app.css has a "dealt" of its own for the seat labels) */
  .deal li {
    animation: step-in 460ms var(--ease-out-expo) calc(160ms + var(--i) * 90ms) backwards;
  }
  .deal .tile {
    animation: nod var(--dur-settle) var(--ease-out-expo) calc(380ms + var(--i) * 90ms) backwards;
  }
  @keyframes step-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  @keyframes nod {
    from {
      transform: rotate(-14deg) scale(0.8);
    }
  }
</style>
