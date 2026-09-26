<script lang="ts">
  // every keyboard shortcut in one list, for Help and Settings. `commands`
  // puts the rebindable Commands key first, the way it's set right now.
  import Kbd from "./Kbd.svelte";
  import { settings } from "$lib/settings.svelte";
  import { keyLabel, FIXED_KEYS, DEFAULT_PALETTE_KEY } from "$lib/keys";
  import { t } from "$lib/i18n";

  let { commands = false, class: cls = "" }: { commands?: boolean; class?: string } = $props();

  // FIXED_KEYS (keys.ts) is fixed order: calculator, clock, levels, undo,
  // fullscreen, sound. Its own "what" text is English only, so the label
  // shown here is looked up by position instead, and only the key combo
  // (untranslated: keyboard symbols) comes from FIXED_KEYS itself.
  const fixedLabels = $derived([
    t("gamePlay.keys.calculator"),
    t("gamePlay.keys.clockShortcut"),
    t("gamePlay.keys.levelsShortcut"),
    t("gamePlay.keys.undoShortcut"),
    t("gamePlay.keys.fullscreenShortcut"),
    t("gamePlay.keys.soundShortcut"),
  ]);
  const translatedFixed = $derived<[string, string][]>(FIXED_KEYS.map((pair, i) => [pair[0], fixedLabels[i] ?? pair[1]]));
  const keys = $derived<[string, string][]>(
    commands ? [[keyLabel(settings.paletteKey || DEFAULT_PALETTE_KEY), t("gamePlay.keys.openCommands")], ...translatedFixed] : translatedFixed
  );
</script>

<dl class="keylist {cls} grid grid-cols-[auto_minmax(0,1fr)] gap-y-1.5 gap-x-3 items-center m-0">
  {#each keys as [k, what] (k)}<dt class="m-0 justify-self-start"><Kbd {k} /></dt><dd class="m-0">{what}</dd>{/each}
</dl>
