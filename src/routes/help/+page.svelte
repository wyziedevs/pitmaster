<script lang="ts">
  // everything in one place: the steps from the welcome, the tools, the keys,
  // and where your games live. it's also what search engines find.
  import DocPage from "$lib/components/DocPage.svelte";
  import HowItWorks from "$lib/components/HowItWorks.svelte";
  import KeyList from "$lib/components/KeyList.svelte";
  import Kbd from "$lib/components/Kbd.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import { goto } from "$app/navigation";
  import { settings, saveSettings } from "$lib/settings.svelte";
  import { calc, CALC_KEY } from "$lib/calcbox.svelte";
  import { keyLabel, DEFAULT_PALETTE_KEY } from "$lib/keys";
  import { play } from "$lib/sound";
  import { vault } from "$lib/lock.svelte";
  import { t } from "$lib/i18n";

  // help stays open while PitMaster is locked; the calculator doesn't
  const unlocked = $derived(vault.state === "open" || vault.state === "memory");

  const paletteKey = $derived(keyLabel(settings.paletteKey || DEFAULT_PALETTE_KEY));

  function welcomeBack() {
    settings.intro = true;
    saveSettings();
    goto("/");
  }
  function openCalc() {
    play("open");
    calc.open = true;
  }
</script>

<DocPage title={t("common.help")} sub={t("legal.help.sub")} other={{ href: "/privacy", label: t("legal.nav.privacyPolicy") }}>
  <nav class="jump links small" aria-label={t("legal.help.onThisPage")}>
    <a href="#start">{t("legal.help.nav.start")}</a>
    <a href="#dealing">{t("legal.help.nav.dealing")}</a>
    <a href="#tv">{t("legal.help.nav.tv")}</a>
    <a href="#calculator">{t("legal.help.nav.calculator")}</a>
    <a href="#keys">{t("legal.help.nav.keys")}</a>
    <a href="#data">{t("legal.help.nav.data")}</a>
  </nav>

  <section id="start">
    <h2>{t("legal.help.nav.start")}</h2>
    <HowItWorks />
    {#if !settings.intro}
      <p class="small mt-4">
        <button class="link" data-sound="open" onclick={welcomeBack}><Icon icon={Sparkles} size="1em" />{t("legal.help.start.welcomeBack")}</button>
      </p>
    {/if}
  </section>

  <section id="dealing">
    <h2>{t("legal.help.nav.dealing")}</h2>
    <h3>{t("legal.help.dealing.cashTitle")}</h3>
    <p>{t("legal.help.dealing.cashBody")}</p>
    <h3>{t("legal.help.dealing.tourneyTitle")}</h3>
    <p>{t("legal.help.dealing.tourneyBody")}</p>
    <h3>{t("legal.help.dealing.paletteTitle")}</h3>
    <p>
      {t("legal.help.dealing.paletteBody1")} <Kbd k={paletteKey} /> {t("legal.help.dealing.paletteBody2")} <kbd>{keyLabel("Mod")} Z</kbd>
      {t("legal.help.dealing.paletteBody3")}
    </p>
    <h3>{t("legal.help.dealing.everyTitle")}</h3>
    <p>
      {t("legal.help.dealing.everyBody1")}
      <a href="/settings">{t("common.settings")}</a>, {t("legal.help.dealing.everyBody2")}
    </p>
  </section>

  <section id="tv">
    <h2>{t("legal.help.nav.tv")}</h2>
    <p>
      {t("legal.help.tv.body1a")} <b>{t("legal.help.tv.openWindow")}</b> {t("legal.help.tv.body1b")}
      <b>{t("legal.help.tv.goLive")}</b>, {t("legal.help.tv.body1c")} <a href="/live">{location.host}/live</a>
      {t("legal.help.tv.body1d")}
    </p>
    <p>
      {t("legal.help.tv.body2a")} <kbd>F</kbd> {t("legal.help.tv.body2b")}
      <kbd>S</kbd> {t("legal.help.tv.body2c")}
    </p>
  </section>

  <section id="calculator">
    <h2>{t("legal.help.nav.calculator")}</h2>
    <p>
      {t("legal.help.calculator.press")} <kbd>{keyLabel(CALC_KEY)}</kbd>
      {#if unlocked}
        {t("legal.help.calculator.onAnyPageOr")} <button class="link" data-sound="none" onclick={openCalc}>{t("legal.help.calculator.openNow")}</button>.
      {:else}
        {t("legal.help.calculator.onAnyPage")}
      {/if}
      {t("legal.help.calculator.floats")}
    </p>
    <ul>
      <li>{t("legal.help.calculator.li1a")} <Kbd k="Enter" /> {t("legal.help.calculator.li1b")} <Kbd k="Esc" /> {t("legal.help.calculator.li1c")} <Kbd k="Backspace" /> {t("legal.help.calculator.li1d")}</li>
      <li>{t("legal.help.calculator.li2a")} <code>(20 + 5) × 8</code>.</li>
      <li>{t("legal.help.calculator.li3a")} <code>200 + 10%</code> {t("legal.help.calculator.li3b")}</li>
      <li>{t("legal.help.calculator.li4a")} <Kbd k="K" /> {t("legal.help.calculator.li4b")} <Kbd k="M" /> {t("legal.help.calculator.li4c")} <code>25k × 8</code>.</li>
      <li>
        {t("legal.help.calculator.li5a")} <Kbd k="Enter" />, {t("legal.help.calculator.li5b")}
      </li>
      <li>
        {t("legal.help.calculator.li6a")} <Kbd k="↑" /> {t("legal.help.calculator.li6b")} <Kbd k="↓" />
        {t("legal.help.calculator.li6c")} <b>{t("legal.help.calculator.addUp")}</b> {t("legal.help.calculator.li6d")} <b>{t("common.copy")}</b> {t("legal.help.calculator.li6e")}
      </li>
      <li><b>{t("legal.help.calculator.into")}</b> {t("legal.help.calculator.li7")}</li>
      <li><b>{t("legal.help.calculator.potKey")}</b> {t("legal.help.calculator.li9")}</li>
      <li>{t("legal.help.calculator.li8")}</li>
    </ul>
  </section>

  <section id="keys">
    <h2>{t("legal.help.nav.keys")}</h2>
    <p class="small muted">{t("legal.help.keys.note")} <a href="/settings#keys">{t("common.settings")}</a>.</p>
    <KeyList commands />
  </section>

  <section id="data">
    <h2>{t("legal.help.nav.data")}</h2>
    <h3>{t("legal.help.data.q1")}</h3>
    <p>
      {t("legal.help.data.a1a")} <a href="/settings#lock">{t("common.settings")}</a> {t("legal.help.data.a1b")}
    </p>
    <h3>{t("legal.help.data.q2")}</h3>
    <p>{t("legal.help.data.a2")}</p>
    <h3>{t("legal.help.data.q3")}</h3>
    <p>
      <a href="/settings#data">{t("legal.links.export")}</a> {t("legal.help.data.a3a")}
      <b>{t("legal.help.data.moveDevice")}</b> {t("legal.help.data.a3b")}
    </p>
    <h3>{t("legal.help.data.q4")}</h3>
    <p>{t("legal.help.data.a4")}</p>
    <h3>{t("legal.help.data.q5")}</h3>
    <p>
      {t("legal.help.data.a5a")}
      <a href="https://github.com/wyziedevs/pitmaster" target="_blank" rel="noopener">GitHub</a>.
      <a href="/privacy">{t("legal.links.privacy")}</a> {t("legal.help.data.a5b")}
    </p>
    <h3>{t("legal.help.data.q6")}</h3>
    <p>
      {t("legal.help.data.a6a")} <a href="https://wyzie.io/contact" target="_blank" rel="noopener">wyzie.io/contact</a>, {t("legal.help.data.a6b")}
      <a href="https://github.com/wyziedevs/pitmaster/issues" target="_blank" rel="noopener">GitHub</a>. {t("legal.help.data.a6c")}
    </p>
  </section>
</DocPage>

<style>
  section {
    scroll-margin-top: var(--head, 0px);
  }
</style>
