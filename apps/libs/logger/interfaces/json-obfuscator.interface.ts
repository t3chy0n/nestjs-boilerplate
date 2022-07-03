export abstract class IJsonObfuscator {
  abstract obfuscate(anyObject: Record<any, any>): Record<any, any>;
}
