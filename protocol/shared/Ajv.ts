import Ajv from "ajv";

export default class extends Ajv {
  // shared instance for the entire application
  // per ajv docs, this is for performance around
  // compiled validate function caching & more.
  public static readonly instance = new Ajv();  
}