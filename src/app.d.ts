// See https://kit.svelte.dev/docs/types#app

declare global {
  namespace App {
    interface Platform {
      env: {};
      context: {
        waitUntil(promise: Promise<unknown>): void;
      };
      caches: CacheStorage & { default: Cache };
    }
  }
}

export {};
