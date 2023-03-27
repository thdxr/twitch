type QueueCallback = () => Promise<void>;

export function createQueue() {
  const queue = new Array<QueueCallback>();

  let pending = false;
  async function trigger() {
    if (pending) return;
    const cb = queue.shift();
    if (!cb) return;
    pending = true;
    await cb();
    pending = false;
    trigger();
  }

  return {
    add: (cb: QueueCallback) => {
      queue.push(cb);
      trigger();
    },
  };
}
