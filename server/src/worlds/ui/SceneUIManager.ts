import type SceneUI from '@/worlds/ui/SceneUI';
import type Entity from '@/worlds/entities/Entity';
import type World from '@/worlds/World';

/**
 * Manages SceneUI instances in a world.
 *
 * When to use: querying or bulk-unloading scene UI elements in a world.
 * Do NOT use for: player HUD/menus; use `PlayerUI` for per-player UI.
 *
 * @remarks
 * The SceneUIManager is created internally per `World` instance.
 * Pattern: load scene UI for world objects and unload them when entities despawn.
 *
 * **Category:** UI
 * @public
 */
export default class SceneUIManager {
  /** @internal */
  private _sceneUIs: Map<number, SceneUI> = new Map();

  /** @internal */
  private _nextSceneUIId: number = 1;

  /** @internal */
  private _world: World;

  /** @internal */
  public constructor(world: World) {
    this._world = world;
  }

  /**
   * The world the SceneUIManager is for.
   *
   * **Category:** UI
   */
  public get world(): World { return this._world; }

  /**
   * Retrieves all loaded SceneUI instances for the world.
   *
   * @returns An array of SceneUI instances.
   *
   * **Category:** UI
   */
  public getAllSceneUIs(): SceneUI[] {
    return Array.from(this._sceneUIs.values());
  }

  /**
   * Retrieves all loaded SceneUI instances attached to a specific entity.
   *
   * Use for: cleanup or inspection of entity-bound scene UI.
   *
   * @param entity - The entity to get attached SceneUI instances for.
   * @returns An array of SceneUI instances.
   *
   * **Requires:** Entity should belong to this world for meaningful results.
   *
   * @see `SceneUIManager.unloadEntityAttachedSceneUIs`
   *
   * **Category:** UI
   */
  public getAllEntityAttachedSceneUIs(entity: Entity): SceneUI[] {
    return this.getAllSceneUIs().filter(sceneUI => sceneUI.attachedToEntity === entity);
  }

  /**
   * Retrieves a SceneUI instance by its unique identifier (id).
   *
   * @param id - The unique identifier (id) of the SceneUI to retrieve.
   * @returns The SceneUI instance if found, otherwise undefined.
   *
   * **Category:** UI
   */
  public getSceneUIById(id: number): SceneUI | undefined {
    return this._sceneUIs.get(id);
  }

  /** @internal */
  public registerSceneUI(sceneUI: SceneUI): number {
    if (sceneUI.id !== undefined) {
      return sceneUI.id;
    }

    const id = this._nextSceneUIId;
    this._sceneUIs.set(id, sceneUI);
    this._nextSceneUIId++;

    return id;
  }

  /**
   * Unloads and unregisters all SceneUI instances attached to a specific entity.
   *
   * @remarks
   * **Cleanup:** Calls `SceneUI.unload` on each attached SceneUI.
   *
   * @param entity - The entity to unload and unregister SceneUI instances for.
   *
   * **Requires:** Entity should belong to this world for meaningful results.
   *
   * **Side effects:** Unloads any attached scene UI and removes it from manager tracking.
   *
   * @see `SceneUIManager.getAllEntityAttachedSceneUIs`
   *
   * **Category:** UI
   */
  public unloadEntityAttachedSceneUIs(entity: Entity): void {
    this.getAllEntityAttachedSceneUIs(entity).forEach(sceneUI => {
      sceneUI.unload();
    });
  }

  /** @internal */
  public unregisterSceneUI(sceneUI: SceneUI): void {
    if (sceneUI.id === undefined) {
      return;
    }

    this._sceneUIs.delete(sceneUI.id);
  }
}
