// pure clock math. the saved clock is an "anchor"; every screen derives the live
// level + time from it, so the tv stays right even if the dealer tab is closed.
import type { Clock, ClockStatus, Game, Level } from "./types";

export const STATUS_LABEL: Record<ClockStatus, string> = { idle: "Not Started", running: "Running", paused: "Paused" };

export const newClock = (): Clock => ({
  status: "idle",
  levelIndex: 0,
  levelElapsedMs: 0,
  elapsedMs: 0,
  anchorAt: null,
  startedAt: null,
});

const isRunning = (c: Clock) => c.status === "running";

export interface Derived {
  index: number;
  level: Level;
  /** the level's number for the screens: on a break, the level just played */
  levelNum: number;
  next: Level | null;
  elapsedMs: number;
  remainingMs: number;
  progress: number;
  nextBreakInMs: number | null;
  totalElapsedMs: number;
  finished: boolean;
}

export function derive(game: Game, now = Date.now()): Derived {
  const levels = game.levels;
  const c = game.clock;
  let i = Math.max(0, Math.min(c.levelIndex, levels.length - 1));
  let e = c.levelElapsedMs + (isRunning(c) && c.anchorAt ? now - c.anchorAt : 0);
  let finished = false;

  while (i < levels.length && e >= levels[i].minutes * 60000) {
    e -= levels[i].minutes * 60000;
    i++;
  }
  if (i >= levels.length) {
    i = levels.length - 1;
    e = levels[i].minutes * 60000;
    finished = true;
  }

  const level = levels[i];
  const levelNum = level.isBreak ? levels.slice(0, i).filter((l) => !l.isBreak).length : (level.num ?? 0);
  const levelMs = level.minutes * 60000;
  const remainingMs = Math.max(0, levelMs - e);

  let next: Level | null = null;
  let nextBreakInMs: number | null = null;
  let acc = remainingMs;
  for (let j = i + 1; j < levels.length; j++) {
    if (levels[j].isBreak) nextBreakInMs ??= acc;
    else next ??= levels[j];
    if (next && nextBreakInMs !== null) break;
    acc += levels[j].minutes * 60000;
  }

  let totalElapsedMs = e;
  for (let j = 0; j < i; j++) totalElapsedMs += levels[j].minutes * 60000;

  return { index: i, level, levelNum, next, elapsedMs: e, remainingMs, progress: levelMs ? e / levelMs : 0, nextBreakInMs, totalElapsedMs, finished };
}

/** freeze the derived position back into the anchor */
function commit(game: Game, now: number) {
  const d = derive(game, now);
  game.clock.levelIndex = d.index;
  game.clock.levelElapsedMs = d.elapsedMs;
  game.clock.anchorAt = isRunning(game.clock) ? now : null;
  return d;
}

export function start(game: Game, now = Date.now()) {
  commit(game, now);
  game.clock.status = "running";
  game.clock.anchorAt = now;
  game.clock.startedAt ??= now;
}

export function pause(game: Game, now = Date.now()) {
  commit(game, now);
  game.clock.status = "paused";
  game.clock.anchorAt = null;
}

export const toggle = (game: Game, now = Date.now()) => (isRunning(game.clock) ? pause(game, now) : start(game, now));

export function jump(game: Game, index: number, now = Date.now()) {
  commit(game, now);
  game.clock.levelIndex = Math.max(0, Math.min(index, game.levels.length - 1));
  game.clock.levelElapsedMs = 0;
  if (isRunning(game.clock)) game.clock.anchorAt = now;
}

/** "back" more than 5s into a level restarts it; otherwise goes to the previous level */
export function step(game: Game, delta: number, now = Date.now()) {
  const d = commit(game, now);
  if (delta < 0 && d.elapsedMs > 5000) return jump(game, d.index, now);
  jump(game, d.index + delta, now);
}

/** positive ms = more time on the clock */
export function addTime(game: Game, ms: number, now = Date.now()) {
  commit(game, now);
  game.clock.levelElapsedMs = Math.max(0, game.clock.levelElapsedMs - ms);
}

// ---------- cash session clock ----------

export const cashElapsed = (game: Game, now = Date.now()) =>
  game.clock.elapsedMs + (isRunning(game.clock) && game.clock.anchorAt ? now - game.clock.anchorAt : 0);

export function cashToggle(game: Game, now = Date.now()) {
  const c = game.clock;
  if (isRunning(c)) {
    c.elapsedMs = cashElapsed(game, now);
    c.status = "paused";
    c.anchorAt = null;
  } else {
    c.status = "running";
    c.anchorAt = now;
    c.startedAt ??= now;
  }
}
