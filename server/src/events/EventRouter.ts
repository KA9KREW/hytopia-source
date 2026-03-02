import EventEmitter from 'eventemitter3';
import ErrorHandler from '@/errors/ErrorHandler';
import type { EventPayloads } from './Events';
import type World from '@/worlds/World';

/**
 * Routes events to listeners in local, world, or global scope.
 *
 * When to use: event-driven hooks within server subsystems.
 * Do NOT use for: high-frequency per-entity updates; prefer direct method calls for hot paths.
 *
 * @remarks
 * Provides local emission, world-scoped emission, and a shared global instance.
 * Pattern: use `EventRouter.emitWithWorld()` for world-scoped events and `final()` to install a single terminal listener.
 * Anti-pattern: installing multiple final listeners for the same event type; only one is supported.
 *
 * **Category:** Events
 * @public
 */
export default class EventRouter {
  /**
   * The global event router instance.
   *
   * **Category:** Events
   */
  public static readonly globalInstance: EventRouter = new EventRouter();

  /** @internal */
  private _emitter: EventEmitter = new EventEmitter();
  private _finalListeners: Record<string, EventEmitter.EventListener<any, string>> = {};

  /**
   * Emit an event, invoking all registered listeners for the event type.
   *
   * @param eventType - The type of event to emit.
   * @param payload - The payload to emit.
   *
   * @returns `true` if any listeners were found and invoked, `false` otherwise.
   *
   * **Side effects:** Invokes listeners registered for the event type.
   *
   * **Category:** Events
   */
  public emit<TEventType extends keyof EventPayloads>(eventType: TEventType, payload: EventPayloads[TEventType]): boolean;
  public emit(eventType: string, payload: any): boolean;
  public emit(eventType: string, payload: any): boolean {
    if (this.listenerCount(eventType) === 0) return false;

    try {
      this._emitter.emit(eventType, payload);
      this._finalListeners[eventType as keyof EventPayloads]?.(payload);
    } catch (error) {
      console.error(`EventRouter.emit(): Error emitting event "${eventType}":`, error);
    }

    return true;
  }

  /**
   * Emits an event to the local and global server instance event routers.
   *
   * @param eventType - The type of event to emit.
   * @param payload - The payload to emit.
   *
   * **Side effects:** Invokes local listeners and `EventRouter.globalInstance` listeners.
   *
   * @see `EventRouter.emit()`
   *
   * **Category:** Events
   */
  public emitWithGlobal<TEventType extends keyof EventPayloads>(eventType: TEventType, payload: EventPayloads[TEventType]): void;
  public emitWithGlobal(eventType: string, payload: any): void;
  public emitWithGlobal(eventType: string, payload: any): void {
    this.emit(eventType, payload);
    EventRouter.globalInstance.emit(eventType, payload);
  }

  /**
   * Emits an event to local and provided world event routers.
   *
   * @param world - The world to broadcast the event to.
   * @param eventType - The type of event to broadcast.
   * @param payload - The payload to broadcast.
   *
   * **Requires:** The provided world must be active and using the same event payload types.
   *
   * **Side effects:** Invokes local listeners and listeners registered on the world instance.
   *
   * @see `EventRouter.emit()`
   *
   * **Category:** Events
   */
  public emitWithWorld<TEventType extends keyof EventPayloads>(world: World, eventType: TEventType, payload: EventPayloads[TEventType]): void;
  public emitWithWorld(world: World, eventType: string, payload: any): void;
  public emitWithWorld(world: World, eventType: string, payload: any): void {
    this.emit(eventType, payload);
    world.emit(eventType, payload);
  }

  /**
   * Registers a listener for a specific event type that will be invoked after all other listeners.
   *
   * @remarks
   * Only one final listener can be registered per event type. It is invoked after normal listeners.
   *
   * @param eventType - The type of event to listen for.
   * @param listener - The listener function to invoke last when the event is emitted.
   *
   * **Requires:** Remove the existing final listener with `EventRouter.off()` before registering a different one.
   *
   * **Side effects:** Replaces or registers the terminal listener for the event type.
   *
   * @internal
   *
   * **Category:** Events
   */
  public final<TEventType extends keyof EventPayloads>(eventType: TEventType, listener: (payload: EventPayloads[TEventType]) => void): void;
  public final(eventType: string, listener: (payload: any) => void): void;
  public final(eventType: string, listener: (payload: any) => void): void {
    if (this._finalListeners[eventType] && listener !== this._finalListeners[eventType]) {
      return ErrorHandler.error(`EventRouter.final(): Listener for event type "${eventType}" already exists. It must be removed explicitly with .off() before a different final listener can be set.`);
    }

    this._finalListeners[eventType] = listener;
  }

