// small confirmations at the bottom of the screen: "Backup saved", "Copied".
// for things that happened, not questions (those stay native confirm()).
import { play } from "./sound";

export type ToastKind = "ok" | "info" | "bad";
export const toasts = $state<{ id: number; text: string; kind: ToastKind }[]>([]);

let n = 0;
export function toast(text: string, kind: ToastKind = "ok") {
  const id = ++n;
  toasts.push({ id, text, kind });
  if (toasts.length > 3) toasts.shift();
  if (kind === "ok") play("success");
  if (kind === "bad") play("error");
  setTimeout(() => dismiss(id), kind === "bad" ? 5000 : 2600);
}

export function dismiss(id: number) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i >= 0) toasts.splice(i, 1);
}
