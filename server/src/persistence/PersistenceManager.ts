import { SaveStatesClient } from '@hytopia.com/save-states';
import ErrorHandler from '@/errors/ErrorHandler';
import PlatformGateway from '@/networking/PlatformGateway';
import type Player from '@/players/Player';

/**
 * Manages persistence of player and global data.
 *
 * When to use: reading or writing persisted data shared across lobbies or per player.
 * Do NOT use for: per-tick state; cache data in memory and write back periodically.
 *
 * @remarks
 * This class is a singleton accessible with `PersistenceManager.instance`.
 * Convenience methods are also available on `Player` and `GameServer`.
 *
 * Pattern: load data on join, update in memory, and save on significant events.
 * Anti-pattern: calling persistence APIs every frame.
 *
 * **Category:** Persistence
 * @public
 */
export default class PersistenceManager {
  /**
   * Singleton instance.
   *
   * **Category:** Persistence
   */
  public static readonly instance: PersistenceManager = new PersistenceManager();

  private _saveStatesClient: SaveStatesClient;

  /** @internal */
  private constructor() {
    this._saveStatesClient = new SaveStatesClient();
  }
  
  /**
   * Get global data from the data persistence service.
   *
   * @remarks
   * **Empty data:** Returns `{}` if key exists but has no data.
   *
   * **Failure:** Returns `undefined` if fetch failed after retries.
   *
   * @param key - The key to get the data from.
   * @param maxRetries - The maximum number of retries to attempt in the event of failure.
   * @returns The data from the persistence layer.
   *
   * **Side effects:** May perform network I/O and retries.
   *
   * @see `PersistenceManager.setGlobalData`
   *
   * **Category:** Persistence
   */
  public async getGlobalData(key: string, maxRetries: number = 3): Promise<Record<string, unknown> | undefined> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const dataResult = await PlatformGateway.instance.getGlobalData(key);

      if (dataResult && !dataResult.error) {
        return dataResult;
      }

      if (dataResult.error.code === 'keyNotFound') {
        return {};
      }

      if (attempt < maxRetries) {
        ErrorHandler.warning(`PersistenceManager.getGlobalData(): Failed to get global data, retrying. Response: ${JSON.stringify(dataResult)}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    ErrorHandler.warning(`PersistenceManager.getGlobalData(): Failed to get global data after ${maxRetries} attempts.`);

    return undefined;
  }

  /** @internal */
  public async getPlayerData(player: Player): Promise<Record<string, unknown>> {
    // SaveStatesClient handles caching internally
    const data = await this._saveStatesClient.load<Record<string, unknown>>(this._getPlayerKey(player));

    if (!data) {
      ErrorHandler.warning(`PersistenceManager.getPlayerData(): Failed to get player data for player ${player.id}. Persistence service may be down.`);

      return {};
    }

    return data;
  }

  /**
   * Set global data in the data persistence service. This
   * data is available and shared by all lobbies of your game.
   * @param key - The key to set the data to.
   * @param data - The data to set.
   *
   * **Side effects:** Performs network I/O to persist data.
   *
   * @see `PersistenceManager.getGlobalData`
   *
   * **Category:** Persistence
   */
  public async setGlobalData(key: string, data: Record<string, unknown>): Promise<void> {
    const dataResult = await PlatformGateway.instance.setGlobalData(key, data);

    if (!dataResult || dataResult.error) {
      if (dataResult?.error) {
        ErrorHandler.warning(`PersistenceManager.setGlobalData(): ${dataResult.error.message}`);
      }
    }
  }

  /** @internal */
  public async setPlayerData(player: Player, data: Record<string, unknown>): Promise<void> {
    const playerData = await this.getPlayerData(player);
    
    for (const [ key, value ] of Object.entries(data)) {
      playerData[key] = value;
    }
  }

  /** @internal */
  public async unloadPlayerData(player: Player): Promise<void> {
    // Flush any pending writes and unload from SaveStatesClient cache
    await this._saveStatesClient.unload(this._getPlayerKey(player));
  }

  /** @internal */
  private _getPlayerKey(player: Player): string {
    return `player-${player.id}`;
  }
}
