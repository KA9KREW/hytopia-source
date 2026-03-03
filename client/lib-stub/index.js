/**
 * Stub for @hytopia.com/lib when running client locally without registry access.
 * HYTOPIAClient is only used for heartbeat when sessionToken exists (production).
 * In local dev, heartbeat is skipped, so this no-op suffices.
 */
export class HYTOPIAClient {
  constructor(_endpoint) {}
}
