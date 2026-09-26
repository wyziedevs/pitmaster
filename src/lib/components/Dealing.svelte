<script lang="ts">
  // loading: chips being stacked one at a time, then swept, then again.
  // reads as "the dealer's working", not "the page is stuck".
  import { t } from "$lib/i18n";

  let { label }: { label?: string } = $props();
  const shown = $derived(label ?? t("toys.dealing.loading"));
</script>

<span class="dealing" role="status" aria-label={shown}>
  <i style:--i="0"></i><i style:--i="1"></i><i style:--i="2"></i><i style:--i="3"></i>
</span>

<style>
  .dealing {
    display: inline-flex;
    flex-direction: column-reverse;
    width: 16px;
    height: 1em;
    justify-content: flex-start;
    vertical-align: -0.1em;
    margin-right: 4px;
  }
  i {
    display: block;
    height: 3px;
    margin-top: 1px;
    border-radius: 40% / 50%;
    /* chips seen edge-on: dark at the sides, a soft light left of center */
    background:
      linear-gradient(90deg, rgb(0 0 0 / 0.3), rgb(0 0 0 / 0) 25%, rgb(255 255 255 / 0.2) 45%, rgb(0 0 0 / 0) 65%, rgb(0 0 0 / 0.35)),
      var(--muted);
    box-shadow: 0 1px 0 rgb(0 0 0 / 0.35);
    animation: stack 1.4s var(--ease-out) infinite both;
    animation-delay: calc(var(--i) * 140ms);
  }
  i:nth-child(2) {
    background-color: var(--accent);
  }
  @keyframes stack {
    0% {
      transform: translateY(-6px);
      opacity: 0;
    }
    18%,
    70% {
      transform: none;
      opacity: 1;
    }
    88%,
    100% {
      transform: translateX(6px);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    i {
      animation: none;
      opacity: 0.8;
    }
  }
  :global(:root[data-motion="reduced"]) i {
    animation: none;
    opacity: 0.8;
  }
</style>