  /**
   * Check if there are listeners for a specific event type.
   *
   * @param eventType - The type of event to check for listeners.
   *
   * @returns `true` if listeners are found, `false` otherwise.
   *
   * **Category:** Events
   */
  public hasListeners<TEventType extends keyof EventPayloads>(eventType: TEventType): boolean;
  public hasListeners(eventType: string): boolean;
  public hasListeners(eventType: string): boolean {
    return this._emitter.listenerCount(eventType) > 0 || eventType in this._finalListeners;
  }

  /**
   * Get all listeners for a specific event type.
   *
   * @param eventType - The type of event to get listeners for.
   *
   * @returns All listeners for the event type.
   *
   * **Category:** Events
   */
  public listeners<TEventType extends keyof EventPayloads>(eventType: TEventType): EventEmitter.EventListener<any, string>[];
  public listeners(eventType: string): EventEmitter.EventListener<any, string>[];
  public listeners(eventType: string): EventEmitter.EventListener<any, string>[] {
    return [
      ...this._emitter.listeners(eventType),
      ...(this._finalListeners[eventType] ? [ this._finalListeners[eventType] ] : []),
    ];
  }

  /**
   * Get the number of listeners for a specific event type.
   *
   * @param eventType - The type of event to get the listener count for.
   *
   * @returns The number of listeners for the event type.
   *
   * **Category:** Events
   */
  public listenerCount<TEventType extends keyof EventPayloads>(eventType: TEventType): number;
  public listenerCount(eventType: string): number;
  public listenerCount(eventType: string): number {
    return this._emitter.listenerCount(eventType) + (this._finalListeners[eventType] ? 1 : 0);
  }

  /**
   * Remove a listener for a specific event type.
   *
   * @param eventType - The type of event to remove the listener from.
   * @param listener - The listener function to remove.
   *
   * **Category:** Events
   */
  public off<TEventType extends keyof EventPayloads>(eventType: TEventType, listener: (payload: EventPayloads[TEventType]) => void): void;
  public off(eventType: string, listener: (payload: any) => void): void;
  public off(eventType: string, listener: (payload: any) => void): void {
    this._emitter.removeListener(eventType, listener);

    if (this._finalListeners[eventType] === listener) {
      delete this._finalListeners[eventType];
    }
  }

  /**
   * Remove all listeners or all listeners for a provided event type.
   *
   * @param eventType - The type of event to remove all listeners from.
   *
   * **Side effects:** Clears listeners and final listeners for the event type.
   *
   * **Category:** Events
   */
  public offAll<TEventType extends keyof EventPayloads>(eventType?: TEventType): void;
  public offAll(eventType?: string): void;
  public offAll(eventType?: string): void {
    this._emitter.removeAllListeners(eventType);

    if (eventType) {
      delete this._finalListeners[eventType];
    } else {
      this._finalListeners = {};
    }
  }

  /**
   * Register a listener for a specific event type.
   *
   * @remarks
   * Listeners are invoked in the order they are registered.
   *
   * @param eventType - The type of event to listen for.
   * @param listener - The listener function to invoke when the event is emitted.
   *
   * **Category:** Events
   */
  public on<TEventType extends keyof EventPayloads>(eventType: TEventType, listener: (payload: EventPayloads[TEventType]) => void): void;
  public on(eventType: string, listener: (payload: any) => void): void;
  public on(eventType: string, listener: (payload: any) => void): void {
    this._emitter.addListener(eventType, listener);
  }

  /**
   * Register a listener for a specific event type that will be invoked once.
   *
   * @param eventType - The type of event to listen for.
   * @param listener - The listener function to invoke when the event is emitted.
   *
   * **Category:** Events
   */
  public once<TEventType extends keyof EventPayloads>(eventType: TEventType, listener: (payload: EventPayloads[TEventType]) => void): void;
  public once(eventType: string, listener: (payload: any) => void): void;
  public once(eventType: string, listener: (payload: any) => void): void {
    this._emitter.once(eventType, listener);
  }
}
