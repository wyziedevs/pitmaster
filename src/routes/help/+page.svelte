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

<DocPage title="Help" sub="How PitMaster works, what it can do, and where your games live." other={{ href: "/privacy", label: "Privacy Policy" }}>
  <nav class="jump links small" aria-label="On this page">
    <a href="#start">Getting Started</a>
    <a href="#dealing">Running a Game</a>
    <a href="#tv">The TV</a>
    <a href="#calculator">Calculator</a>
    <a href="#keys">Shortcuts</a>
    <a href="#data">Your Data</a>
  </nav>

  <section id="start">
    <h2>Getting Started</h2>
    <HowItWorks />
    {#if !settings.intro}
      <p class="small again">
        <button class="link" data-sound="open" onclick={welcomeBack}><Icon icon={Sparkles} size="1em" />Show the Welcome on the Home Page Again</button>
      </p>
    {/if}
  </section>

  <section id="dealing">
    <h2>Running a Game</h2>
    <h3>Cash Games</h3>
    <p>
      Set the blinds and buy-in range, then add players as they sit down. Rebuys and cash-outs are a tap each,
      and the bank keeps count of every chip on the table. When the night's over, Settle Up works out who pays whom, with
      Venmo, Cash App and PayPal links if you want them.
    </p>
    <h3>Tournaments</h3>
    <p>
      Pick how long you want to play and PitMaster builds the blind structure to fit: starting stacks, breaks, antes,
      rebuys, add-ons and bounties. Bust players as they go and the payouts, average stack and table balancing follow along. At
      the final table the deal calculator splits the prize pool by chip count or ICM.
    </p>
    <h3>Do Anything by Name</h3>
    <p>
      Press <Kbd k={paletteKey} /> anywhere to open Commands. Type what you want, like “next level”, “bust mike” or
      “new tournament”, and press Enter. Mistakes happen at every table: <kbd>{keyLabel("Mod")} Z</kbd> undoes the last
      change on the dealer screen.
    </p>
    <h3>Every Game Is Different</h3>
    <p>
      Rake, house cut, bounties, rebuys, seating, deals and pay links each have their own switch in
      <a href="/settings">Settings</a>, so a quiet kitchen game and a forty-player tournament each take only what they need.
    </p>
  </section>

  <section id="tv">
    <h2>The TV</h2>
    <p>
      There are two ways to put the game on a big screen. On a laptop hooked up to the TV, hit <b>Open TV Window</b> on
      the dealer screen and drag the window onto the TV. For any other screen (a smart TV's browser, a tablet, someone's
      phone), hit <b>Go Live</b>, then open <a href="/live">{location.host}/live</a> on that screen and type the
      8-character code.
    </p>
    <p>
      The TV shows the clock, blinds, payouts and messages you send the table, and keeps up by itself. It can't change
      anything, and a live game is end-to-end encrypted on its way there. Press <kbd>F</kbd> on the TV for full screen and
      <kbd>S</kbd> for sound.
    </p>
  </section>

  <section id="calculator">
    <h2>Calculator</h2>
    <p>
      Press <kbd>{keyLabel(CALC_KEY)}</kbd> on any page{#if unlocked}, or <button class="link" data-sound="none" onclick={openCalc}>open it now</button>{/if}.
      It floats over the page, so you can drag it out of the way, shrink it to just the answer, or turn on Ghost to see
      through it and click the page underneath.
    </p>
    <ul>
      <li>Type sums straight from the keyboard. <Kbd k="Enter" /> gives the answer, <Kbd k="Esc" /> clears, and <Kbd k="Backspace" /> takes back a digit.</li>
      <li>It does × and ÷ before + and −, like on paper, and brackets work too: <code>(20 + 5) × 8</code>.</li>
      <li>Percent works like a till: <code>200 + 10%</code> is 220.</li>
      <li>Type <Kbd k="K" /> or <Kbd k="M" /> after a number for thousands or millions, so a stack is quick to type: <code>25k × 8</code>.</li>
      <li>
        After <Kbd k="Enter" />, the answer also shows in chips from your chip set, the fewest that make it, so you know what to
        hand over.
      </li>
      <li>
        Every answer goes in the history. Click a sum to change it, or its answer to use it. <Kbd k="↑" /> and <Kbd k="↓" />
        step through the answers, <b>Add Up</b> totals them all (a night's cash-outs, say), and <b>Copy</b> takes the lot as text.
      </li>
      <li><b>Into</b> puts the answer in the last number box you were in, like a buy-in or a chip count.</li>
      <li>Nothing typed into it is ever saved.</li>
    </ul>
  </section>

  <section id="keys">
    <h2>Shortcuts</h2>
    <p class="small muted">None of these fire while you're typing in a box. The Commands shortcut can be changed in <a href="/settings#keys">Settings</a>.</p>
    <KeyList commands />
  </section>

  <section id="data">
    <h2>Your Data</h2>
    <h3>Where Are My Games Saved?</h3>
    <p>
      In this browser, on this device, encrypted. There are no accounts, so nobody else has a copy, us included. Add a
      passcode in <a href="/settings#lock">Settings</a> and nothing opens without it.
    </p>
    <h3>Does It Work Offline?</h3>
    <p>Yes. Once it's opened in a browser, PitMaster loads and runs there with no connection, TV window included. Only Go Live needs one, on both screens.</p>
    <h3>How Do I Move to Another Device?</h3>
    <p>
      <a href="/settings#data">Export</a> everything to a file, then import it on the other device. A single game can move
      too: <b>Move to Another Device</b> is on its dealer screen, and it carries on there, TV code and all.
    </p>
    <h3>What If I Clear My Browser?</h3>
    <p>Clearing this site's data deletes what's saved here for good, so export first if you want to keep it.</p>
    <h3>Does It Cost Anything?</h3>
    <p>
      No. PitMaster is free, with no ads and no tracking, and its code is open source on
      <a href="https://github.com/wyziedevs/pitmaster" target="_blank" rel="noopener">GitHub</a>. The <a href="/privacy">Privacy</a> page has the details.
    </p>
    <h3>Something's Not Right?</h3>
    <p>
      Tell us at <a href="https://wyzie.io/contact" target="_blank" rel="noopener">wyzie.io/contact</a>, or open an issue on
      <a href="https://github.com/wyziedevs/pitmaster/issues" target="_blank" rel="noopener">GitHub</a>. Please don't send anything from your games; we never
      need it.
    </p>
  </section>
</DocPage>

<style>
  section {
    scroll-margin-top: var(--head, 0px);
  }
  .again {
    margin-top: 16px;
  }
</style>
