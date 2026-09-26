<script lang="ts">
  import DocPage from "$lib/components/DocPage.svelte";
  import { t } from "$lib/i18n";
</script>

<DocPage title={t("legal.links.privacy")} sub={t("legal.lastUpdated")} other={{ href: "/terms", label: t("legal.nav.termsOfUse") }}>
  <p>
    {t("legal.privacy.intro.pre")}<a href="https://pitmaster.cc">pitmaster.cc</a>{t("legal.privacy.intro.post")}
  </p>

  <div class="slab short">
    <b>{t("legal.privacy.short.title")}</b>
    <ul>
      <li>{t("legal.privacy.short.li1")}</li>
      <li>{t("legal.privacy.short.li2")}</li>
      <li>{t("legal.privacy.short.li3")}</li>
      <li>{t("legal.privacy.short.li4")}</li>
      <li>
        {t("legal.privacy.short.li5pre")}
        <a href="https://github.com/wyziedevs/pitmaster" target="_blank" rel="noopener">GitHub</a>, {t("legal.privacy.short.li5post")}
      </li>
    </ul>
  </div>

  <h2>{t("legal.privacy.onDevice.title")}</h2>
  <p>{t("legal.privacy.onDevice.lead")}</p>
  <ul>
    <li>{t("legal.privacy.onDevice.li1")}</li>
    <li>{t("legal.privacy.onDevice.li2")}</li>
    <li>{t("legal.privacy.onDevice.li3")}</li>
    <li>{t("legal.privacy.onDevice.li4")}</li>
  </ul>
  <p>{t("legal.privacy.onDevice.p1")}</p>
  <p>{t("legal.privacy.onDevice.p2")}</p>
  <p>{t("legal.privacy.onDevice.p3")}</p>
  <p>{t("legal.privacy.onDevice.p4")}</p>
  <p>
    {t("legal.privacy.onDevice.p5pre")}<a href="/settings#lock">{t("legal.privacy.onDevice.passcodeLinkText")}</a>{t(
      "legal.privacy.onDevice.p5post",
    )}
  </p>
  <p>
    {t("legal.privacy.onDevice.p6pre")}<a href="/settings#data">{t("legal.privacy.onDevice.exportImportLinkText")}</a>,
    {t("legal.privacy.onDevice.p6mid")}
  </p>

  <h2>{t("legal.privacy.exports.title")}</h2>
  <p>{t("legal.privacy.exports.p1")}</p>
  <p>{t("legal.privacy.exports.p2")}</p>

  <h2 id="tv">{t("legal.privacy.tv.title")}</h2>
  <p>{t("legal.privacy.tv.p1")}</p>
  <p>{t("legal.privacy.tv.p2")}</p>
  <ul>
    <li>{t("legal.privacy.tv.li1")}</li>
    <li>{t("legal.privacy.tv.li2")}</li>
    <li>{t("legal.privacy.tv.li3")}</li>
    <li>{t("legal.privacy.tv.li4")}</li>
    <li>{t("legal.privacy.tv.li5")}</li>
  </ul>
  <p>{t("legal.privacy.tv.p3")}</p>

  <h2>{t("legal.privacy.protected.title")}</h2>
  <ul>
    <li>{t("legal.privacy.protected.li1")}</li>
    <li>{t("legal.privacy.protected.li2")}</li>
    <li>{t("legal.privacy.protected.li3")}</li>
    <li>{t("legal.privacy.protected.li4")}</li>
    <li>{t("legal.privacy.protected.li5")}</li>
  </ul>
  <p>{t("legal.privacy.protected.p1")}</p>

  <h2>{t("legal.privacy.host.title")}</h2>
  <p>
    {t("legal.privacy.host.p1pre")}
    <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">{t("legal.privacy.host.linkText")}</a>. {t(
      "legal.privacy.host.p1post",
    )}
  </p>

  <h2>{t("legal.privacy.other.title")}</h2>
  <ul>
    <li>{t("legal.privacy.other.li1")}</li>
    <li>{t("legal.privacy.other.li2")}</li>
    <li>{t("legal.privacy.other.li3")}</li>
  </ul>

  <h2>{t("legal.privacy.choices.title")}</h2>
  <ul>
    <li>{t("legal.privacy.choices.li1pre")} <a href="/settings#data">{t("common.settings")}</a>, {t("legal.privacy.choices.li1post")}</li>
    <li>{t("legal.privacy.choices.li2")}</li>
    <li>{t("legal.privacy.choices.li3")}</li>
  </ul>

  <h2>{t("legal.privacy.children.title")}</h2>
  <p>{t("legal.privacy.children.p1")}</p>

  <h2>{t("legal.changesTitle")}</h2>
  <p>{t("legal.privacy.changes.p1")}</p>

  <h2>{t("legal.contactTitle")}</h2>
  <p>{t("legal.privacy.contact.p1pre")} <a href="https://wyzie.io/contact" target="_blank" rel="noopener">wyzie.io/contact</a>.</p>
</DocPage>
