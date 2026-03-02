import ErrorHandler from '@/errors/ErrorHandler';
import Telemetry, { TelemetrySpanOperation } from '@/metrics/Telemetry';

const TICK_SLOW_UPDATE_CAP = 2;
const MAX_ACCUMULATOR_TICK_MULTIPLE = 3;

/**
 * Fixed-timestep ticker for driving deterministic update loops.
 *
 * When to use: powering a game loop that must run at a stable tick rate.
 * Do NOT use for: variable-rate animation loops; use wall-clock timers instead.
 *
 * @remarks
 * Accumulates elapsed time and may process multiple updates per tick when behind.
 * Pattern: run one ticker per world loop and keep the tick function lightweight.
 * Anti-pattern: performing heavy I/O inside the tick callback.
 *
 * **Category:** Utilities
 * @internal
 */
export default class Ticker {
  private _accumulatorMs: number = 0;
  private _targetTicksPerSecond: number;
  private _fixedTimestepMs: number;
  private _fixedTimestepS: number;
  private _maxAccumulatorMs: number;
  private _nextTickMs: number = 0;
  private _lastLoopTimeMs: number = 0;
  private _tickFunction: (tickDeltaMs: number) => void;
  private _tickErrorCallback?: (error: Error) => void;
  private _tickHandle: NodeJS.Timeout | null = null;

  /**
   * Creates a ticker.
   *
   * @param ticksPerSecond - Target tick rate.
   * @param tickFunction - Callback invoked for each fixed timestep.
   * @param tickErrorCallback - Optional error handler for tick exceptions.
   *
   * **Category:** Utilities
   */
  constructor(
    ticksPerSecond: number, 
    tickFunction: (tickDeltaMs: number) => void, 
    tickErrorCallback?: (error: Error) => void,
  ) {
    this._targetTicksPerSecond = ticksPerSecond;
    this._fixedTimestepS = Math.fround(1 / ticksPerSecond);
    this._fixedTimestepMs = Math.fround(this._fixedTimestepS * 1000);
    this._maxAccumulatorMs = this._fixedTimestepMs * MAX_ACCUMULATOR_TICK_MULTIPLE;
    this._tickFunction = tickFunction;
    this._tickErrorCallback = tickErrorCallback;
  }

  /**
   * Target ticks per second.
   *
   * **Category:** Utilities
   */
  public get targetTicksPerSecond(): number {
    return this._targetTicksPerSecond;
  }
  
  /**
   * Fixed timestep in milliseconds.
   *
   * **Category:** Utilities
   */
  public get fixedTimestepMs(): number {
    return this._fixedTimestepMs;
  }

  /**
   * Fixed timestep in seconds.
   *
   * **Category:** Utilities
   */
  public get fixedTimestepS(): number {
    return this._fixedTimestepS;
  }

  /**
   * Whether the ticker is currently running.
   *
   * **Category:** Utilities
   */
  public get isStarted(): boolean {
    return !!this._tickHandle;
  }

  /**
   * Estimated delay in milliseconds until the next tick.
   *
   * **Category:** Utilities
   */
  public get nextTickMs(): number {
    return this._nextTickMs;
  }

  /**
   * Starts the ticker loop.
   *
   * @remarks
   * No-op if already started.
   *
   * **Side effects:** Schedules timers and begins invoking the tick callback.
   *
   * @see `Ticker.stop`
   *
   * **Category:** Utilities
   */
  public start(): void {
    if (this._tickHandle) return; // already running

    this._lastLoopTimeMs = performance.now();

    const tick = () => {
      const now = performance.now();
      const loopTimeMs = now - this._lastLoopTimeMs;

      this._lastLoopTimeMs = now;
      
      this._accumulatorMs += loopTimeMs;

      if (this._accumulatorMs > this._maxAccumulatorMs) {
        this._accumulatorMs = this._maxAccumulatorMs;
      }
      
      if (this._accumulatorMs >= this._fixedTimestepMs) {
        Telemetry.startSpan({ operation: TelemetrySpanOperation.TICKER_TICK }, () => {
          let updates = 0;
          while (this._accumulatorMs >= this._fixedTimestepMs && updates < TICK_SLOW_UPDATE_CAP) {
            this._tick(this._fixedTimestepMs);
            this._accumulatorMs -= this._fixedTimestepMs;
            updates++;
          }

        });
      }

      // Calculate next tick delay based on remaining accumulator time
      this._nextTickMs = Math.max(0, this._fixedTimestepMs - this._accumulatorMs);

      // Use setTimeout instead of setImmediate to avoid memory pressure
      // Calculate appropriate delay based on remaining time until next tick
      // This also gives the main thread time to breathe and do GC.
      this._tickHandle = setTimeout(tick, this._nextTickMs);
    };

    tick();
  }

  /**
   * Stops the ticker loop.
   *
   * @remarks
   * No-op if already stopped.
   *
   * **Side effects:** Clears the internal timer.
   *
   * @see `Ticker.start`
   *
   * **Category:** Utilities
   */
  public stop(): void {
    if (!this._tickHandle) return; // not running

    clearTimeout(this._tickHandle);
    this._tickHandle = null;
  }
  
  private _tick(tickDeltaMs: number): void {
    try {
      this._tickFunction(tickDeltaMs);
    } catch (error: unknown) {
      if (error instanceof Error && this._tickErrorCallback) {
        this._tickErrorCallback(error);
      } else {
        ErrorHandler.warning(`Ticker._tick(): tick callback threw an error, but it was not an instance of Error. Error: ${error as Error}`);
      }
    }
  }
}
