export interface FileCache<T, A> {
  path: string;
  entries: Map<string, T>;
  auxData: A;
}

/**
 * We use format-caches to hold format-specific content that needs to be kept within files,
 * but is not part of the core-translation-process.
 * A general pattern is:
 * Prefer "same-file-caches" over all other caches, and prefer newer caches over older caches.
 */
export class FormatCache<E, A> {
  constructor() {
    this.fileCaches = [];
  }
  private readonly fileCaches: FileCache<E, A>[];
  private findFileCache(path: string): FileCache<E, A> | null {
    return this.fileCaches.find((fileCache) => fileCache.path === path) ?? null;
  }
  insertFileCache(fileCache: FileCache<E, A>) {
    this.fileCaches.push(fileCache);
  }
  // insert(args: { path: string; key: string; value: T }) {
  //   let fileCache = this.findFileCache(args.path);
  //   if (!fileCache) {
  //     fileCache = {};
  //     this.fileCaches.push({ path: args.path, entries: fileCache });
  //   }
  //   fileCache[args.key] = args.value;
  // }
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
  lookupAuxdata(args: { path: string }): A | null {
    const sameFileCache = this.findFileCache(args.path);
    if (sameFileCache) {
      return sameFileCache.auxData;
    }
    if (this.fileCaches.length) {
      return this.fileCaches[this.fileCaches.length - 1].auxData;
    }
    return null;
  }
}
