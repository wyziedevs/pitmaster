// everything lives in this browser, encrypted, so the app renders client-side
// only, and only once what's saved has been opened (or found locked)
import { error } from "@sveltejs/kit";
import { startVault } from "$lib/lock.svelte";

export const ssr = false;
export const prerender = false;

export const load = async () => {
  try {
    await startVault();
  } catch {
    // the browser's storage didn't answer (a key that doesn't fit is handled
    // inside, as unreadable): nothing was changed, so another try may do it
    error(503, "This browser's storage didn't answer just now. Nothing saved was changed. Reload the page to try again.");
  }
};
