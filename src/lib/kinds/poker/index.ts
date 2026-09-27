// what the poker kinds (cash and tournaments) share: one new-game form. the
// same loader for both, so switching between them keeps what's typed in it.
export const pokerSetup = () => import("./Setup.svelte");
