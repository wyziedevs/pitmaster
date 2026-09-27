<script lang="ts">
  import DocPage from "$lib/components/DocPage.svelte";
  import { t } from "$lib/i18n";
</script>

<DocPage title={t("legal.nav.termsOfUse")} sub={t("legal.lastUpdated")} other={{ href: "/privacy", label: t("legal.nav.privacyPolicy") }}>
  <p>
    {t("legal.terms.intro.pre")} <a href="https://pitmaster.cc">pitmaster.cc</a>. {t("legal.terms.intro.post")}
  </p>

  <h2>{t("legal.terms.what.title")}</h2>
  <p>{t("legal.terms.what.p1")}</p>

  <h2>{t("legal.terms.yourChoice.title")}</h2>
  <p>{t("legal.terms.yourChoice.p1")}</p>

  <h2>{t("legal.terms.legalGame.title")}</h2>
  <p>{t("legal.terms.legalGame.p1")}</p>
  <p>{t("legal.terms.legalGame.p2")}</p>
  <p>{t("legal.terms.legalGame.p3")}</p>

  <h2>{t("legal.terms.data.title")}</h2>
  <p>
    {t("legal.terms.data.p1")} <a href="/privacy">{t("legal.links.privacy")}</a>{t("legal.terms.data.p2")}
    <a href="/settings#data">{t("legal.links.export")}</a> {t("legal.terms.data.p3")}
  </p>

  <h2>{t("legal.terms.math.title")}</h2>
  <p>{t("legal.terms.math.p1")}</p>

  <h2>{t("legal.terms.fair.title")}</h2>
  <p>{t("legal.terms.fair.p1")}</p>

  <h2>{t("legal.terms.code.title")}</h2>
  <p>
    {t("legal.terms.code.p1pre")} <a href="https://github.com/wyziedevs/pitmaster" target="_blank" rel="noopener">github.com/wyziedevs/pitmaster</a>
    {t("legal.terms.code.p1mid")} <a href="https://github.com/wyziedevs/pitmaster/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a>{t(
      "legal.terms.code.p1post",
    )}
  </p>

  <h2>{t("legal.terms.trademarks.title")}</h2>
  <p>{t("legal.terms.trademarks.p1")}</p>

  <h2>{t("legal.terms.warranty.title")}</h2>
  <p>{t("legal.terms.warranty.p1")}</p>

  <h2>{t("legal.terms.liability.title")}</h2>
  <p>{t("legal.terms.liability.p1")}</p>

  <h2>{t("legal.terms.indemnity.title")}</h2>
  <p>{t("legal.terms.indemnity.p1")}</p>

  <h2>{t("legal.terms.rest.title")}</h2>
  <p>
    {t("legal.terms.rest.p1pre")} <a href="/privacy">{t("legal.nav.privacyPolicy")}</a> {t("legal.terms.rest.p1post")}
  </p>

  <h2>{t("legal.changesTitle")}</h2>
  <p>{t("legal.terms.changes.p1")}</p>

  <h2>{t("legal.contactTitle")}</h2>
  <p>{t("legal.terms.contact.p1pre")} <a href="https://wyzie.io/contact" target="_blank" rel="noopener">wyzie.io/contact</a>.</p>
</DocPage>
