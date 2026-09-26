<script lang="ts">
  // a calculator that floats over everything (the browser's top layer, above
  // the page, the command box and a shuffle in flight) and never gets in the
  // way: the page underneath stays live, and Ghost makes it see-through and
  // lets clicks fall through it. drag it by its bar, or toss it and it slides
  // to a stop, knocking off the edges. the whole sum shows as it's typed, with
  // what it comes to underneath; the answer can go straight into the box you
  // were last in, and after = it shows in chips from your set. nothing typed
  // here is saved (calc.svelte.ts).
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
  import Chip from "./Chip.svelte";
  import { calc, closeCalculator, CALC_KEY } from "$lib/calcbox.svelte";
  import {
    sum,
    asOp,
    back,
    clear,
    clearTape,
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
    addUp,
    tapeText,
  } from "$lib/calc.svelte";
  import { getChipSet, getDefaultChipSetId } from "$lib/store";
  import type { ChipDef } from "$lib/types";
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
  // the tools across the top, the operators down the right, = two keys tall
  type Key = { id: string; label: string; aria?: string; kind: "d" | "op" | "fn" | "eq"; wide?: boolean; tall?: boolean };
  const digits = (...ds: string[]) => ds.map((d): Key => ({ id: d, label: d, kind: "d" }));
  const KEYS: Key[] = [
    { id: "clear", label: "AC", aria: "Clear", kind: "fn" },
    { id: "(", label: "(", aria: "Open bracket", kind: "fn" },
    { id: ")", label: ")", aria: "Close bracket", kind: "fn" },
    { id: "÷", label: "÷", aria: "Divide", kind: "op" },
    { id: "%", label: "%", aria: "Percent", kind: "fn" },
    { id: "neg", label: "±", aria: "Change sign", kind: "fn" },
    { id: "back", label: "", aria: "Backspace", kind: "fn" },
    { id: "×", label: "×", aria: "Times", kind: "op" },
    ...digits("7", "8", "9"),
    { id: "−", label: "−", aria: "Minus", kind: "op" },
    ...digits("4", "5", "6"),
    { id: "+", label: "+", aria: "Plus", kind: "op" },
    ...digits("1", "2", "3"),
    { id: "=", label: "=", aria: "Equals", kind: "eq", tall: true },
    { id: "0", label: "0", kind: "d", wide: true },
    { id: ".", label: ".", aria: "Decimal point", kind: "d" },
  ];

  /** run a key. `typed`: it came from the keyboard, so the screen key goes down too */
  function press(id: string, typed = false) {
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
      clear();
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
    // Enter and Space still work the bar's own buttons
    if ((e.key === "Enter" || e.key === " ") && (e.target as Element).closest("button:not(.k)")) return;
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
    if (!id) return;
    stepping = -1;
    e.preventDefault();
    press(id, true);
  }

  // ---------- copying, pasting, and the box you were in ----------
  /** which copy just went through, the answer or the history, for a moment */
  let copied = $state<"" | "answer" | "tape">("");
  let copiedTimer = 0;
  async function copy(what: "answer" | "tape" = "answer") {
    const v = current();
    const text = what === "tape" ? tapeText() : v === null ? "" : String(v);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      play("on");
      copied = what;
      clearTimeout(copiedTimer);
      copiedTimer = window.setTimeout(() => (copied = ""), 1200);
    } catch {
      play("off");
    }
  }

  // ---------- the history ----------
  // a sum on the tape comes back to change; its answer goes into the sum
  function again(expr: string) {
    stepping = -1;
    play(recall(expr.replace(/=\s*$/, "")) ? "card" : "off");
  }
  function useAnswer(v: number) {
    stepping = -1;
    use(v);
  }
  // cash-outs, buy-ins, a night's rake: every answer so far, totalled
  function total() {
    stepping = -1;
    if (addUp()) play("total", { value: current() ?? 1 });
  }

  // ---------- the answer in chips ----------
  // the fewest chips from your chip set that make it, biggest first. anything
  // under the smallest chip is left over
  function inChips(v: number) {
    let set: ChipDef[] = [];
    try {
      set = getChipSet(getDefaultChipSetId())?.chips ?? [];
    } catch {}
    const chips = set.filter((c) => c.value > 0).sort((a, b) => b.value - a.value);
    if (!chips.length || !(v > 0) || v / chips[0].value > 999) return null;
    let left = v;
    const rows: { chip: ChipDef; n: number }[] = [];
    for (const chip of chips) {
      const n = Math.floor(+(left / chip.value).toFixed(6));
      if (n <= 0) continue;
      rows.push({ chip, n });
      left = +(left - n * chip.value).toFixed(4);
    }
    return rows.length ? { rows, left } : null;
  }

  // one number takes the place of what's being typed; a whole sum ("(20+5)*8") is typed in
  function onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData("text") ?? "";
    e.preventDefault();
    const n = parseNumber(text);
    if (n !== null ? use(n) : feed(text)) play("card");
    else play("off");
  }

  // the last number box on the page that had focus: = can go straight into it
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
  function keepFocus(e: PointerEvent) {
    checkField();
    if (!panel?.contains(document.activeElement) && !(e.target as Element).closest("button")) panel?.focus({ preventScroll: true });
  }

  const big = $derived(shown());
  // brackets still open, shown faintly at the end: they close themselves at =
  const closing = $derived(sum.done || sum.error ? "" : ")".repeat(openParens()));
  const ans = $derived(sum.tape[0]);
  const top = $derived(sum.done ? sum.said : ans ? `Ans = ${fmt(ans.value)}` : "");
  const pre = $derived(preview());
  const paid = $derived(sum.done && !calc.small ? inChips(Number(sum.entry)) : null);
  const paidText = $derived(
    paid ? paid.rows.map((r) => `${r.n} × ${fmt(r.chip.value)}`).join(", ") + (paid.left ? `, and ${fmt(paid.left)} over` : "") : ""
  );
  const lit = $derived(pendingOp());
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
    class:small={calc.small}
    style:translate="{px}px {py}px"
    style:rotate="{tilt}deg"
    role="dialog"
    aria-label="Calculator"
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
      title="Drag to move. Toss it and it slides."
    >
      <span class="name">Calculator</span>
      <span class="tools">
        <button
          class="icon-btn tool see"
          class:on={calc.ghost}
          data-sound={calc.ghost ? "off" : "on"}
          aria-pressed={calc.ghost}
          title={calc.ghost ? "Solid again" : "Ghost: see-through, and clicks go to the page underneath"}
          onclick={() => (calc.ghost = !calc.ghost)}><Icon icon={Ghost} label="Ghost" /></button
        >
        <button
          class="icon-btn tool"
          data-sound="none"
          aria-expanded={!calc.small}
          title={calc.small ? "Show the keys" : "Just the answer"}
          onclick={toggleSmall}><Icon icon={calc.small ? ChevronUp : ChevronDown} label={calc.small ? "Show keys" : "Hide keys"} /></button
        >
        <button class="icon-btn tool" data-sound="none" title="Close ({keyLabel(CALC_KEY)} opens it again)" onclick={closeCalc}
          ><Icon icon={X} label="Close" /></button
        >
      </span>
    </div>

    {#if sum.tape.length && !calc.small}
      <div class="tape" in:slide={reveal()} out:slide={leave()}>
        <div class="tape-head small muted">
          <span>History</span>
          <span class="tape-acts">
            {#if sum.tape.length > 1}<button class="link muted" data-sound="none" title="Add up every answer here" onclick={total}>Add Up</button>{/if}
            <button class="link muted" data-sound="none" title="Copy the history as text" onclick={() => copy("tape")}>{copied === "tape" ? "Copied" : "Copy"}</button>
            <button class="link muted" data-sound="swish" onclick={clearTape}>Clear</button>
          </span>
        </div>
        <div class="lines" aria-label="Earlier answers">
          {#each sum.tape as t, i (i + t.expr)}
            <div class="line">
              <button class="expr" data-sound="none" title="Change this sum" onclick={() => again(t.expr)}>{t.expr}</button>
              <button class="val num" data-sound="card" title="Use {fmt(t.value)}" onclick={() => useAnswer(t.value)}>{fmt(t.value)}</button>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="screen" class:err={!!sum.error} class:done={sum.done}>
      <div class="top num" title={top}><span dir="ltr">{top || " "}</span></div>
      <output class="big num" style:font-size="{bigSize}px" aria-live="polite"
        ><span dir="ltr">{big}<span class="closing" aria-hidden="true">{closing}</span></span></output
      >
      <div class="under">
        <span class="acts">
          <button class="link muted small" data-sound="none" onclick={() => copy()} disabled={current() === null} title="Copy ({keyLabel('Mod+C')})"
            ><Icon icon={Copy} size="1em" /><span>{copied === "answer" ? "Copied" : "Copy"}</span></button
          >
          {#if field}
            <button class="link small into" data-sound="drop" onclick={putIn} disabled={current() === null} title="Put {current() === null ? 'it' : fmt(current()!)} in {fieldName || 'that box'}"
              ><Icon icon={ArrowRightToLine} size="1em" /><span>{fieldName ? `Into ${fieldName}` : "Into the Box"}</span></button
            >
          {/if}
        </span>
        {#if paid}
          <!-- after =, where the running total was: the answer as a stack you could hand over -->
          <span class="paid" role="note" aria-label="In chips: {paidText}" title="In chips: {paidText}">
            {#each paid.rows as r (r.chip.id)}
              <span class="with-icon"><Chip chip={r.chip} size={15} text="" /><span class="num">×{r.n}</span></span>
            {/each}
            {#if paid.left}<span class="num muted">+{fmt(paid.left)}</span>{/if}
          </span>
        {:else}
          <span class="pre num">{pre === null ? "" : `= ${fmt(pre)}`}</span>
        {/if}
      </div>
    </div>

    {#if !calc.small}
      <div class="keys" in:slide={reveal()} out:slide={leave()}>
        {#each KEYS as k (k.id)}
          <button
            class="k {k.kind}"
            class:wide={k.wide}
            class:tall={k.tall}
            class:lit={lit === k.id}
            data-k={k.id}
            data-sound={k.kind === "eq" ? "none" : k.id === "clear" ? (clearsAll() ? "swish" : "soft") : k.kind === "op" ? "tap" : "key"}
            aria-label={k.aria}
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
  .tape,
  .screen,
  .keys,
  .name {
    transition: opacity var(--dur-move) var(--ease-out);
  }
  .ghost :is(.tape, .screen, .keys, .name, .tool:not(.see)) {
    opacity: 0.3;
  }
  .calc.ghost .bar {
    border-color: transparent;
  }
  .calc.ghost .see {
    pointer-events: auto;
    background: var(--fg);
    color: var(--bg);
  }
  /* the bar is one control tall, its tools square in it */
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    height: var(--control-h);
    padding: 0 0 0 10px;
    border-bottom: var(--hair) solid var(--line);
    cursor: grab;
    touch-action: none;
    user-select: none;
  }
  .held .bar {
    cursor: grabbing;
  }
  .name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--fs-sm);
    color: var(--muted);
    white-space: nowrap;
  }
  .tools {
    display: flex;
  }
  .tool.on {
    color: var(--fg);
    background: var(--block-2);
  }
  /* the answers so far, newest at the bottom, like a till roll */
  .tape {
    border-bottom: var(--hair) solid var(--line);
  }
  .tape-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 4px 10px 0;
    font-size: var(--fs-xs);
  }
  .lines {
    display: flex;
    flex-direction: column-reverse;
    /* on a short screen the history gives way first, then the keys */
    max-height: clamp(26px, calc(100dvh - 500px), 104px);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    padding: 2px 0 4px;
  }
  .tape-acts {
    display: flex;
    gap: 10px;
  }
  /* a line on the tape is two targets: the sum (bring it back to change) and
     its answer (use it in this one) */
  .line {
    flex: none;
    display: flex;
    align-items: stretch;
    min-height: 26px;
    font-size: var(--fs-sm);
  }
  .line button {
    height: auto;
    padding: 3px 10px;
    background: none;
    border: 0;
    font-size: inherit;
    transition: background-color var(--dur-hover) var(--ease-out);
  }
  .line button:hover {
    background: var(--block);
  }
  .line .expr {
    display: block;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    color: var(--muted);
  }
  .line .expr:hover {
    color: var(--fg);
  }
  .line .val {
    flex: none;
    font-weight: bold;
  }
  .screen {
    padding: 8px 12px 8px;
    text-align: right;
  }
  /* long lines keep their end in view */
  .top,
  .big {
    overflow: hidden;
    white-space: nowrap;
    direction: rtl;
  }
  .top {
    height: 18px;
    font-size: var(--fs-sm);
    color: var(--muted);
    text-overflow: ellipsis;
  }
  .big {
    display: block;
    height: 44px;
    line-height: 44px;
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
    font-size: 20px !important;
    letter-spacing: 0;
  }
  .under {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 4px 8px;
    min-height: 20px;
    font-size: var(--fs-sm);
  }
  .acts {
    display: flex;
    gap: 12px;
    min-width: 0;
  }
  .into {
    min-width: 0;
  }
  .into span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* what it comes to so far, in the answer's own ink, quieter */
  .pre {
    white-space: nowrap;
    font-size: 13px;
    color: var(--muted);
  }
  /* the answer in chips, right under it: small stacks with a count each */
  .paid {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 8px;
    margin-left: auto;
    font-size: var(--fs-xs);
    animation: land 320ms var(--ease-out-expo);
  }
  /* the keypad: one sheet ruled into keys by hairlines */
  .keys {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: clamp(32px, calc((100dvh - 190px) / 6), 44px);
    gap: var(--hair);
    background: var(--line);
    border-top: var(--hair) solid var(--line);
  }
  .k {
    height: auto;
    padding: 0;
    border: 0;
    font-size: 18px;
    font-family: var(--font-mono);
    background: var(--field);
    transition:
      background-color var(--dur-hover) var(--ease-out),
      color var(--dur-hover) var(--ease-out);
  }
  .k:hover {
    background: var(--block);
  }
  .k:active,
  .k:global(.down) {
    background: var(--block-3);
    transform: none;
  }
  .k.wide {
    grid-column: span 2;
  }
  .k.tall {
    grid-row: span 2;
  }
  .k.fn {
    font-size: 15px;
    color: var(--muted);
    background: var(--block);
  }
  .k.fn:hover {
    color: var(--fg);
    background: var(--block-2);
  }
  .k.fn:active,
  .k.fn:global(.down) {
    background: var(--block-3);
  }
  .k.op {
    font-size: 20px;
    background: var(--block);
  }
  .k.op:hover {
    background: var(--block-2);
  }
  /* the operator waiting for its next number stays lit */
  .k.op.lit {
    background: var(--fg);
    color: var(--bg);
  }
  .k.eq {
    font-size: 24px;
    background: var(--felt);
    color: var(--felt-fg);
  }
  .k.eq:hover {
    background: oklch(from var(--felt) calc(l + 0.04) c h);
  }
  .k.eq:active,
  .k.eq:global(.down) {
    background: oklch(from var(--felt) calc(l - 0.03) c h);
  }
  /* on a phone the keys get finger-sized */
  @media (pointer: coarse) {
    .calc {
      width: 288px;
    }
    .keys {
      grid-auto-rows: clamp(38px, calc((100dvh - 210px) / 6), 52px);
    }
    .line {
      min-height: 34px;
    }
    .tape-acts {
      gap: 14px;
    }
  }
  /* a phone on its side is too short for finger-sized keys: they give a little,
     so the bottom row is still on the screen */
  @media (pointer: coarse) and (max-height: 500px) {
    .keys {
      grid-auto-rows: clamp(30px, calc((100dvh - 150px) / 6), 38px);
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
