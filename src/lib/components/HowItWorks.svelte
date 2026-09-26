<script lang="ts">
  // the four steps from nothing to a game on the tv. the welcome on a first
  // visit (Intro.svelte) and the help page both show them.
  import Icon from "./Icon.svelte";
  import Coins from "@lucide/svelte/icons/coins";
  import Timer from "@lucide/svelte/icons/timer";
  import Tv from "@lucide/svelte/icons/tv";
  import Smartphone from "@lucide/svelte/icons/smartphone";

  /** deal: the steps come in one after another, like cards */
  let { deal = false }: { deal?: boolean } = $props();
</script>

<ol class="steps" class:deal>
  <li style:--i={0}>
    <span class="tile" aria-hidden="true"><Icon icon={Coins} /></span>
    <div>
      <b>Set Up Your Chips</b>
      <p>Start from a common set, or <a href="/settings#chips">match the chips you play with</a>: colors, values and how many of each.</p>
    </div>
  </li>
  <li style:--i={1}>
    <span class="tile" aria-hidden="true"><Icon icon={Timer} /></span>
    <div>
      <b>Make a Game</b>
      <p>A <a href="/new?type=cash">Cash Game</a> (blinds, buy-ins and a settle-up at the end) or a <a href="/new?type=tournament">Tournament</a> (a blind clock sized to your time, payouts and rebuys).</p>
    </div>
  </li>
  <li style:--i={2}>
    <span class="tile" aria-hidden="true"><Icon icon={Tv} /></span>
    <div>
      <b>Put It on the TV</b>
      <p>Hit <b>Open TV Window</b> and drag it onto the TV. Or hit <b>Go Live</b>, open <code>{location.host}/live</code> on any screen and type the code.</p>
    </div>
  </li>
  <li style:--i={3}>
    <span class="tile" aria-hidden="true"><Icon icon={Smartphone} /></span>
    <div>
      <b>Run It From Your Seat</b>
      <p>Deal from your laptop or phone. The TV keeps up by itself.</p>
    </div>
  </li>
</ol>

<style>
  .steps {
    list-style: none;
    counter-reset: step;
    display: grid;
    gap: 14px;
    margin: 0;
    padding: 0;
  }
  li {
    counter-increment: step;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }
  /* the step's icon in a square, its number tucked into the corner */
  .tile {
    position: relative;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: var(--hair) solid var(--line-strong);
    background: var(--field);
    font-size: 17px;
  }
  .tile::after {
    content: counter(step);
    position: absolute;
    right: -7px;
    bottom: -7px;
    display: grid;
    place-items: center;
    width: 17px;
    height: 17px;
    font: bold 10px/1 var(--font-mono);
    background: var(--fg);
    color: var(--bg);
  }
  b {
    display: block;
  }
  p {
    margin: 2px 0 0;
    max-width: 62ch;
  }
  p b {
    display: inline;
  }
  /* dealt in, one after another, then the icon gives a little nod. (its own
     name: app.css has a "dealt" of its own for the seat labels) */
  .deal li {
    animation: step-in 460ms var(--ease-out-expo) calc(160ms + var(--i) * 90ms) backwards;
  }
  .deal .tile {
    animation: nod var(--dur-settle) var(--ease-out-expo) calc(380ms + var(--i) * 90ms) backwards;
  }
  @keyframes step-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  @keyframes nod {
    from {
      transform: rotate(-14deg) scale(0.8);
    }
  }
</style>
