// the command palette's menu. pages and components add their own commands while
// they're on screen (the dealer screen adds Bust Mike, Next Level…) and take
// them away when they leave.
export interface Command {
  id: string;
  label: string;
  /** a heading to group under: Go To, This Game, Players… */
  group: string;
  /** extra words to match on */
  keywords?: string;
  /** shown on the right: a shortcut or a value */
  hint?: string;
  run: () => void;
}

/** a command that takes what was typed, like "Add Player: Mike" */
export interface Prompted {
  id: string;
  /** "Add Player" becomes "Add Player: <what you typed>" */
  label: string;
  group: string;
  /** what to type, shown before anything is: "a name" */
  prompt: string;
  run: (text: string) => void;
}

const sources = $state<Record<string, () => (Command | Prompted)[]>>({});

/** add commands while something is mounted. call inside an $effect; returns the cleanup. */
export function provide(key: string, list: () => (Command | Prompted)[]) {
  sources[key] = list;
  return () => {
    if (sources[key] === list) delete sources[key];
  };
}

export const allCommands = () => Object.values(sources).flatMap((f) => f());
export const isPrompted = (c: Command | Prompted): c is Prompted => "prompt" in c;

export const palette = $state({
  open: false,
  /** settings is recording a new shortcut, so the palette leaves keys alone */
  recording: false,
});
