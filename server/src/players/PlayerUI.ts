import EventRouter from '@/events/EventRouter';
import type Player from '@/players/Player';

/**
 * Event types a PlayerUI can emit.
 *
 * See `PlayerUIEventPayloads` for the payloads.
 *
 * **Category:** Events
 * @public
 */
export enum PlayerUIEvent {
  APPEND              = 'PLAYER_UI.APPEND',
  DATA                = 'PLAYER_UI.DATA',
  FREEZE_POINTER_LOCK = 'PLAYER_UI.FREEZE_POINTER_LOCK',
  LOAD                = 'PLAYER_UI.LOAD',
  LOCK_POINTER        = 'PLAYER_UI.LOCK_POINTER',
  SEND_DATA           = 'PLAYER_UI.SEND_DATA',
}

/**
 * Event payloads for PlayerUI emitted events.
 *
 * **Category:** Events
 * @public
 */
export interface PlayerUIEventPayloads {
  /** Emitted when UI HTML is appended to the player's existing client UI. */
  [PlayerUIEvent.APPEND]:              { playerUI: PlayerUI, htmlUri: string }

  /** Emitted when data is received by the server from the player's client UI. */
  [PlayerUIEvent.DATA]:                { playerUI: PlayerUI, data: Record<string, any> }
 
  /** Emitted when the player's pointer lock is frozen or unfrozen. */
  [PlayerUIEvent.FREEZE_POINTER_LOCK]: { playerUI: PlayerUI, freeze: boolean }
 
  /** Emitted when the player's client UI is loaded. */
  [PlayerUIEvent.LOAD]:                { playerUI: PlayerUI, htmlUri: string }

  /** Emitted when the player's mouse pointer is locked or unlocked. */
  [PlayerUIEvent.LOCK_POINTER]:        { playerUI: PlayerUI, lock: boolean }

  /** Emitted when data is sent from the server to the player's client UI. */
  [PlayerUIEvent.SEND_DATA]:           { playerUI: PlayerUI, data: Record<string, any> }
}

/**
 * The UI for a player.
 *
 * When to use: showing overlays, HUDs, menus, and custom UI for a specific player.
 * Do NOT use for: world-level UI shared by all players; use scene UI systems instead.
 *
 * @remarks
 * UI is driven by HTML, CSS, and JavaScript files in your `assets` folder.
 *
 * <h2>Events</h2>
 *
 * This class is an EventRouter, and instances of it emit events with payloads listed under
 * `PlayerUIEventPayloads`.
 *
 * **Category:** Players
 * @public
 */
export default class PlayerUI extends EventRouter {
  /**
   * The player that the UI belongs to.
   *
   * **Category:** Players
   */
  public readonly player: Player;

  /** @internal */
  public constructor(player: Player) {
    super();

    this.player = player;
  }

  /**
   * Appends UI HTML to the player's existing client UI.
   *
   * Use for: incremental overlays (notifications, tooltips, modal layers).
   * Do NOT use for: replacing the entire UI; use `PlayerUI.load`.
   *
   * @remarks
   * Multiple calls in the same tick append in call order.
   * If used with `PlayerUI.load` in the same tick, appends occur after the load.
   *
   * @param htmlUri - The UI HTML URI to append.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerUIEvent.APPEND`.
   *
   * **Category:** Players
   */
  public append(htmlUri: string) {
    if (!this.player.world) {
      return;
    }

    this.emitWithWorld(this.player.world, PlayerUIEvent.APPEND, {
      playerUI: this,
      htmlUri,
    });
  }

  /**
   * Freezes or unfreezes the player's pointer lock state.
   *
   * Use for: menus or cutscenes that should not alter pointer lock.
   *
   * @param freeze - True to freeze pointer lock, false to unfreeze it.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerUIEvent.FREEZE_POINTER_LOCK`.
   *
   * **Category:** Players
   */
  public freezePointerLock(freeze: boolean) {
    if (!this.player.world) {
      return;
    }

    this.emitWithWorld(this.player.world, PlayerUIEvent.FREEZE_POINTER_LOCK, {
      playerUI: this,
      freeze,
    });
  }

  /**
   * Loads client UI for the player, replacing any existing UI.
   *
   * Use for: switching to a new UI screen or resetting the UI.
   * Do NOT use for: incremental overlays; use `PlayerUI.append`.
   *
   * @remarks
   * If used with `PlayerUI.append` in the same tick, the load occurs first.
   *
   * @param htmlUri - The UI HTML URI to load.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerUIEvent.LOAD`.
   *
   * **Category:** Players
   */
  public load(htmlUri: string) {
    if (!this.player.world) {
      return;
    }

    this.emitWithWorld(this.player.world, PlayerUIEvent.LOAD, {
      playerUI: this,
      htmlUri,
    });
  }

  /**
   * Locks or unlocks the player's mouse pointer on desktop.
   *
   * Use for: controlling when mouse input is captured.
   * Do NOT use for: mobile devices (pointer lock has no effect).
   *
   * @remarks
   * If unlocked, the player cannot use in-game mouse inputs until it is locked again.
   *
   * @param lock - True to lock the pointer, false to unlock it.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerUIEvent.LOCK_POINTER`.
   *
   * **Category:** Players
   */
  public lockPointer(lock: boolean) {
    if (!this.player.world) {
      return;
    }

    this.emitWithWorld(this.player.world, PlayerUIEvent.LOCK_POINTER, {
      playerUI: this,
      lock,
    });
  }

  /**
   * Sends data to the player's client UI.
   *
   * Use for: pushing state updates to your UI scripts.
   *
   * @param data - The data to send to the client UI.
   *
   * **Requires:** Player must be in a world.
   *
   * **Side effects:** Emits `PlayerUIEvent.SEND_DATA`.
   *
   * **Category:** Players
   */
  public sendData(data: object) {
    if (!this.player.world) {
      return;
    }

    this.emitWithWorld(this.player.world, PlayerUIEvent.SEND_DATA, {
      playerUI: this,
      data,
    });
  }
}
