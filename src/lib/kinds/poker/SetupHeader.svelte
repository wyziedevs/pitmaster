<script lang="ts">
  // the poker form's title, and its templates: start from one (or a built-in
  // preset), save this setup as one, or switch to the other type
  import Icon from "$lib/components/Icon.svelte";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Bookmark from "@lucide/svelte/icons/bookmark";
  import { goto } from "$app/navigation";
  import { pagehead } from "$lib/pagehead";
  import { getTemplates, saveTemplate } from "$lib/store";
  import { PRESETS } from "$lib/presets";
  import { nameKey, uid } from "$lib/util";
  import { toast } from "$lib/toast.svelte";
  import { reveal, slide } from "$lib/motion";
  import { play } from "$lib/sound";
  import { settings } from "$lib/settings.svelte";
  import { keyLabel } from "$lib/keys";
  import { t } from "$lib/i18n";
  import type { PokerDraft } from "./draft.svelte";

  let { draft }: { draft: PokerDraft } = $props();
  const type = $derived(draft.type);

  let allTemplates = $state(getTemplates());
  const templates = $derived(allTemplates.filter((tmpl) => tmpl.type === type));
  // presets are tournament setups; a cash game only lists the host's own templates
  const presets = $derived(draft.isCash ? [] : PRESETS);

  function pickTemplate(e: Event & { currentTarget: HTMLSelectElement }) {
    // "preset:turbo" or "template:<id>"
    const [kind, id] = e.currentTarget.value.split(":");
    e.currentTarget.value = "";
    if (id) goto(`/new?type=${type}&${kind}=${id}`, { replaceState: true, noScroll: true, keepFocus: true });
  }

  let naming = $state(false);
  let templateName = $state("");
  function saveAsTemplate(e: SubmitEvent) {
    e.preventDefault();
    const label = templateName.trim();
    if (!label) return;
    const same = getTemplates().find((tmpl) => tmpl.type === type && nameKey(tmpl.name) === nameKey(label));
    if (same && !confirm(t("gameSetup.alerts.replaceTemplateConfirm", { name: same.name }))) return;
    saveTemplate(draft.template(same?.id ?? uid(), label));
    allTemplates = getTemplates();
    naming = false;
    templateName = "";
    toast(t("gameSetup.alerts.savedTemplate", { name: label, key: keyLabel(settings.paletteKey) }));
  }
</script>

<div class="spread" use:pagehead>
  <h1>{draft.isCash ? t("gameSetup.header.titleCash") : t("gameSetup.header.titleTournament")}</h1>
  <span class="row small gap-y-2 gap-x-[14px]">
    {#if naming}
      <form autocomplete="off" class="row gap-[6px]" onsubmit={saveAsTemplate} in:slide={reveal()}>
        <!-- svelte-ignore a11y_autofocus -->
        <input type="text" bind:value={templateName} placeholder={t("gameSetup.header.templateNamePlaceholder")} aria-label={t("gameSetup.header.templateNameAria")} autocomplete="off" autofocus onkeydown={(e) => e.key === "Escape" && (play("close"), (naming = false))} />
        <button>{t("common.save")}</button>
        <button type="button" class="link muted" data-sound="close" onclick={() => (naming = false)}>{t("common.cancel")}</button>
      </form>
    {:else}
      {#if presets.length || templates.length}
        <select onchange={pickTemplate} aria-label={t("gameSetup.header.loadTemplateAria")}>
          <option value="">{t("gameSetup.header.startFromOption")}</option>
          {#if templates.length}
            <optgroup label={t("gameSetup.header.yourTemplates")}>
              {#each templates as tmpl (tmpl.id)}<option value="template:{tmpl.id}">{tmpl.name}</option>{/each}
            </optgroup>
          {/if}
          {#if presets.length}
            <optgroup label={t("gameSetup.header.builtIn")}>
              {#each presets as p (p.id)}<option value="preset:{p.id}">{t(`gameSetup.header.presets.${p.id}`)}</option>{/each}
            </optgroup>
          {/if}
        </select>
      {/if}
      <button class="link" data-sound="open" onclick={() => ((naming = true), (templateName = draft.name))}><Icon icon={Bookmark} size="1em" />{t("gameSetup.header.saveAsTemplate")}</button>
      <a class="with-icon" href="/new?type={draft.isCash ? 'tournament' : 'cash'}">{draft.isCash ? t("gameSetup.header.switchToTournament") : t("gameSetup.header.switchToCash")}<span class="flip-rtl"><Icon icon={ArrowRight} size="1em" /></span></a>
    {/if}
  </span>
</div>
