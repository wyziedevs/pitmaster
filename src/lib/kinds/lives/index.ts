// lives games: 31 (scat), screw your neighbor, knock-out whist, ship captain
// and crew, or the host's own. everyone starts with the same lives, each round
// takes some away, and the last one with any wins. they share liar's dice's
// last-one-standing engine (kinds/standing.ts) and its stakes.
import type { Game, LivesSettings } from "$lib/types";
import type { Kind } from "../kind";
import { isStakes, lastStandingKind } from "../lastStanding";
import { money } from "$lib/util";
import { id, list, maybe, num, obj, oneOf } from "$lib/shape";
import { livesState } from "./engine";
import { livesPreset } from "./presets";
import { t, tp } from "$lib/i18n";

/** a new game's setup for a preset, before the host changes it */
export const LIVES_DEFAULTS = (preset: LivesSettings["preset"] = "scat"): LivesSettings => ({
  preset,
  lives: livesPreset(preset).lives,
  stakes: { mode: "pot", buyIn: 5, payouts: [], payoutRound: 1, perDie: 1, perDieTo: "pot" },
});

const settings = (l: unknown) => obj(l) && oneOf("scat", "screw", "whist", "ship", "custom")(l.preset) && num(l.lives) && l.lives >= 1 && l.lives <= 50 && isStakes(l.stakes);
const round = (r: unknown) => obj(r) && obj(r.lost) && Object.entries(r.lost).every(([k, v]) => id(k) && num(v) && v >= 0 && v <= 50) && maybe(id)(r.winner) && num(r.at);

/** the game's name: the preset's, or (the host's own) just "Lives" */
export const presetName = (g: Game) => t(`common.kinds.lives.presets.${g.lives!.preset}`);

/** the stakes in words */
export function stakesLine(game: Game) {
  const s = game.lives!.stakes;
  if (s.mode === "pot") return t("gamePlay.dice.stakesPot", { buyIn: money(s.buyIn), pool: money(s.buyIn * game.players.length) });
  return t(s.perDieTo === "pot" ? "gamePlay.lives.stakesPerLifePot" : "gamePlay.lives.stakesPerLifeWinner", { amount: money(s.perDie) });
}

const shared = lastStandingKind({
  state: livesState,
  stakes: (game) => game.lives!.stakes,
  played: (game) => game.lifeRounds?.length ?? 0,
  left: (n) => tp("gamePlay.lives.livesLeft", n),
  lostColumn: () => t("gamePlay.lives.csvLivesLost"),
  setup: (game) => `${presetName(game)} · ${tp("gamePlay.lives.livesEach", game.lives!.lives)} · ${stakesLine(game)}`,
});

export const lives: Kind = {
  id: "lives",
  label: () => t("common.kinds.lives.label"),
  plural: () => t("common.kinds.lives.plural"),
  newLabel: () => t("common.kinds.lives.newLabel"),
  tabTitle: () => t("common.kinds.lives.label"),
  keywords: "31 scat screw your neighbor knock out whist ship captain crew elimination lives",
  poker: false,
  ranks: "place",
  Setup: () => import("./Setup.svelte"),
  Control: () => import("./Control.svelte"),
  Board: () => import("./Board.svelte"),
  check: (g) => settings(g.lives) && maybe(list(round))(g.lifeRounds),
  ...shared,
  summary: (game) => `${presetName(game)} · ${tp("toys.summary.players", game.players.length)} · ${stakesLine(game)}`,
  now: (game) => {
    const st = livesState(game);
    return t("gamePlay.lives.nowLine", { round: String((game.lifeRounds?.length ?? 0) + 1), left: tp("toys.summary.players", st.alive.length) });
  },
};
