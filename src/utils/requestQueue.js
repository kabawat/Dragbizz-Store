class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.queue = [];
    this.running = [];
    this.maxConcurrent = maxConcurrent;
  }

  async add(requestFn, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        priority,
        resolve,
        reject,
      });

      this.queue.sort((a, b) => b.priority - a.priority);
      this.process();
    });
  }

  async process() {
    if (this.running.length >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.running.push(item);

    try {
      const result = await item.requestFn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      const index = this.running.indexOf(item);
      if (index > -1) {
        this.running.splice(index, 1);
      }
      this.process();
    }
  }

  clear() {
    this.queue = [];
  }

  getQueueSize() {
    return this.queue.length;
  }

  getRunningCount() {
    return this.running.length;
  }

  setMaxConcurrent(max) {
    this.maxConcurrent = max;
  }
}

export const createRequestQueue = (maxConcurrent = 5) => {
  return new RequestQueue(maxConcurrent);
};

export const defaultQueue = createRequestQueue(5);
