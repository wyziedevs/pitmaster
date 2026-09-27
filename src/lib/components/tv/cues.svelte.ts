// every sound on the tv comes with something to see. a tv's speakers are
// often off, muted or down the hall, so nothing may rely on sound alone:
// cue() plays the sound (when it's on) and flares the edge of the screen in
// the moment's color (yellow: level, money, the host; red: busts, warnings,
// the countdown; green: breaks; chalk: chips, cards). news() is a moment the
// room should catch: a toast, its cue, and (with the announcer on) the words.
import type { EventKind } from "$lib/types";
import { play, sounds, resumeAudio, audioReady, speak } from "$lib/sound";
import { prefs } from "$lib/settings.svelte";
import Trophy from "@lucide/svelte/icons/trophy";
import Skull from "@lucide/svelte/icons/skull";
import Coins from "@lucide/svelte/icons/coins";
import Shuffle from "@lucide/svelte/icons/shuffle";
import HandCoins from "@lucide/svelte/icons/hand-coins";
import Handshake from "@lucide/svelte/icons/handshake";
import Armchair from "@lucide/svelte/icons/armchair";
import Megaphone from "@lucide/svelte/icons/megaphone";
import Gift from "@lucide/svelte/icons/gift";
import Bomb from "@lucide/svelte/icons/bomb";
import Spade from "@lucide/svelte/icons/spade";
import Crown from "@lucide/svelte/icons/crown";
import Layers from "@lucide/svelte/icons/layers";
import Dices from "@lucide/svelte/icons/dices";

export const BANNER = "var(--tv-banner)";
export const HOT = "var(--tv-hot)";
export const GOOD = "var(--tv-good)";
const CHALK = "var(--tv-fg)";

/**
 * every announcement has a kind, set by whatever raised it (game.ts, or a
 * dealer-screen control): its toast's icon, how it arrives, and what the room
 * hears. `big`: it has its own moment on the board (a win or a deal takes the
 * whole screen, a dice call has kinds/dice/Board.svelte), so a toast would
 * only cover it. `after`: how long the words wait for the sound.
 */
export const NEWS: Record<EventKind, { icon: typeof Trophy; sound: () => void; color: string; n: number; big?: boolean; after?: number }> = {
  win: { icon: Trophy, sound: sounds.ship, color: BANNER, n: 4, big: true, after: 2200 },
  deal: { icon: Handshake, sound: sounds.money, color: BANNER, n: 3, big: true, after: 1400 },
  money: { icon: HandCoins, sound: sounds.money, color: GOOD, n: 3, after: 1400 },
  bounty: { icon: Gift, sound: sounds.money, color: BANNER, n: 3 },
  bust: { icon: Skull, sound: sounds.bust, color: HOT, n: 2 },
  chips: { icon: Coins, sound: sounds.chips, color: BANNER, n: 2 },
  rack: { icon: Coins, sound: sounds.rack, color: CHALK, n: 2 },
  shuffle: { icon: Shuffle, sound: sounds.shuffle, color: CHALK, n: 2 },
  draw: { icon: Shuffle, sound: sounds.shuffle, color: CHALK, n: 2 },
  bomb: { icon: Bomb, sound: sounds.bust, color: HOT, n: 3 },
  sevenTwo: { icon: Spade, sound: sounds.chips, color: BANNER, n: 2 },
  highHand: { icon: Crown, sound: sounds.chime, color: BANNER, n: 3 },
  game: { icon: Layers, sound: sounds.shuffle, color: BANNER, n: 3 },
  liar: { icon: Dices, sound: sounds.bust, color: HOT, n: 3, big: true },
  seat: { icon: Armchair, sound: sounds.ding, color: CHALK, n: 2 },
  note: { icon: Megaphone, sound: sounds.ding, color: BANNER, n: 2 },
};

export class Cues {
  // sound starts on if the host said so; the browser still wants one click
  // before it lets a page make noise, so until then the button asks for it.
  // (even asking makes the browser grumble before that first click, so it waits)
  soundOn = $state(prefs().tvSound);
  audioOk = $state(false);
  flare = $state<{ color: string; n: number; key: number } | null>(null);
  toast = $state<{ text: string; kind: EventKind; at: number } | null>(null);
  #flareTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    $effect(() => {
      if (this.soundOn && navigator.userActivation?.hasBeenActive) this.audioOk = audioReady();
    });
  }

  /** the host can have the tv read the big moments out */
  get voice() {
    return this.soundOn && prefs().tvVoice;
  }

  cue(sound: () => void, color: string, n = 2) {
    if (this.soundOn) sound();
    const key = performance.now();
    this.flare = { color, n, key };
    clearTimeout(this.#flareTimer);
    this.#flareTimer = setTimeout(() => this.flare?.key === key && (this.flare = null), n * 720 + 200);
  }

  /** words for the room, after `wait` ms (with the announcer on) */
  say(text: string, wait: number) {
    if (this.voice) speak(text, wait);
  }

  news(text: string, kind: EventKind, at = Date.now()) {
    const n = NEWS[kind];
    if (!n.big) this.toast = { text, kind, at };
    this.cue(n.sound, n.color, n.n);
    this.say(text, n.after ?? 800);
    setTimeout(() => this.toast?.at === at && (this.toast = null), 7000);
  }

  /** a click or a key: the browser now lets the sound play */
  async wake() {
    if (this.soundOn && !this.audioOk) this.audioOk = await resumeAudio();
  }

  async on() {
    this.soundOn = true;
    this.audioOk = await resumeAudio();
    sounds.ding();
  }

  off() {
    this.soundOn = false;
    play("off");
  }
}
