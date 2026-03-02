import EventRouter from '@/events/EventRouter';
import { PlayerEvent } from '@/players/Player';
import type Player from '@/players/Player';
import type World from '@/worlds/World';

/**
 * Event types a ChatManager instance can emit.
 *
 * See `ChatEventPayloads` for the payloads.
 *
 * **Category:** Events
 * @public
 */
export enum ChatEvent {
  BROADCAST_MESSAGE = 'CHAT.BROADCAST_MESSAGE',
  PLAYER_MESSAGE    = 'CHAT.PLAYER_MESSAGE',
}

/**
 * Event payloads for ChatManager emitted events.
 *
 * **Category:** Events
 * @public
 */
export interface ChatEventPayloads {
  /** Emitted when a broadcast message is sent. */
  [ChatEvent.BROADCAST_MESSAGE]: { player: Player | undefined, message: string, color?: string }

  /** Emitted when a message is sent to a specific player. */
  [ChatEvent.PLAYER_MESSAGE]:    { player: Player, message: string, color?: string }
}

/**
 * A callback function for a chat command.
 * @param player - The player that sent the command.
 * @param args - An array of arguments, comprised of all space separated text after the command.
 * @param message - The full message of the command.
 * **Category:** Chat
 * @public
 */
export type CommandCallback = (player: Player, args: string[], message: string) => void;

/**
 * Manages chat and commands in a world.
 *
 * When to use: broadcasting chat, sending system messages, or registering chat commands.
 * Do NOT use for: player HUD/menus; use `PlayerUI` for rich UI.
 *
 * @remarks
 * The ChatManager is created internally as a singleton
 * for each `World` instance in a game server.
 * The ChatManager allows you to broadcast messages,
 * send messages to specific players, and register
 * commands that can be used in chat to execute game
 * logic.
 *
 * Pattern: register commands during world initialization and keep callbacks fast.
 * Anti-pattern: assuming commands are permission-checked; always validate access in callbacks.
 *
 * <h2>Events</h2>
 *
 * This class is an EventRouter, and instances of it emit
 * events with payloads listed under `ChatEventPayloads`
 *
 * @example
 * ```typescript
 * world.chatManager.registerCommand('/kick', (player, args, message) => {
 *   const admins = [ 'arkdev', 'testuser123' ];
 *   if (admins.includes(player.username)) {
 *     const targetUsername = args[0];
 *     const targetPlayer = world.playerManager.getConnectedPlayerByUsername(targetUsername);
 *
 *     if (targetPlayer) {
 *       targetPlayer.disconnect();
 *     }
 *   }
 * });
 * ```
 *
 * **Category:** Chat
 * @public
 */
export default class ChatManager extends EventRouter {
  /** @internal */
  private _commandCallbacks: Record<string, CommandCallback> = {};

  /** @internal */
  private _world: World;

  /** @internal */
  public constructor(world: World) {
    super();

    this._world = world;

    this._subscribeToPlayerEvents();
  }

  /**
   * Register a command and its callback.
   *
   * @remarks
   * Commands are matched by exact string equality against the first token in a chat message.
   *
   * @param command - The command to register.
   * @param callback - The callback function to execute when the command is used.
   *
   * **Requires:** Use a consistent command prefix (for example, `/kick`) if you want slash commands.
   *
   * @see `ChatManager.unregisterCommand`
   *
   * **Category:** Chat
   */
  public registerCommand(command: string, callback: CommandCallback) {
    this._commandCallbacks[command] = callback;
  }

  /**
   * Unregister a command.
   *
   * @param command - The command to unregister.
   *
   * @see `ChatManager.registerCommand`
   *
   * **Category:** Chat
   */
  public unregisterCommand(command: string) {
    delete this._commandCallbacks[command];
  }

  /**
   * Send a system broadcast message to all players in the world.
   *
   * @param message - The message to send.
   * @param color - The color of the message as a hex color code, excluding #.
   *
   * @example
   * ```typescript
   * chatManager.sendBroadcastMessage('Hello, world!', 'FF00AA');
   * ```
   *
   * **Side effects:** Emits `ChatEvent.BROADCAST_MESSAGE` for network sync.
   *
   * @see `ChatManager.sendPlayerMessage`
   *
   * **Category:** Chat
   */
  public sendBroadcastMessage(message: string, color?: string) {
    this._sendBroadcastMessage(undefined, message, color);
  }

  /**
   * Handle a command if it exists.
   *
   * @param player - The player that sent the command.
   * @param message - The full message.
   * @returns True if a command was handled, false otherwise.
   *
   * @remarks
   * The command is parsed as the first space-delimited token in the message.
   *
   * **Category:** Chat
   */
  public handleCommand(player: Player, message: string): boolean {
    const [ command, ...args ] = message.split(' ');
    const commandCallback = this._commandCallbacks[command];

    if (commandCallback) {
      commandCallback(player, args, message);
      
      return true;
    }

    return false;
  }

  /**
   * Send a system message to a specific player, only visible to them.
   *
   * @param player - The player to send the message to.
   * @param message - The message to send.
   * @param color - The color of the message as a hex color code, excluding #.
   *
   * @example
   * ```typescript
   * chatManager.sendPlayerMessage(player, 'Hello, player!', 'FF00AA');
   * ```
   *
   * **Side effects:** Emits `ChatEvent.PLAYER_MESSAGE` for network sync.
   *
   * @see `ChatManager.sendBroadcastMessage`
   *
   * **Category:** Chat
   */
  public sendPlayerMessage(player: Player, message: string, color?: string) {
    this.emitWithWorld(this._world, ChatEvent.PLAYER_MESSAGE, { player, message, color });
  }

  /** @internal */
  private _subscribeToPlayerEvents() {
    this._world.on(PlayerEvent.CHAT_MESSAGE_SEND, payload => {
      const { player, message } = payload;

      // Commands are handled earlier, this only receives regular chat
      this._sendBroadcastMessage(player, message);
    });
  }

  /** @internal */
  private _sendBroadcastMessage(player: Player | undefined, message: string, color?: string) {
    this.emitWithWorld(this._world, ChatEvent.BROADCAST_MESSAGE, { player, message, color });
  }
}
