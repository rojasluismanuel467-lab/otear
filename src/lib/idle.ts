/**
 * Runs `task` when the browser is idle (or after `timeout` ms at most), so heavy but
 * non-essential work (a WebGL scene, a large chunk) does not compete with the first paint.
 * Returns a function that cancels it.
 */
export function whenIdle(task: () => void, timeout = 1200): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, Math.min(timeout, 300));
  return () => window.clearTimeout(id);
}
