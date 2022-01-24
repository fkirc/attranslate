export interface FileCache<T, A> {
  path: string;
  entries: Map<string, T>;
  auxData: A | null;
}

/**
 * We use format-caches to hold format-specific structures.
 * A general pattern is:
 * Prefer "same-file-caches" over other caches, and prefer newer caches over older caches.
 */
export class FormatCache<E, A> {
  constructor() {
    this.fileCaches = [];
  }
  private fileCaches: FileCache<E, A>[];
  findFileCache(path: string): FileCache<E, A> | null {
    return this.fileCaches.find((fileCache) => fileCache.path === path) ?? null;
  }
  insertFileCache(fileCache: FileCache<E, A>) {
    this.fileCaches.push(fileCache);
  }
  insert(args: { path: string; key: string; entry: E }) {
    let fileCache = this.findFileCache(args.path);
    if (!fileCache) {
      fileCache = { path: args.path, entries: new Map(), auxData: null };
      this.insertFileCache(fileCache);
    }
    fileCache.entries.set(args.key, args.entry);
  }
  lookup(args: { path: string; key: string }): E | null {
    const sameFileCache = this.findFileCache(args.path);
    if (sameFileCache) {
      const sameFileHit = sameFileCache.entries.get(args.key);
      if (sameFileHit !== undefined) {
        return sameFileHit;
      }
    }
    for (let idx = this.fileCaches.length - 1; idx >= 0; idx--) {
      const fileCache = this.fileCaches[idx];
      const hit = fileCache.entries.get(args.key);
      if (hit !== undefined) {
        return hit;
      }
    }
    return null;
  }
  lookupSameFileAuxdata(args: { path: string }): A | null {
    return this.findFileCache(args.path)?.auxData ?? null;
  }
  lookupAuxdata(args: { path: string }): A | null {
    const sameFileAuxdata = this.lookupSameFileAuxdata(args);
    if (sameFileAuxdata) {
      return sameFileAuxdata;
    }
    if (this.fileCaches.length) {
      return this.fileCaches[this.fileCaches.length - 1].auxData;
    }
    return null;
  }
  getOldestAuxdata(): A | null {
    if (!this.fileCaches.length) {
      return null;
    }
    return this.fileCaches[0].auxData;
  }
  purge() {
    this.fileCaches = [];
  }
}
