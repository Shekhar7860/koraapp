class Node {
  constructor(key, value, next = null, prev = null) {
    this.key = key;
    this.value = value;
    this.next = next;
    this.prev = prev;
  }
}

export class LRUCache {
  constructor(max = 10) {
    this.max = max;
    this.cache = new Map();
  }

  read(key) {
    return this.get(key);
  }

  write(key, val) {
    return this.set(key, val);
  }

  get(key) {
    let item = this.cache.get(key);
    if (item) {
      // refresh key
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  remove(key) {
    try {
      this.cache.delete(key);
    } catch (e) {
      console.log('Error in remove cache by key =', key, e);
    }
  }

  set(key, val) {
    // refresh key
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size === this.max) {
      this.cache.delete(this.first());
    }
    this.cache.set(key, val);
  }

  first() {
    return this.cache.keys().next().value;
  }
}
