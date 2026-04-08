export function createPoller(fn, {
  initialDelay = 5000,
  maxDelay = 60000,
  factor = 2,
  jitter = 0.2,
  isActive = () => true,
  shouldStop = () => false,
  onError,
} = {}) {
  let timeout;
  let delay = initialDelay;

  async function tick() {
    if (!isActive() || shouldStop()) return;

    try {
      await fn();
      delay = initialDelay;
    } catch (e) {
      delay = Math.min(maxDelay, delay * factor);
      onError?.(e);
    }

    const jitterMs = delay * jitter * Math.random();
    timeout = setTimeout(tick, delay + jitterMs);
  }

  return {
    start() {
      if (!timeout) tick();
    },
    stop() {
      clearTimeout(timeout);
      timeout = null;
    },
  };
}
