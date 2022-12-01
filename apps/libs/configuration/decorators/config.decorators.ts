import { createPropertyDecorator } from '@nestjs/swagger/dist/decorators/helpers';

export const CONFIGURATION_MAIN_KEY_METADATA = 'Configuration.main.key';
export const CONFIGURATION_KEY_METADATA = 'Configuration.key';

import {
  applyDecorators,
  createParamDecorator,
  SetMetadata,
} from '@nestjs/common';

export function Config(key = '', bootstrap = false) {
  return applyDecorators(
    SetMetadata(CONFIGURATION_MAIN_KEY_METADATA, { key, bootstrap }),
  );
}

export function BootstrapConfig(key = '') {
  return Config(key, true);
}

export const ConfigProperty = (key = '', bootstrap = false) =>
  createPropertyDecorator(
    CONFIGURATION_KEY_METADATA,
    { key, bootstrap },
    false,
  );
