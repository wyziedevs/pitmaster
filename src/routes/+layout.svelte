<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import { onNavigate, afterNavigate } from "$app/navigation";
  import Toasts from "$lib/components/Toasts.svelte";
  import LockScreen from "$lib/components/LockScreen.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Lock from "@lucide/svelte/icons/lock";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import CalcIcon from "@lucide/svelte/icons/calculator";
  import { fade } from "svelte/transition";
  import { reveal, leave, revealTheme, slide } from "$lib/motion";
  import {
    applyTheme,
    saveSettings,
    settings,
    resolvedTheme,
  } from "$lib/settings.svelte";
  import { goto } from "$app/navigation";
  import { provide, palette } from "$lib/commands.svelte";
  import { getGames, getTemplates, knownPlayers, exportAll } from "$lib/store";
  import { vault, lockNow, watchIdle, forgetAll } from "$lib/lock.svelte";
  import { hooks, noKeeper } from "$lib/vault";
  import { play, detent, type UiSound } from "$lib/sound";
  import { pageTransition } from "$lib/motion";
  import { pressToy, hoverToy } from "$lib/toys";
  import { download } from "$lib/util";
  import { toast } from "$lib/toast.svelte";
  import { calc, closeCalculator, CALC_KEY } from "$lib/calcbox.svelte";
  import { keyLabel } from "$lib/keys";
  import type { Component } from "svelte";

  let { children } = $props();

  // the command palette and the calculator aren't needed to draw a page, so
  // they come down just after it's up (their own keys work from then on), or
  // at once if something opens one first
  let floaters = $state.raw<[Component, Component] | null>(null);
  let fetching = false;
  function fetchFloaters() {
    if (fetching) return;
    fetching = true;
    Promise.all([import("$lib/components/Palette.svelte"), import("$lib/components/Calculator.svelte")]).then(
      ([p, c]) => (floaters = [p.default, c.default]),
      () => (fetching = false),
    );
  }
  $effect(() => {
    if (palette.open || calc.open) fetchFloaters();
  });
  $effect(() => {
    // the tv never shows either
    if (bare || !readable) return;
    const idle = window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 400));
    idle(fetchFloaters);
  });
  applyTheme();

  // tv screens get the whole viewport, no site chrome. they're never locked
  // (they hold no key, see lock.svelte.ts) and nothing on them edits anything.
  const bare = $derived(page.url.pathname.endsWith("/tv"));
  // pages with nothing saved on them stay open while locked
  const unlockedPage = $derived(bare || ["/live", "/help", "/privacy", "/terms"].includes(page.url.pathname));
  // what's saved can be read (in memory only, on plain http)
  const readable = $derived(vault.state === "open" || vault.state === "memory");

  // lock after the auto-lock time with no input (tv windows don't count or lock)
  $effect(() => {
    if (!bare && vault.state === "open" && vault.passcode) return watchIdle();
  });

  // saves failing: said once, then a banner that stays until one gets through
  let saveTrouble = $state(false);
  hooks.failed = () => {
    saveTrouble = true;
    toast("Couldn't save. This browser may be out of space, or blocking site storage.", "bad");
  };
  hooks.recovered = () => {
    saveTrouble = false;
    toast("Saved. Everything's caught up.");
  };

  // saved data this browser's key can't open: only the host can decide to let it go
  function discard() {
    if (!confirm("Delete the saved data this browser can't open, and start fresh? This can't be undone.")) return;
    forgetAll();
  }

  const links = [
    { href: "/", label: "Games" },
    { href: "/players", label: "Players" },
    { href: "/live", label: "TV View" },
    { href: "/settings", label: "Settings" },
  ];
  // not in the header, but still a few keys away in Commands
  const shortcuts = [
    { href: "/new?type=cash", label: "New Cash Game", keywords: "start ring" },
    { href: "/new?type=tournament", label: "New Tournament", keywords: "start mtt sng" },
    { href: "/settings#chips", label: "Chip Sets", keywords: "chips edit colors values denominations" },
    { href: "/help", label: "Help", keywords: "how it works guide faq shortcuts keys question" },
  ];

  // every name that's played here, for autocomplete on "Player name" boxes.
  // re-read on each page change so new faces show up next time.
  const regulars = $derived.by(() => {
    void page.url.pathname;
    return bare || !readable ? [] : knownPlayers();
  });

  // the palette's everywhere commands: pages, open games, templates, toggles.
  // games and templates are read when the palette asks, so they're never stale.
  $effect(() =>
    provide("site", () => [
      ...[...links, ...shortcuts].map((l) => ({
        id: `go:${l.href}`,
        label: l.label,
        group: "Go To",
        keywords: `page open ${"keywords" in l ? l.keywords : ""}`,
        run: () => goto(l.href),
      })),
      ...getGames()
        .filter((g) => !g.finished)
        .map((g) => ({
          id: `game:${g.id}`,
          label: g.name,
          group: "Games in Progress",
          keywords: g.type,
          run: () => goto(`/game/${g.id}`),
        })),
      ...getTemplates().map((t) => ({
        id: `tpl:${t.id}`,
        label: `New from “${t.name}”`,
        group: "Templates",
        keywords: `template ${t.type}`,
        run: () => goto(`/new?type=${t.type}&template=${t.id}`),
      })),
      {
        id: "theme",
        label: resolvedTheme() === "dark" ? "Light Theme" : "Dark Theme",
        group: "Settings",
        keywords: "theme dark light mode",
        // the same circular wipe as Settings, out from the middle of the screen
        run: () => {
          play("swish");
          revealTheme(
            () => {
              settings.theme = resolvedTheme() === "dark" ? "light" : "dark";
              saveSettings();
            },
            innerWidth / 2,
            innerHeight / 2,
          );
        },
      },
      {
        id: "rake",
        label: settings.useRake
          ? "Turn Cash Game Rake Off"
          : "Turn Cash Game Rake On",
        group: "Settings",
        keywords: "rake seat fee house cut",
        run: () => {
          settings.useRake = !settings.useRake;
          play(settings.useRake ? "on" : "off");
          if (settings.useRake && settings.cashRakeMode === "none")
            settings.cashRakeMode = "pot";
          saveSettings();
          toast(
            settings.useRake
              ? "New cash games take a rake"
              : "No rake on new cash games",
            "info",
          );
        },
      },
      {
        id: "cut",
        label: settings.useHouseCut
          ? "Turn Tournament House Cut Off"
          : "Turn Tournament House Cut On",
        group: "Settings",
        keywords: "rake fee house cut tournament buy-in",
        run: () => {
          settings.useHouseCut = !settings.useHouseCut;
          play(settings.useHouseCut ? "on" : "off");
          saveSettings();
          toast(
            settings.useHouseCut
              ? "New tournaments take a house cut"
              : "No house cut on new tournaments",
            "info",
          );
        },
      },
      {
        id: "export",
        label: "Export Everything",
        group: "Your Data",
        keywords: "backup download save move laptop computer device file",
        run: () => {
          download(
            `pitmaster-${new Date().toLocaleDateString("en-CA")}.json`,
            exportAll({ ...settings }),
            "application/json",
          );
          toast("Exported. On the other device, open it with Import.");
        },
      },
      ...(vault.passcode
        ? [
            {
              id: "lock",
              label: "Lock PitMaster Now",
              group: "Your Data",
              keywords: "passcode lock away secure hide",
              run: () => (play("lock"), lockNow()),
            },
          ]
        : []),
      {
        id: "import",
        label: "Import From a File",
        group: "Your Data",
        keywords: "restore backup upload move laptop computer device",
        run: () => goto("/settings#data"),
      },
      {
        id: "calc",
        label: calc.open ? "Close Calculator" : "Open Calculator",
        group: "Tools",
        keywords: "calculator math add sum total split divide",
        hint: keyLabel(CALC_KEY),
        run: toggleCalc,
      },
      {
        id: "sounds",
        label: settings.sounds
          ? "Turn Interface Sounds Off"
          : "Turn Interface Sounds On",
        group: "Settings",
        keywords: "mute sound audio",
        run: () => {
          settings.sounds = !settings.sounds;
          saveSettings();
          if (settings.sounds) play("chips");
        },
      },
    ]),
  );
  function toggleCalc() {
    play(calc.open ? "close" : "open");
    if (calc.open) closeCalculator();
    else calc.open = true;
  }

  const here = $derived(page.url.pathname + page.url.search);
  const current = (href: string) =>
    href === "/" ? page.url.pathname === "/" : here.startsWith(href);

  // ---------- the tabs: one line, never wrapped ----------
  // whatever doesn't fit folds, from the right, into the … menu. every tab is
  // measured once in a hidden row, so the count that fits is plain arithmetic
  // on the nav's width.
  const TAB_GAP = 16;
  const lockable = $derived(vault.passcode && vault.state === "open");
  let navW = $state(0);
  let ruler = $state<HTMLElement>();
  let linkW = $state<number[]>([]);
  let lockW = $state(0);
  let moreW = $state(0);

  function measure() {
    if (!ruler) return;
    const w = [...ruler.children].map((c) => Math.ceil(c.getBoundingClientRect().width));
    linkW = w.slice(0, links.length);
    [lockW, moreW] = w.slice(links.length);
  }
  $effect(() => {
    void ruler;
    measure();
    document.fonts?.ready.then(measure);
  });

  // how many tabs fit (the lock button counts as the last tab)
  const shown = $derived.by(() => {
    const w = lockable ? [...linkW, lockW] : linkW;
    if (!navW || !moreW || w.length < links.length) return links.length + (lockable ? 1 : 0);
    const row = (n: number) => w.slice(0, n).reduce((a, x) => a + x, 0) + TAB_GAP * Math.max(0, n - 1);
    if (row(w.length) <= navW) return w.length;
    let n = w.length;
    while (n > 0 && row(n) + TAB_GAP + moreW > navW) n--;
    return n;
  });
  const tabLinks = $derived(links.slice(0, shown));
  const foldedLinks = $derived(links.slice(shown));
  const lockTab = $derived(lockable && shown > links.length);
  const folded = $derived(foldedLinks.length > 0 || (lockable && !lockTab));
  const foldedCurrent = $derived(foldedLinks.some((l) => current(l.href)));

  let menuOpen = $state(false);
  let more = $state<HTMLElement>();
  // a new page, or room for every tab again, closes it
  $effect(() => {
    void page.url.href;
    menuOpen = false;
  });
  $effect(() => {
    if (!folded) menuOpen = false;
  });
  function closeMenu(e: Event) {
    if (menuOpen && !more?.contains(e.target as Node)) menuOpen = false;
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Escape" || !menuOpen) return;
    menuOpen = false;
    more?.querySelector("button")?.focus();
  }

  // the header sticks to the top; publish its height so anchors and other
  // sticky panels can sit just below it (it grows when the tabs wrap)
  let headH = $state(0);
  $effect(() => {
    document.documentElement.style.setProperty(
      "--head",
      `${bare ? 0 : headH}px`,
    );
  });

  onNavigate((nav) => {
    if (nav.from?.url.href === nav.to?.url.href) return;
    return pageTransition(nav.complete);
  });
  // a link to a section of another page (Settings > Chip Sets) lands on it at
  // once: a smooth scroll gets cut short when the new page swaps in. jumps
  // within a page stay smooth. on a fresh load the page only draws once the
  // saved data opens, so it waits for the section to turn up.
  function landOn(hash: string) {
    const id = decodeURIComponent(hash.slice(1));
    const land = () => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "instant" });
      return !!el;
    };
    if (land()) return;
    // it may be a while (a passcode to type first), so it waits until the
    // section turns up or the host goes somewhere else
    const want = location.pathname + location.hash;
    const watch = new MutationObserver(() => {
      if (location.pathname + location.hash !== want || land()) watch.disconnect();
    });
    watch.observe(document.body, { childList: true, subtree: true });
  }
  if (location.hash) landOn(location.hash);
  afterNavigate(({ from, to }) => {
    if (from && to?.url.hash && from.url.pathname !== to.url.pathname) landOn(to.url.hash);
  });

  // ---------- tactile sound, wired once for the whole site ----------
  // buttons click on the way down (like a key), not on release, and links
  // tick lightly. anything can pick its own sound with data-sound="chips"
  // (etc.) or opt out with "none".
  const PRESSABLE = "button, .btn, a[href], [data-sound]";

  function soundFor(el: HTMLElement): UiSound | null {
    const s = el.dataset.sound;
    if (s === "none") return null;
    if (s) return s as UiSound;
    if (el.matches(".link, a:not(.btn)")) return "soft";
    return el.matches(".big") ? "thock" : "tap";
  }

  function press(target: EventTarget | null) {
    const el = (target as Element | null)?.closest?.<HTMLElement>(PRESSABLE);
    if (!el || el.matches(":disabled")) return;
    const s = soundFor(el);
    if (s) play(s);
  }

  // anything that isn't a control might be a chip or a stack to play with
  function onPointerDown(e: PointerEvent) {
    closeMenu(e);
    if (e.button !== 0) return;
    press(e.target);
    pressToy(e);
  }

  // keyboard activation arrives as a click with no pointer detail
  function onClick(e: MouseEvent) {
    if (e.detail === 0) press(e.target);
  }

  function onChange(e: Event) {
    const t = e.target as HTMLInputElement;
    if (t.type === "checkbox" || t.type === "radio")
      play(t.checked ? "on" : "off");
    else if (t.tagName === "SELECT") play("soft");
  }

  // range sliders tick like a ratchet as they cross each step
  function onInput(e: Event) {
    const t = e.target as HTMLInputElement;
    if (t.type !== "range") return;
    const min = Number(t.min) || 0;
    const max = Number(t.max) || 100;
    detent((Number(t.value) - min) / (max - min || 1));
  }

  // iOS only shows :active on touch when something listens for touches
  function onTouchStart() {}

  /** after a crash on a tv: try drawing it again every few seconds */
  function retry(_: HTMLElement, reset: (() => void) | null) {
    const t = reset && setInterval(reset, 5000);
    return { destroy: () => t && clearInterval(t) };
  }
