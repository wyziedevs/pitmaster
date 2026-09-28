<script lang="ts">
  // one New Game button on the home page; a click opens every kind the host
  // plays (the ones switched on in Settings) to pick from. escape, a click
  // anywhere else or picking one closes it.
  import Icon from "./Icon.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import { offeredKinds } from "$lib/kinds";
  import { fade } from "svelte/transition";
  import { leave, reveal } from "$lib/motion";
  import { t } from "$lib/i18n";

  let open = $state(false);
  let box = $state<HTMLElement>();

  function outside(e: Event) {
    if (open && !box?.contains(e.target as Node)) open = false;
  }
  function keys(e: KeyboardEvent) {
    if (!open) return;
    const items = [...(box?.querySelectorAll<HTMLElement>(".menu a") ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      open = false;
      box?.querySelector("button")?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      items[(at + step + items.length) % items.length]?.focus();
    }
  }
</script>

<svelte:window onclick={outside} onkeydown={keys} />

<div class="relative inline-block max-[480px]:flex-[1_1_100%]" bind:this={box}>
  <button
    class="big w-full"
    data-sound={open ? "close" : "open"}
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls="new-game-menu"
    onclick={() => (open = !open)}
  >
    <Icon icon={Plus} />{t("toys.hero.newGame")}<Icon icon={ChevronDown} size="1em" />
  </button>
  {#if open}
    <div
      id="new-game-menu"
      role="menu"
      class="menu absolute left-0 top-[calc(100%_+_var(--hair))] z-[60] flex flex-col min-w-full w-max py-[6px] px-0 bg-bg border-[length:var(--hair)] border-solid border-line"
      in:fade={reveal()}
      out:fade={leave()}
    >
      {#each offeredKinds() as k (k.id)}
        <a role="menuitem" class="py-[9px] px-3.5 no-underline whitespace-nowrap text-fg hover:bg-block active:bg-block-2 focus-visible:bg-block" href="/new?type={k.id}" data-sound="open">{k.label()}</a>
      {/each}
    </div>
  {/if}
</div>
