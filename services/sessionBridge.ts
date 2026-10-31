
type SessionExpiredHandler = () => Promise<void> | void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let expirationPromise: Promise<void> | null = null;

export function registerSessionExpiredHandler(
  handler: SessionExpiredHandler
): () => void {
  sessionExpiredHandler = handler;

  return () => {
    if (sessionExpiredHandler === handler) {
      sessionExpiredHandler = null;
    }
  };
}

export function handleSessionExpired(): Promise<void> {
  if (expirationPromise) {
    return expirationPromise;
  }

  expirationPromise = (async () => {
    try {
      console.log("[AUTH] Refresh failed; redirecting to Login.");
      await sessionExpiredHandler?.();
    } catch (error) {
      console.error("[AUTH] Session expiration handler failed:", error);
    }
  })().finally(() => {
    expirationPromise = null;
  });

  return expirationPromise;
}
