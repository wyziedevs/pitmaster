// keep the screen from dimming while `want` says so (where the browser allows it)
export function keepAwake(want: () => boolean) {
  $effect(() => {
    if (!want() || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let done = false;
    const grab = async () => {
      if (done || lock || document.visibilityState !== "visible") return;
      try {
        lock = await navigator.wakeLock.request("screen");
        lock.addEventListener("release", () => (lock = null));
        if (done) lock.release();
      } catch {}
    };
    grab();
    // the lock drops whenever the tab is hidden; take it back on return
    document.addEventListener("visibilitychange", grab);
    return () => {
      done = true;
      document.removeEventListener("visibilitychange", grab);
      lock?.release();
    };
  });
}
