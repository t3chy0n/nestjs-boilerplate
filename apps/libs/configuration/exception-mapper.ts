import { IExceptionMapper } from '../exceptions/interfaces/exception-mapper.interface';
import { ConfigFileNotFoundException } from './exceptions/config-file-not-found.exception';
import { ConfigUnknownException } from './exceptions/config-unknown.exception';
import { YAMLSemanticError } from 'yaml/util';
import { ConfigParseException } from './exceptions/config-parse.exception';

/***
 * Maps exceptions which are understandable within application
 */
export class ConfigurationExceptionMapper implements IExceptionMapper {
  map(err: any): void {
    if (err.code === 'ENOENT') {
      throw new ConfigFileNotFoundException('Config file not found', err);
    }
    if (err instanceof YAMLSemanticError) {
      throw new ConfigParseException(
        `Syntax error in application.yaml file!`,
        err,
      );
    }

    console.log('Error:', err);
    throw new ConfigUnknownException(
      `Unknown exception occoured when loading configuration`,
      err,
    );
  }
}
