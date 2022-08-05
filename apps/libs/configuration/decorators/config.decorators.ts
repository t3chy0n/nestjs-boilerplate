import { createPropertyDecorator } from '@nestjs/swagger/dist/decorators/helpers';

export const CONFIGURATION_MAIN_KEY_METADATA = 'Configuration.main.key';
export const CONFIGURATION_KEY_METADATA = 'Configuration.key';

import {
  applyDecorators,
  createParamDecorator,
  SetMetadata,
} from '@nestjs/common';

export function Config(key: string) {
  return applyDecorators(SetMetadata(CONFIGURATION_MAIN_KEY_METADATA, { key }));
}

export const ConfigProperty = (key: string) =>
  createPropertyDecorator(CONFIGURATION_KEY_METADATA, { key }, false);
