import Ajv from 'ajv';

/**
 * Shared AJV schema validator instance.
 *
 * When to use: internal JSON schema validation with cached compiled validators.
 * Do NOT use for: creating per-request validators; use this shared instance.
 *
 * **Category:** Utilities
 * @internal
 */
export default class extends Ajv {
  // shared instance for the entire application
  // per ajv docs, this is for performance around
  // compiled validate function caching & more.
  public static readonly instance = new Ajv();  
}
