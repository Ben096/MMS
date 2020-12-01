const EventEmitter = require("events");

module.exports = class Batch extends EventEmitter {
  constructor(concurrency) {
    super();

    this.setConcurrency(concurrency);
    this._running = 0;
    this._total = 0;
    this._jobs = [];
    this._data = [];
  }

  setConcurrency(concurrency = Infinity) {
    this._concurrency = concurrency;
  }

  push(job) {
    this._total++;
    this._jobs.push(job);
  }

  start() {
    for (
      let i = this._running;
      i < this._concurrency && this._jobs.length;
      i++
    ) {
      this._next();
    }
  }

  _next() {
    this._running++;
    setTimeout(this._jobs.shift().bind(null, this._callback.bind(this)));
  }

  _callback(data) {
    this._running--;
    this._data.push(data);

    this.emit("progress", {
      total: this._total,
      running: this._running,
      pending: this._jobs.length,
      data: data
    });

    if (this._jobs.length) {
      this.start();
    } else if (!this._running) {
      this.emit("end", this._data);
    }
  }
};
