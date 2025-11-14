// Simple texture manager for preloading image sprites and retrieving by key (url or alias)
export const TextureManager = {
  _map: new Map(),
  _promises: [],

  /**
   * load(list)
   * list: array of { key?: string, url: string } or strings (url)
   * returns a Promise that resolves when all requested images are loaded (or errored).
   */
  load(list = []) {
    const items = Array.isArray(list) ? list : [list];
    const promises = items.map(it => {
      const url = (typeof it === 'string') ? it : it.url;
      const key = (typeof it === 'string') ? it : (it.key || it.url);
      if (this._map.has(key)) return Promise.resolve(this._map.get(key));

      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this._map.set(key, img);
          resolve(img);
        };
        img.onerror = () => {
          // store null marker to avoid reattempt storms
          this._map.set(key, null);
          resolve(null);
        };
        img.src = url;
      });
    });

    const p = Promise.all(promises);
    this._promises.push(p);
    return p;
  },

  /**
   * getTexture(key)
   * returns Image or null if failed / not loaded
   */
  getTexture(key) {
    return this._map.get(key) || null;
  },

  /**
   * ready()
   * returns a Promise that resolves when all outstanding loads (since app start) complete
   */
  ready() {
    return Promise.all(this._promises);
  },

  /**
   * unload(key)
   * remove a cached texture
   */
  unload(key) {
    this._map.delete(key);
  },

  /**
   * clear()
   * clears all cached textures and pending promises
   */
  clear() {
    this._map.clear();
    this._promises.length = 0;
  }
};

export default TextureManager;