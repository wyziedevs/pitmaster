<script lang="ts">
  // a calculator that floats over everything (the browser's top layer, above
  // the page, the command box and a shuffle in flight) and never gets in the
  // way: the page underneath stays live, and Ghost makes it see-through and
  // lets clicks fall through it. drag it by its bar, or toss it and it slides
  // to a stop, knocking off the edges. one display: the sum as it's typed,
  // what it comes to under it, and the answers so far printed above it like a
  // till roll. the answer can go straight into the box you were last in.
  // nothing typed here is saved (calc.svelte.ts).
  import { fade, fly } from "svelte/transition";
  import { page } from "$app/state";
  import Icon from "./Icon.svelte";
  import Ghost from "@lucide/svelte/icons/ghost";
  import X from "@lucide/svelte/icons/x";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import Delete from "@lucide/svelte/icons/delete";
  import ArrowRightToLine from "@lucide/svelte/icons/arrow-right-to-line";
  import Copy from "@lucide/svelte/icons/copy";
  import Check from "@lucide/svelte/icons/check";
  import Coins from "@lucide/svelte/icons/coins";
  import { calc, closeCalculator, CALC_KEY } from "$lib/calcbox.svelte";
  import { t } from "$lib/i18n";
  import {
    sum,
    asOp,
    back,
    clear,
    clearsAll,
    current,
    digit,
    equals,
    feed,
    fmt,
    negate,
    op,
    openParens,
    paren,
    parseNumber,
    pendingOp,
    percent,
    preview,
    shown,
    use,
    thousands,
    recall,
  } from "$lib/calc.svelte";
  import { palette } from "$lib/commands.svelte";
  import { comboOf, typingIn, keyLabel } from "$lib/keys";
  import { play, type UiSound } from "$lib/sound";
  import { leave, reducedMotion, reveal, rise, slide } from "$lib/motion";

  const EDGE = 8;
  // a timing token from app.css, so an animation run from here eases like the css ones
  const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  let panel = $state<HTMLElement>();
  let w = $state(0);
  let h = $state(0);
  let vh = $state(innerHeight);
  // the page's width without its scrollbar, so it never parks over it
  let vw = $state(document.documentElement.clientWidth);
  $effect(() => {
    const root = document.documentElement;
    const ro = new ResizeObserver(() => (vw = root.clientWidth));
    ro.observe(root);
    return () => ro.disconnect();
  });

  // where it is: the default corner until it's moved, and always on screen
  const px = $derived(Math.round(Math.max(EDGE, Math.min(calc.x ?? vw - w - 16, vw - w - EDGE))));
  const py = $derived(Math.round(Math.max(EDGE, Math.min(calc.y ?? vh - h - 16, vh - h - EDGE))));

  // ---------- opening and closing ----------
  // it takes the keyboard as it opens
  $effect(() => {
    panel?.focus({ preventScroll: true });
  });
  function closeCalc() {
    stopFling();
    play("close");
    closeCalculator();
  }

  /** the top layer: above every z-index on the page. (a browser without it gets a high one) */
  function topLayer(node: HTMLElement) {
    try {
      node.showPopover();
    } catch {}
  }

  function onWindowKey(e: KeyboardEvent) {
    if (palette.recording || palette.open || e.defaultPrevented) return;
    if (comboOf(e) !== CALC_KEY || typingIn(e.target) || panel?.contains(e.target as Node)) return;
    e.preventDefault();
    if (!calc.open) {
      play("open");
      calc.open = true;
    } else {
      // already out: bring it back to hand, solid again
      calc.ghost = false;
      panel?.focus({ preventScroll: true });
      nudge();
    }
  }

  function nudge() {
    if (reducedMotion()) return;
    panel?.animate([{ scale: 1 }, { scale: 1.035 }, { scale: 1 }], { duration: 320, easing: token("--ease-out-expo") });
  }

  // ---------- the keys ----------
  // the tools across the top, the operators down the right, = two keys tall.
  // ariaKey names a spot in calculator.ts (t("calculator." + ariaKey)); the
  // symbols themselves (label) stay as printed, in every language
  type Key = { id: string; label: string; ariaKey?: string; kind: "d" | "op" | "fn" | "eq"; wide?: boolean; tall?: boolean };
  const digits = (...ds: string[]) => ds.map((d): Key => ({ id: d, label: d, kind: "d" }));
  const KEYS: Key[] = [
    { id: "clear", label: "AC", kind: "fn" },
    { id: "(", label: "(", ariaKey: "openBracket", kind: "fn" },
    { id: ")", label: ")", ariaKey: "closeBracket", kind: "fn" },
    { id: "÷", label: "÷", ariaKey: "divide", kind: "op" },
    { id: "%", label: "%", ariaKey: "percent", kind: "fn" },
    { id: "neg", label: "±", ariaKey: "changeSign", kind: "fn" },
    { id: "back", label: "", ariaKey: "backspace", kind: "fn" },
    { id: "×", label: "×", ariaKey: "times", kind: "op" },
    ...digits("7", "8", "9"),
    { id: "−", label: "−", ariaKey: "minus", kind: "op" },
    ...digits("4", "5", "6"),
    { id: "+", label: "+", ariaKey: "plus", kind: "op" },
    ...digits("1", "2", "3"),
    { id: "=", label: "=", ariaKey: "equals", kind: "eq", tall: true },
    { id: "0", label: "0", kind: "d", wide: true },
    { id: ".", label: ".", ariaKey: "decimalPoint", kind: "d" },
  ];

  /** run a key. `typed`: it came from the keyboard, so the screen key goes down too */
  function press(id: string, typed = false) {
    stepping = -1;
    let ok = true;
    // a click made its own sound on the way down (+layout.svelte); a typed key makes it here
    let sound: UiSound | null = typed ? "key" : null;
    const o = asOp(id);
    if (/^[\d.]$/.test(id)) ok = digit(id);
    else if (o) {
      ok = op(o);
      if (typed) sound = "tap";
    } else if (id === "=") {
      ok = equals();
      // the answer rings on the note of the chip its size
      if (ok) play("total", { value: current() ?? 1, x: keyX(id) });
      sound = sum.error ? "error" : ok ? null : "tap";
    } else if (id === "clear") {
      if (typed) sound = clearsAll() ? "swish" : "soft";
      clear();
    } else if (id === "back") {
      ok = back();
      if (typed) sound = "soft";
    } else if (id === "neg") ok = negate();
    else if (id === "%") ok = percent();
    else if (id === "(" || id === ")") ok = paren(id);
    else if (id === "k" || id === "m") ok = thousands(id);
    if (!ok && id !== "=") sound = "off";
    if (sound) play(sound, { x: keyX(id) });
    if (typed) flash(id);
  }

  const keyEl = (id: string) => panel?.querySelector<HTMLElement>(`[data-k="${CSS.escape(id)}"]`);
  function keyX(id: string) {
    const r = keyEl(id)?.getBoundingClientRect();
    return r ? r.left + r.width / 2 : undefined;
  }
  function flash(id: string) {
    const el = keyEl(id);
    if (!el) return;
    el.classList.add("down");
    setTimeout(() => el.classList.remove("down"), 110);
  }

  // what the keyboard means
  const TYPED: Record<string, string> = {
    Enter: "=",
    "=": "=",
    Backspace: "back",
    Delete: "clear",
    c: "clear",
    C: "clear",
    "%": "%",
    "(": "(",
    ")": ")",
    ",": ".",
    ".": ".",
    F9: "neg",
    _: "neg",
    k: "k",
    K: "k",
    m: "m",
    M: "m",
  };

  // ↑ and ↓ step back through the answers on the tape, like a terminal. past
  // the newest, ↓ clears it again
  let stepping = -1;
  function stepTape(by: number) {
    const i = Math.max(-1, Math.min(sum.tape.length - 1, stepping + by));
    if (i === stepping) return play("off");
    stepping = i;
    if (i < 0) {
      // back to a clear screen (never on to tearing off the tape)
      if (sum.entry || sum.toks.length || sum.error) clear();
      return play("soft");
    }
    use(sum.tape[i].value);
    play("card");
  }

  function onKey(e: KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "c" && !getSelection()?.toString()) {
      e.preventDefault();
      copy();
      return;
    }
    if (mod || e.altKey) return;
    // Enter and Space still work a button tabbed to (the bar's tools, copy, Into).
    // on one that was just clicked, Enter is = like anywhere else
    const enter = e.key === "Enter" || e.key === " ";
    const on = (e.target as Element).closest("button:not(.k)");
    if (enter && on && on !== clicked) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (!clearsAll() || sum.toks.length || sum.entry || sum.error) {
        play(clearsAll() ? "swish" : "soft");
        clear();
      } else closeCalc();
      return;
    }
    const id = /^\d$/.test(e.key) ? e.key : (asOp(e.key) ?? TYPED[e.key]);
    // the page's own keys (Space for the clock, arrows for levels) stay out of it while it has the keyboard
    if (e.key !== "Tab") e.stopPropagation();
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      return stepTape(e.key === "ArrowUp" ? 1 : -1);
    }
    if (!id) {
      // and Space doesn't press a clicked key again
      if (enter) e.preventDefault();
      return;
    }
    e.preventDefault();
    press(id, true);
  }

  // ---------- copying, pasting, and the box you were in ----------
  /** the copy just went through: the icon is a check for a moment */
  let copied = $state(false);
  let copiedTimer = 0;
  async function copy() {
    const v = current();
    if (v === null) return;
    try {
      await navigator.clipboard.writeText(String(v));
      play("on");
      copied = true;
      clearTimeout(copiedTimer);
      copiedTimer = window.setTimeout(() => (copied = false), 1200);
    } catch {
      play("off");
    }
  }

  // ---------- the tape ----------
  // a sum on the tape comes back to change; its answer goes into the sum
  function again(expr: string) {
    stepping = -1;
    play(recall(expr.replace(/=\s*$/, "")) ? "card" : "off");
  }
  function useAnswer(v: number) {
    stepping = -1;
    use(v);
  }

  // ---------- pot limit ----------
  // type the pot (everything in the middle and in front of the players) and
  // take it, then the amount to call: the most a raise can be is to the call,
  // plus the pot with that call in it
  function takeForPot(which: "potSize" | "toCall") {
    const v = current();
    calc[which] = v === null ? 0 : Math.max(0, v);
    clear();
  }
  const maxRaise = $derived(calc.potSize === null ? null : calc.potSize + 2 * (calc.toCall ?? 0));
  function togglePot() {
    calc.pot = !calc.pot;
    play(calc.pot ? "open" : "close");
  }

  // one number takes the place of what's being typed; a whole sum ("(20+5)*8") is typed in
  function onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData("text") ?? "";
    e.preventDefault();
    const n = parseNumber(text);
    if (n !== null ? use(n) : feed(text)) play("card");
    else play("off");
  }

  // the last number box on the page that had focus: the answer can go straight into it
  const FIELD = 'input[type="number"], input[inputmode="decimal"], input[inputmode="numeric"]';
  let field = $state<HTMLInputElement | null>(null);
  let fieldName = $state("");

  function nameOf(el: HTMLInputElement) {
    const by = el.getAttribute("aria-labelledby");
    const text =
      el.labels?.[0]?.textContent ||
      el.getAttribute("aria-label") ||
      (by && document.getElementById(by)?.textContent) ||
      el.placeholder ||
      el.closest("td, th, label")?.closest("tr")?.querySelector("th, td")?.textContent ||
      "";
    // "Buy-In $" reads as Buy-In
    return text.replace(/\s+/g, " ").replace(/[\s$€£¥%:*]+$/, "").trim();
  }

  function onFocusIn(e: FocusEvent) {
    const t = e.target as HTMLElement;
    // tabbed to: a button that was clicked before is a button again
    if (t !== clicked) clicked = null;
    if (!t?.matches || panel?.contains(t)) return;
    if (!t.matches(FIELD) || (t as HTMLInputElement).disabled || (t as HTMLInputElement).readOnly) return;
    field = t as HTMLInputElement;
    fieldName = nameOf(field);
  }
  // a new page, or the box going away (Done Editing), and there's nowhere to put it
  $effect(() => {
    void page.url.href;
    field = null;
  });
  const checkField = () => {
    if (field && !field.isConnected) field = null;
  };

  function putIn() {
    const v = current();
    const el = field;
    if (v === null || !el?.isConnected) return checkField();
    el.value = String(v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.focus({ preventScroll: false });
    if (!reducedMotion())
      el.animate([{ backgroundColor: "var(--warn-bg)" }, { backgroundColor: "var(--field)" }], { duration: 900, easing: token("--ease-out") });
  }

  // ---------- dragging, and tossing ----------
  let held = $state(false);
  let tilt = $state(0);
  let grab = { dx: 0, dy: 0 };
  let trail: { t: number; x: number; y: number }[] = [];
  let raf = 0;

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  function velocity() {
    const now = trail.at(-1);
    const then = trail.find((p) => now && now.t - p.t <= 90) ?? trail[0];
    if (!now || !then || now.t === then.t) return { vx: 0, vy: 0 };
    return { vx: (now.x - then.x) / (now.t - then.t), vy: (now.y - then.y) / (now.t - then.t) };
  }

  function grabBar(e: PointerEvent) {
    if (e.button !== 0 || (e.target as Element).closest("button")) return;
    stopFling();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    grab = { dx: e.clientX - px, dy: e.clientY - py };
    trail = [{ t: e.timeStamp, x: e.clientX, y: e.clientY }];
    held = true;
    play("soft", { x: e.clientX });
  }

  function dragBar(e: PointerEvent) {
    if (!held) return;
    calc.x = e.clientX - grab.dx;
    calc.y = e.clientY - grab.dy;
    trail.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
    if (trail.length > 12) trail.shift();
    // it swings a little the way it's being pulled, like a card held by its top edge
    tilt = reducedMotion() ? 0 : clamp(velocity().vx * 3, -6, 6);
  }

  function dropBar(e: PointerEvent) {
    if (!held) return;
    held = false;
    calc.x = px;
    calc.y = py;
    const { vx, vy } = velocity();
    const quick = e.timeStamp - (trail.at(-1)?.t ?? 0) < 60;
    if (quick && Math.hypot(vx, vy) > 0.45 && !reducedMotion()) fling(vx, vy);
    else {
      tilt = 0;
      play("tap", { x: e.clientX });
    }
  }

  /** let go mid-throw: it slides, slows, and knocks off the edges */
  function fling(vx: number, vy: number) {
    let x = px;
    let y = py;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      x += vx * dt;
      y += vy * dt;
      const maxX = vw - w - EDGE;
      const maxY = vh - h - EDGE;
      let hit = 0;
      if (x < EDGE || x > maxX) {
        hit = Math.max(hit, Math.abs(vx));
        x = clamp(x, EDGE, maxX);
        vx = -vx * 0.42;
      }
      if (y < EDGE || y > maxY) {
        hit = Math.max(hit, Math.abs(vy));
        y = clamp(y, EDGE, maxY);
        vy = -vy * 0.42;
      }
      if (hit > 0.2) play("knock", { v: hit / 3, x: x + w / 2 });
      const drag = 0.9935 ** dt;
      vx *= drag;
      vy *= drag;
      calc.x = x;
      calc.y = y;
      tilt = clamp(vx * 3, -6, 6);
      if (Math.hypot(vx, vy) < 0.03) {
        raf = 0;
        tilt = 0;
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function stopFling() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    tilt = 0;
  }

  function toggleSmall() {
    calc.small = !calc.small;
    play(calc.small ? "close" : "open");
  }

  // a click anywhere on it (in Safari a button doesn't take focus) keeps the typing here
  let clicked: Element | null = null;
  function keepFocus(e: PointerEvent) {
    checkField();
    clicked = (e.target as Element).closest("button");
    if (!panel?.contains(document.activeElement) && !clicked) panel?.focus({ preventScroll: true });
  }

  // calc.svelte.ts throws a stable, internal (English) error code; here it
  // becomes the message the user actually sees
  const ERROR_KEYS: Record<string, string> = {
    "divide-by-zero": "calculator.errorDivideByZero",
    "cant-work-out": "calculator.errorCantWorkOut",
    "too-big": "calculator.errorTooBig",
  };
  function errorText(code: string) {
    const key = ERROR_KEYS[code];
    return key ? t(key) : code;
  }
  const big = $derived(sum.error ? errorText(sum.error) : shown());
  // brackets still open, shown faintly at the end: they close themselves at =
  const closing = $derived(sum.done || sum.error ? "" : ")".repeat(openParens()));
  const pre = $derived(preview());
  const lit = $derived(pendingOp());
  // what the clear key will do: C the number, AC the sum, and on a clear screen the tape
  const clearIsTape = $derived(clearsAll() && !sum.entry && !sum.toks.length && !sum.error && !!sum.tape.length);
  const clearLabel = $derived(!clearsAll() ? t("common.clear") : clearIsTape ? t("calculator.clearTape") : t("calculator.clearAll"));
  // a long sum shrinks to fit, down to a size that's still easy to read; past
  // that it keeps its end in view
  const bigSize = $derived(Math.max(17, Math.min(32, Math.floor(390 / Math.max(1, big.length + closing.length)))));
</script>

<svelte:window bind:innerHeight={vh} onkeydown={onWindowKey} />
<svelte:document onfocusin={onFocusIn} />

{#if calc.open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={panel}
    bind:offsetWidth={w}
    bind:offsetHeight={h}
    use:topLayer
    popover="manual"
    class="calc float"
    class:held
    class:ghost={calc.ghost}
    style:translate="{px}px {py}px"
    style:rotate="{tilt}deg"
    role="dialog"
    aria-label={t("calculator.title")}
    tabindex="-1"
    onkeydown={onKey}
    onpaste={onPaste}
    onpointerdown={keepFocus}
    in:fly={rise(10)}
    out:fade={leave()}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="bar"
      onpointerdown={grabBar}
      onpointermove={dragBar}
      onpointerup={dropBar}
      onpointercancel={dropBar}
      ondblclick={(e) => !(e.target as Element).closest("button") && toggleSmall()}
      title={t("calculator.dragTitle")}
    >
      <button
        class="icon-btn tool see"
        class:on={calc.ghost}
        data-sound={calc.ghost ? "off" : "on"}
        aria-pressed={calc.ghost}
        title={calc.ghost ? t("calculator.ghostOn") : t("calculator.ghostOff")}
        onclick={() => (calc.ghost = !calc.ghost)}><Icon icon={Ghost} label={t("calculator.ghostLabel")} /></button
      >
      <button
        class="icon-btn tool"
        class:on={calc.pot}
        data-sound="none"
        aria-pressed={calc.pot}
        title={calc.pot ? t("calculator.pot.offTitle") : t("calculator.pot.onTitle")}
        onclick={togglePot}><Icon icon={Coins} label={t("calculator.pot.label")} /></button
      >
      <button
        class="icon-btn tool"
        data-sound="none"
        aria-expanded={!calc.small}
        title={calc.small ? t("calculator.showKeysTitle") : t("calculator.hideKeysTitle")}
        onclick={toggleSmall}><Icon icon={calc.small ? ChevronUp : ChevronDown} label={calc.small ? t("calculator.showKeysLabel") : t("calculator.hideKeysLabel")} /></button
      >
      <button class="icon-btn tool" data-sound="none" title={t("calculator.closeTitle", { shortcut: keyLabel(CALC_KEY) })} onclick={closeCalc}
        ><Icon icon={X} label={t("common.close")} /></button
      >
    </div>

    <div class="screen" class:err={!!sum.error} class:done={sum.done}>
      {#if !calc.small}
        <!-- the answers so far, newest at the bottom. the one on the display
             prints just its sum, its answer is right under it. a pointer taps
             them; the keyboard steps through them with the arrows. always
             left-to-right (dir="ltr"): a till roll of numbers, not prose,
             so it reads the same way in every language -->
        <div class="tape num" role="group" aria-label={t("calculator.tapeLabel")} dir="ltr" in:slide={reveal()} out:slide={leave()}>
          {#each sum.tape as row, i (row)}
            <div class="line">
              <button class="expr" data-sound="none" tabindex="-1" title={t("calculator.changeSumTitle")} onclick={() => again(row.expr)}><span dir="ltr">{row.expr}</span></button>
              {#if i || !sum.done}
                <button class="val" data-sound="card" tabindex="-1" title={t("calculator.useValueTitle", { value: fmt(row.value) })} onclick={() => useAnswer(row.value)}>{fmt(row.value)}</button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      <!-- the sum as typed, or the answer: always left-to-right too -->
      <output class="big num" dir="ltr" style:font-size="{bigSize}px" aria-live="polite"
        ><span dir="ltr">{big}<span class="closing" aria-hidden="true">{closing}</span></span></output
      >
      <div class="under">
        <button
          class="icon-btn copy"
          class:copied
          data-sound="none"
          onclick={copy}
          disabled={current() === null}
          aria-label={copied ? t("common.copied") : t("common.copy")}
          aria-live="polite"
          title={t("calculator.copyTitle", { shortcut: keyLabel("Mod+C") })}><Icon icon={copied ? Check : Copy} /></button
        >
        {#if field}
          <button
            class="link small into"
            data-sound="drop"
            onclick={putIn}
            disabled={current() === null}
            title={t("calculator.putInTitle", {
              value: current() === null ? t("calculator.putInValueFallback") : fmt(current()!),
              field: fieldName || t("calculator.putInFieldFallback"),
            })}
            ><Icon icon={ArrowRightToLine} size="1em" /><span>{fieldName ? t("calculator.intoField", { field: fieldName }) : t("calculator.intoBox")}</span></button
          >
        {/if}
        <span class="pre num" dir="ltr">{pre === null ? "" : `= ${fmt(pre)}`}</span>
      </div>
    </div>

    {#if calc.pot}
      <!-- pot limit: the pot and the call are taken from the display, and the
           most anyone can raise to comes out under them -->
      <div class="potbox" in:slide={reveal()} out:slide={leave()}>
        <button class="pk" data-sound="card" onclick={() => takeForPot("potSize")} title={t("calculator.pot.takeTitle")}><span>{t("calculator.pot.pot")}</span><b class="num" dir="ltr">{calc.potSize === null ? "–" : fmt(calc.potSize)}</b></button>
        <button class="pk" data-sound="card" onclick={() => takeForPot("toCall")} title={t("calculator.pot.takeTitle")}><span>{t("calculator.pot.toCall")}</span><b class="num" dir="ltr">{calc.toCall === null ? "–" : fmt(calc.toCall)}</b></button>
        <button class="pk out" data-sound="card" disabled={maxRaise === null} onclick={() => maxRaise !== null && useAnswer(maxRaise)} title={t("calculator.pot.useTitle")}><span>{t("calculator.pot.maxRaise")}</span><b class="num" dir="ltr">{maxRaise === null ? "–" : fmt(maxRaise)}</b></button>
      </div>
    {/if}

    {#if !calc.small}
      <!-- the number pad itself: always left-to-right, its layout fixed
           regardless of language, like on any calculator -->
      <div class="keys" dir="ltr" in:slide={reveal()} out:slide={leave()}>
        {#each KEYS as k (k.id)}
          <button
            class="k {k.kind}"
            class:wide={k.wide}
            class:tall={k.tall}
            class:lit={lit === k.id}
            data-k={k.id}
            data-sound={k.kind === "eq" ? "none" : k.id === "clear" ? (clearsAll() ? "swish" : "soft") : k.kind === "op" ? "tap" : "key"}
            aria-label={k.id === "clear" ? clearLabel : k.ariaKey ? t(`calculator.${k.ariaKey}`) : undefined}
            title={k.id === "clear" && clearIsTape ? clearLabel : undefined}
            tabindex="-1"
            onclick={() => press(k.id)}
          >
            {#if k.id === "back"}<Icon icon={Delete} />{:else if k.id === "clear"}{clearsAll() ? "AC" : "C"}{:else}{k.label}{/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* the floating look (.float), small and free to roam. popover's own box
     styles are undone so it sits where it's put */
  .calc {
    /* the bar's tools and a line of tape: small here, finger-sized on a touch screen */
    --calc-bar: 24px;
    --calc-line: 18px;
    position: fixed;
    inset: auto;
    left: 0;
    top: 0;
    margin: 0;
    padding: 0;
    z-index: 2000;
    /* a layer for good, so its text never changes weight when it stops moving (+layout.svelte) */
    will-change: transform;
    width: 264px;
    max-width: calc(100vw - 16px);
    overflow: visible;
    color: var(--fg);
    view-transition-name: calculator;
    transition:
      rotate 220ms var(--ease-out-expo),
      scale 220ms var(--ease-out-expo),
      background-color var(--dur-move) var(--ease-out),
      border-color var(--dur-move) var(--ease-out),
      box-shadow 220ms var(--ease-out);
  }
  /* no ring round the whole thing when it takes the keyboard: its edge goes
     quiet instead while the page has it, like a window in the background */
  .calc:focus-visible {
    outline: none;
  }
  .calc:not(:focus-within) {
    border-color: var(--line-strong);
  }
  /* picked up: it comes off the page a touch */
  .calc.held {
    scale: 1.02;
    transition-duration: 90ms, 160ms, var(--dur-move), var(--dur-move), 160ms;
  }
  /* ghost: see-through, and every click falls through to the page. only the
     ghost button itself still catches the pointer, to bring it back */
  .calc.ghost {
    pointer-events: none;
    background: color-mix(in oklch, var(--field) 25%, transparent);
    border-color: color-mix(in oklch, var(--fg) 30%, transparent);
    box-shadow: none;
  }
  .screen,
  .keys {
    transition: opacity var(--dur-move) var(--ease-out);
  }
  .ghost :is(.screen, .keys, .tool:not(.see)) {
    opacity: 0.3;
  }
  .ghost .see {
    pointer-events: auto;
    background: var(--fg);
    color: var(--bg);
  }
  /* the bar: a strip across the top to hold it by, its three tools at the right */
  .bar {
    display: flex;
    justify-content: flex-end;
    height: var(--calc-bar);
    cursor: grab;
    touch-action: none;
    user-select: none;
  }
  .held .bar {
    cursor: grabbing;
  }
  /* the bar's tools and copy: small squares, their icons sized to 12px text */
  .tool,
  .copy {
    width: var(--calc-bar);
    height: var(--calc-bar);
    font-size: var(--fs-sm);
  }
  .tool.on {
    color: var(--fg);
    background: var(--block-2);
  }
  /* pot limit: three boxes across, the pot, the call and the most it can go to */
  .potbox {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding: 4px 8px 6px;
    border-top: var(--hair) solid var(--line);
  }
  .pk {
    height: auto;
    min-height: 40px;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    padding: 4px 6px;
    font-size: var(--fs-sm);
    line-height: 1.25;
  }
  .pk span {
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .pk b {
    font-size: var(--fs-md);
  }
  .pk.out b {
    color: var(--fg);
  }
  /* one display, right-aligned: the tape, the sum, what it comes to */
  .screen {
    padding: 0 12px 2px;
    text-align: right;
  }
  /* a few lines of till roll, always the same room so the keys never move
     under a finger. newest at the bottom; older ones scroll up. on a short
     screen it gives way first */
  .tape {
    display: flex;
    flex-direction: column-reverse;
    height: clamp(var(--calc-line), calc(100dvh - 480px), calc(3 * var(--calc-line)));
    margin: 0 -4px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
    font-size: var(--fs-sm);
  }
  /* a line is two targets: the sum (bring it back to change) and its answer (use it) */
  .line {
    flex: none;
    display: flex;
    justify-content: flex-end;
    height: var(--calc-line);
  }
  .line button {
    height: 100%;
    padding: 0 4px;
    background: none;
    border: 0;
    font: inherit;
    color: var(--muted);
  }
  .line button:hover {
    color: var(--fg);
    background: var(--block);
  }
  .line .expr {
    display: block;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    direction: rtl;
    line-height: var(--calc-line);
  }
  .line .val {
    flex: none;
    color: var(--fg);
  }
  /* the sum as it's typed, or the answer. long lines keep their end in view */
  .big {
    display: block;
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    white-space: nowrap;
    direction: rtl;
    letter-spacing: -0.02em;
    transition: font-size 160ms var(--ease-out-expo);
  }
  /* the answer lands: a quick settle, so = feels like it did something */
  .done .big {
    animation: land 320ms var(--ease-out-expo);
  }
  @keyframes land {
    from {
      transform: translateY(6px);
      opacity: 0.4;
    }
  }
  .closing {
    color: var(--line-strong);
  }
  .err .big {
    color: var(--accent);
    font-family: var(--font);
    font-size: var(--fs-lg) !important;
    letter-spacing: 0;
  }
  /* copy and Into at the left, what the sum comes to so far at the right */
  .under {
    display: flex;
    align-items: center;
    gap: 6px;
    height: var(--calc-bar);
    margin-left: -6px;
    font-size: var(--fs-sm);
  }
  .copy.copied {
    color: var(--good);
  }
  .copy:disabled {
    background: none;
  }
  .into {
    min-width: 0;
  }
  .into span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pre {
    flex: none;
    margin-left: auto;
    font-size: var(--fs-base);
    color: var(--muted);
  }
  /* the keypad: one sheet ruled into keys by hairlines */
  .keys {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: clamp(30px, calc((100dvh - 200px) / 5.5), var(--control-h-big));
    gap: var(--hair);
    background: var(--line);
    border-top: var(--hair) solid var(--line);
  }
  /* digits on the field face, the tools and operators a step greyer, = on
     the felt. a key goes down in place, the sheet stays flat */
  .k {
    height: auto;
    padding: 0;
    border: 0;
    font-size: var(--fs-lg);
    font-family: var(--font-mono);
    background: var(--field);
    transform: none;
    transition:
      background-color var(--dur-hover) var(--ease-out),
      color var(--dur-hover) var(--ease-out);
  }
  .k.wide {
    grid-column: span 2;
  }
  .k.tall {
    grid-row: span 2;
  }
  .k.fn {
    font-size: var(--fs-base);
    color: var(--muted);
  }
  .k:is(.op, .eq) {
    font-size: var(--fs-xl);
  }
  .k:is(.fn, .op),
  .k:hover {
    background: var(--block);
  }
  .k:is(.fn, .op):hover {
    color: var(--fg);
    background: var(--block-2);
  }
  .k:not(.eq):is(:active, :global(.down)) {
    background: var(--block-3);
  }
  /* the operator waiting for its next number stays lit */
  .k.op.lit {
    background: var(--fg);
    color: var(--bg);
  }
  .k.eq {
    background: var(--felt);
    color: var(--felt-fg);
  }
  .k.eq:hover {
    background: oklch(from var(--felt) calc(l + 0.04) c h);
  }
  .k.eq:is(:active, :global(.down)) {
    background: oklch(from var(--felt) calc(l - 0.03) c h);
  }
  /* on a phone everything gets finger-sized */
  @media (pointer: coarse) {
    .calc {
      --calc-bar: 32px;
      --calc-line: 26px;
      width: 288px;
    }
    .keys {
      grid-auto-rows: clamp(38px, calc((100dvh - 250px) / 5.5), var(--control-h-big));
    }
  }
  /* a phone on its side is too short for finger-sized keys: they give a little,
     so the bottom row is still on the screen */
  @media (pointer: coarse) and (max-height: 500px) {
    .keys {
      grid-auto-rows: clamp(30px, calc((100dvh - 170px) / 6), 38px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .calc {
      transition: none;
    }
    .calc.held {
      scale: none;
    }
  }
</style>