</script>

<svelte:document
  onpointerdown={onPointerDown}
  onpointerover={hoverToy}
  onkeydown={onKeyDown}
  onclick={onClick}
  onchange={onChange}
  oninput={onInput}
  ontouchstart={onTouchStart}
/>

<!-- a page that breaks while drawing gets this instead of a blank screen.
     what's saved is untouched (saves happen before anything is drawn). a tv
     tries again by itself: nobody's at it to press anything -->
{#snippet crashed(_: unknown, reset: () => void)}
  <div class="crash" class:wrap={bare} use:retry={bare ? reset : null}>
    <h1>Something Broke.</h1>
    <p class="muted measure">
      {bare ? "This screen hit a problem drawing the game. It tries again in a few seconds." : "This page hit a problem it couldn't get past. What's saved is safe."}
    </p>
    {#if !bare}<p class="row"><button onclick={reset}>Try Again</button><a class="btn" href="/">Back to Games</a></p>{/if}
  </div>
{/snippet}

{#if bare}
  <svelte:boundary failed={crashed} onerror={(e) => console.error(e)}>
    {@render children()}
  </svelte:boundary>
{:else}
  <a class="skip" href="#main">Skip to Content</a>
  <header class="wrap top" bind:offsetHeight={headH}>
    <!-- hover the suits and they turn over to the other two -->
    <a href="/" class="logo">
      <span class="suits" aria-hidden="true">
        <span class="roll"><span>♠</span><span class="suit-r">♦</span></span
        ><span class="roll"><span class="suit-r">♥</span><span>♣</span></span>
      </span>
      PitMaster
    </a>
    <nav class="tabs" aria-label="Pages" bind:clientWidth={navW}>
      {#each tabLinks as l (l.href)}
        <a class="tab" href={l.href} aria-current={current(l.href) ? "page" : undefined}>
          {l.label}
          {#if current(l.href)}<span class="tab-rule" aria-hidden="true"
            ></span>{/if}
        </a>
      {/each}
      {#if lockTab}
        <button class="link tab" data-sound="lock" onclick={lockNow} title="Lock PitMaster now"><Icon icon={Lock} size="1em" />Lock</button>
      {/if}
      {#if folded}
        <div class="more" bind:this={more}>
          <button
            class="link tab"
            data-sound={menuOpen ? "close" : "open"}
            aria-label="More pages"
            aria-expanded={menuOpen}
            aria-controls="more-menu"
            aria-current={foldedCurrent ? "page" : undefined}
            onclick={() => (menuOpen = !menuOpen)}
          >
            <Icon icon={Ellipsis} />
            {#if foldedCurrent}<span class="tab-rule" aria-hidden="true"></span>{/if}
          </button>
          {#if menuOpen}
            <div id="more-menu" class="menu" in:fade={reveal()} out:fade={leave()}>
              {#each foldedLinks as l (l.href)}
                <a href={l.href} aria-current={current(l.href) ? "page" : undefined}>{l.label}</a>
              {/each}
              {#if lockable && !lockTab}
                <button class="link" data-sound="lock" onclick={lockNow}><Icon icon={Lock} size="1em" />Lock</button>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </nav>
    <button
      class="link tab calc-tab"
      data-sound="none"
      aria-label="Calculator"
      aria-expanded={calc.open}
      title="Calculator ({keyLabel(CALC_KEY)})"
      onclick={toggleCalc}><Icon icon={CalcIcon} /></button
    >
    <!-- every tab at its own width, never seen: what the fold is worked out from -->
    <div class="ruler" aria-hidden="true" bind:this={ruler}>
      {#each links as l (l.href)}<span>{l.label}</span>{/each}
      <span><Icon icon={Lock} size="1em" />Lock</span>
      <span><Icon icon={Ellipsis} /></span>
    </div>
  </header>
  <main class="wrap" id="main" tabindex="-1">
    {#if vault.state === "locked" && !unlockedPage}
      <LockScreen />
    {:else if vault.state === "unreadable" && !unlockedPage}
      <h1>Saved Data Can't Be Opened</h1>
      <p class="measure">
        PitMaster encrypts everything it saves with a key that only this browser holds. That key is gone, usually
        because part of this site's data was cleared, so what's saved here can't be read by anyone, including us.
      </p>
      <p class="measure">
        If you have an export file, start fresh and import it from <b>Settings</b>. Otherwise, starting fresh is the
        only way forward.
      </p>
      <p><button class="danger" data-sound="thud" onclick={discard}>Delete It and Start Fresh</button></p>
    {:else}
      {#if vault.state === "memory"}
        <p class="block small notice">
          <b>Nothing here is being saved.</b>
          {#if noKeeper === "blocked"}
            This browser is blocking site storage for PitMaster (a private window, or a setting that blocks site data),
            so there's nowhere safe to keep anything.
          {:else}
            This page isn't on a secure (https) connection, so your browser won't encrypt, and PitMaster doesn't save
            anything unencrypted.
          {/if}
          Whatever you do here is gone when the tab closes.
        </p>
      {/if}
      {#if saveTrouble && !bare}
        <p class="block small notice" role="status" transition:slide={reveal()}>
          <b>Your latest changes aren't saved yet.</b>
          This browser may be out of space, or blocking site storage. PitMaster keeps trying every few seconds; keep this
          tab open until it gets through, or <a href="/settings#data">export a backup</a> to be safe.
        </p>
      {/if}
      <svelte:boundary failed={crashed} onerror={(e) => console.error(e)}>
        {@render children()}
      </svelte:boundary>
    {/if}
  </main>
  <footer class="wrap small">
    <div class="foot">
      <p class="made muted">
        © {new Date().getFullYear()}
        <a href="https://wyzie.io" target="_blank" rel="noopener">Wyzie LLC</a>. All rights reserved.
      </p>
      <nav aria-label="More">
        <a href="/help" aria-current={page.url.pathname === "/help" ? "page" : undefined}>Help</a>
        <a
          href="/privacy"
          aria-current={page.url.pathname === "/privacy" ? "page" : undefined}
          >Privacy</a
        >
        <a
          href="/terms"
          aria-current={page.url.pathname === "/terms" ? "page" : undefined}
          >Terms</a
        >
      </nav>
    </div>
  </footer>
{/if}

<Toasts />
{#if !bare && readable && floaters}
  {@const [Palette, Calculator] = floaters}
  <Palette /><Calculator />
{/if}
<datalist id="regulars">
  {#each regulars as r (r.name)}<option value={r.name}></option>{/each}
</datalist>

<style>
  .top {
    display: flex;
    gap: 22px;
    justify-content: space-between;
    align-items: baseline;
    padding-top: 14px;
    padding-bottom: 0;
    border-bottom: var(--hair) solid var(--line);
    margin-bottom: 18px;
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--bg);
    /* its own layer in page transitions, so the old page never paints over it */
    view-transition-name: masthead;
  }
  .logo {
    flex: none;
    white-space: nowrap;
    font: 23px var(--font-serif);
    color: var(--fg);
    text-decoration: none;
    padding-bottom: 8px;
    letter-spacing: -0.01em;
  }
  .logo:visited {
    color: var(--fg);
  }
  .suits {
    display: inline-flex;
  }
  /* each suit is a window one glyph tall; hover rolls the next suit up into it */
  .roll {
    display: inline-flex;
    flex-direction: column;
    height: 1.2em;
    line-height: 1.2;
    overflow: hidden;
    vertical-align: bottom;
  }
  .roll > span {
    transition: transform 450ms var(--ease-out-expo);
  }
  .roll + .roll > span {
    transition-delay: 45ms;
  }
  @media (hover: hover) {
    .logo:hover .roll > span {
      transform: translateY(-100%);
    }
  }
  /* the tabs take what the logo leaves, on one line, from the right */
  .tabs {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    justify-content: flex-end;
    /* bottoms line up, so every tab's rule lands on the header's */
    align-items: flex-end;
    gap: 16px;
  }
  /* zero-sized and clipped, so it never widens the page */
  .ruler {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    overflow: hidden;
    display: flex;
    visibility: hidden;
    pointer-events: none;
    white-space: nowrap;
  }
  .ruler span {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .tab {
    white-space: nowrap;
  }
  .top .tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding-bottom: 8px;
    border-bottom: 2px solid transparent;
    margin-bottom: calc(-1 * var(--hair));
    /* tabs get the bottom rule instead of the site's text underline */
    text-decoration: none;
    transition:
      color var(--dur-hover) var(--ease-out),
      var(--t-focus);
  }
  /* the hover rule draws in from the left and leaves out the right, so running
     the pointer along the tabs reads as one line passing through */
  .top .tab::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 2px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform var(--dur-move) var(--ease-out-expo);
  }
  @media (hover: hover) {
    .top .tab:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }
  }
  /* the current tab has its own rule (it slides between tabs on navigation) */
  .top .tab[aria-current="page"]::after {
    display: none;
  }
  .top .tab[aria-current="page"] {
    color: var(--fg);
  }
  /* lock and … aren't pages, so they're buttons that sit in the tabs like them */
  .top button.tab {
    gap: 4px;
  }
  /* (the hidden ruler's … matches, so the fold's arithmetic stays right) */
  .more > .tab,
  .ruler span:last-child,
  .calc-tab {
    min-width: 28px;
    justify-content: center;
  }
  /* the calculator sits just past the tabs, at the tabs' own spacing */
  .calc-tab {
    flex: none;
    margin-left: -6px;
    /* an icon has no text baseline to line up by, so it sits on the header's
       rule like the tabs do */
    align-self: flex-end;
  }
  /* a finger needs taller tabs and a wider …; the header's own padding gives
     the height back, so it doesn't grow */
  @media (pointer: coarse) {
    .top {
      padding-top: 6px;
    }
    .top .tab {
      padding-top: 8px;
    }
    .more > .tab,
    .ruler span:last-child,
    .calc-tab {
      min-width: 44px;
    }
  }
  .more {
    position: relative;
  }
  /* the folded tabs, dropped down under the … on the header's rule */
  .menu {
    position: absolute;
    right: 0;
    top: calc(100% + var(--hair));
    z-index: 60;
    display: flex;
    flex-direction: column;
    min-width: 170px;
    padding: 6px 0;
    background: var(--bg);
    border: var(--hair) solid var(--line);
  }
  .menu a,
  .menu button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    text-align: left;
    text-decoration: none;
    white-space: nowrap;
  }
  .menu a,
  .menu button {
    transition: background-color var(--dur-hover) var(--ease-out);
  }
  .menu a:hover,
  .menu button:hover {
    background: var(--block);
  }
  .menu a:active,
  .menu button:active {
    background: var(--block-2);
  }
  .menu a[aria-current="page"] {
    color: var(--fg);
  }
  /* the active tab's rule is its own element so it can slide between tabs
     on navigation (a view transition, see app.css) */
  .tab-rule {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 2px;
    background: var(--fg);
    view-transition-name: tab-rule;
  }
  /* windows high contrast paints over backgrounds: the rules are drawn in its text color */
  @media (forced-colors: active) {
    .tab-rule,
    .top .tab::after {
      forced-color-adjust: none;
      background: CanvasText;
    }
  }
  main {
    view-transition-name: page;
  }
  main:focus {
    outline: none;
  }
  .crash {
    padding: 40px 0;
  }
  /* for the keyboard: the first tab stop jumps past the header */
  .skip {
    position: absolute;
    left: 12px;
    top: 8px;
    z-index: 100;
    padding: 6px 12px;
    background: var(--field);
    border: var(--hair) solid var(--fg);
    translate: 0 calc(-100% - 12px);
    transition: translate var(--dur-move) var(--ease-out-expo);
  }
  .skip:focus {
    translate: 0 0;
  }
  /* anything moving is drawn on a layer of its own, and on Windows a layer's
     text loses ClearType; when the motion stopped the text switched back and
     jumped in weight, so everything seemed to settle a beat after its
     animation (the logo after its suits rolled, a page after it slid in). the
     page's three parts stay layers for good, so text is drawn one way, moving
     or still. nothing inside them is position: fixed (the calculator, palette
     and toasts sit outside), so these can hold their own coordinates. only
     where there's a mouse: phones and tablets never draw ClearType text, so
     they'd pay the layers' memory for nothing. */
  @media (pointer: fine) {
    .top,
    main,
    footer {
      will-change: transform;
    }
  }
  .notice {
    margin: 0 0 18px;
  }
  footer {
    padding-top: 20px;
    border-top: var(--hair) solid var(--line);
  }
  footer p {
    margin: 0;
  }
  .foot {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px 24px;
  }
  footer nav {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 16px;
  }
  /* quiet links that come up to full ink on hover */
  footer nav a,
  .made a {
    color: var(--muted);
    transition:
      color var(--dur-hover) var(--ease-out),
      text-decoration-color var(--dur-hover) var(--ease-out),
      text-underline-offset 200ms var(--ease-out-expo),
      var(--t-focus);
  }
  footer nav a:hover,
  .made a:hover {
    color: var(--fg);
  }
  footer nav a[aria-current="page"] {
    color: var(--fg);
  }
</style>
