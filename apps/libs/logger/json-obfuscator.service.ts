import { IJsonObfuscator } from './interfaces/json-obfuscator.interface';
import * as _ from 'lodash';

//TODO: Might be a good idea to place this also in configuration and merge arrays
const PATHS_TO_OBFUSCATE = [
  'password',
  'authorization',
  'accessToken',
  'token',
];

export class JsonObfuscator implements IJsonObfuscator {
  /***
   * Obfuscates sensitive fields from object, and returns stringified object.
   * @param anyObject
   */
  obfuscate(anyObject: Record<any, any>): Record<any, any> {
    for (const path of PATHS_TO_OBFUSCATE) {
      const hasPath = _.get(anyObject, path);
      if (hasPath) {
        _.set(anyObject, path, '*'.repeat(10));
      }
    }

    return anyObject;
  }
}
