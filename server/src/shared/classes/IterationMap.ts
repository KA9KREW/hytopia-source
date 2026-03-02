/**
 * A high-performance Map-like data structure optimized for frequent iteration.
 *
 * When to use: per-tick collections that are built, iterated, and cleared each frame.
 * Do NOT use for: long-lived maps with rare iteration; a standard Map is simpler.
 *
 * @remarks
 * IterationMap maintains both a Map for O(1) lookups and an Array for fast iteration,
 * eliminating the need for Array.from() calls and providing ~2x faster iteration
 * than Map.values(). Optimized for "build up, iterate, clear" usage patterns
 * common in game loops.
 *
 * Pattern: update via `IterationMap.set`, iterate with `IterationMap.valuesArray`, then `IterationMap.clear`.
 * Anti-pattern: mutating the map during `IterationMap.valuesArray` iteration.
 *
 * @example
 * ```typescript
 * const iterationMap = new IterationMap<number, string>();
 * iterationMap.set(1, 'hello');
 * iterationMap.set(2, 'world');
 *
 * // Fast O(1) lookup
 * const value = iterationMap.get(1);
 *
 * // Fast array iteration (no Map.values() overhead)
 * for (const item of iterationMap.valuesArray) {
 *   console.log(item);
 * }
 *
 * // Efficient bulk clear
 * iterationMap.clear();
 * ```
 *
 * **Category:** Utilities
 * @public
 */
export default class IterationMap<K, V> {
  /** @internal */
  private _map: Map<K, V> = new Map();
  
  /** @internal */
  private _values: V[] = [];
  
  /** @internal */
  private _isDirty: boolean = false;

  /**
   * Returns the number of key-value pairs in the IterationMap.
   *
   * **Category:** Utilities
   */
  public get size(): number {
    return this._map.size;
  }

  /**
   * Returns a readonly array of all values for fast iteration.
   * This is the key performance feature - use this instead of .values() for iteration.
   *
   * **Side effects:** Rebuilds the backing array when the map has changed.
   *
   * **Category:** Utilities
   */
  public get valuesArray(): readonly V[] {
    if (this._isDirty) {
      this._syncArray();
    }

    return this._values;
  }

  /**
   * Returns the value associated with the key, or undefined if the key doesn't exist.
   * @param key - The key to look up.
   * @returns The value associated with the key, or undefined.
   *
   * **Category:** Utilities
   */
  public get(key: K): V | undefined {

    return this._map.get(key);
  }

  /**
   * Sets the value for the key in the IterationMap.
   * @param key - The key to set.
   * @param value - The value to set.
   * @returns The IterationMap instance for chaining.
   *
   * **Side effects:** May mark the internal array as dirty.
   *
   * **Category:** Utilities
   */
  public set(key: K, value: V): this {
    const hadKey = this._map.has(key);
    this._map.set(key, value);
    
    if (!hadKey) {
      // New key - add to array immediately (hot path optimization)
      this._values.push(value);
    } else {
      // Existing key updated - mark dirty for lazy sync
      this._isDirty = true;
    }
    
    return this;
  }

  /**
   * Returns true if the key exists in the IterationMap.
   * @param key - The key to check.
   * @returns True if the key exists, false otherwise.
   *
   * **Category:** Utilities
   */
  public has(key: K): boolean {

    return this._map.has(key);
  }

  /**
   * Removes the key-value pair from the IterationMap.
   * @param key - The key to delete.
   * @returns True if the key existed and was deleted, false otherwise.
   *
   * **Side effects:** Marks the internal array as dirty.
   *
   * **Category:** Utilities
   */
  public delete(key: K): boolean {
    const existed = this._map.delete(key);
    
    if (existed) {
      this._isDirty = true;
    }
    
    return existed;
  }

  /**
   * Removes all key-value pairs from the IterationMap.
   * Highly optimized for the common "build up, iterate, clear" pattern.
   *
   * **Side effects:** Clears the backing map and value array.
   *
   * **Category:** Utilities
   */
  public clear(): void {
    this._map.clear();
    this._values.length = 0;
    this._isDirty = false;
  }

  /**
   * Executes a provided function once for each key-value pair.
   * @param callbackfn - Function to execute for each element.
   * @param thisArg - Value to use as this when executing callback.
   *
   * **Category:** Utilities
   */
  public forEach(callbackfn: (value: V, key: K, map: IterationMap<K, V>) => void, thisArg?: any): void {
    this._map.forEach((value, key) => {
      callbackfn.call(thisArg, value, key, this);
    });
  }

  /**
   * Returns an iterator for the keys in the IterationMap.
   * @returns An iterator for the keys.
   *
   * **Category:** Utilities
   */
  public keys(): IterableIterator<K> {
    return this._map.keys();
  }

  /**
   * Returns an iterator for the values in the IterationMap.
   * Note: For performance-critical iteration, use .valuesArray instead.
   * @returns An iterator for the values.
   *
   * **Category:** Utilities
   */
  public values(): IterableIterator<V> {
    return this._map.values();
  }

  /**
   * Returns an iterator for the key-value pairs in the IterationMap.
   * @returns An iterator for the entries.
   *
   * **Category:** Utilities
   */
  public entries(): IterableIterator<[K, V]> {
    return this._map.entries();
  }

  /**
   * Returns an iterator for the key-value pairs in the IterationMap.
   * @returns An iterator for the entries.
   *
   * **Category:** Utilities
   */
  public [Symbol.iterator](): IterableIterator<[K, V]> {
    return this._map[Symbol.iterator]();
  }

  /**
   * Synchronizes the values array with the map when needed.
   * @internal
   */
  private _syncArray(): void {
    this._values.length = 0;
    
    for (const value of this._map.values()) {
      this._values.push(value);
    }
    
    this._isDirty = false;
  }
}
