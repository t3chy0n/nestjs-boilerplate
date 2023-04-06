import { createPropertyDecorator } from '@nestjs/swagger/dist/decorators/helpers';

export const CONFIGURATION_MAIN_KEY_METADATA = 'Configuration.main.key';
export const CONFIGURATION_KEY_METADATA = 'Configuration.key';

import { applyDecorators } from '@nestjs/common';
import { ProvideIn, UseProxy } from '@libs/discovery/discover';
import { ConfigurationModule } from '@libs/configuration/configuration.module';
import {
  IBootstrapConfiguration,
  IConfiguration,
} from '@libs/configuration/interfaces/configuration.interface';
import { Injectable } from '@libs/discovery/decorators/injectable.decorator';
import { BelongsTo } from '@libs/discovery/decorators/belongs-to.decorator';

export function Config(key = '', bootstrap = false) {
  return applyDecorators(
    // SetMetadata(CONFIGURATION_MAIN_KEY_METADATA, { key, bootstrap }),
    Injectable(),
    BelongsTo(ConfigurationModule),
    ProvideIn([IConfiguration]),
  );
}

export function BootstrapConfig(key = '') {
  return applyDecorators(
    // SetMetadata(CONFIGURATION_MAIN_KEY_METADATA, { key, bootstrap }),
    Injectable(),
    BelongsTo(ConfigurationModule),
    ProvideIn([IBootstrapConfiguration]),
  );
}

export const ConfigProperty = (key = '', bootstrap = false) => {
  return UseProxy(
    (a, b, config: IConfiguration) => {
      console.log('Accessed proxy', a, b);
      return '';
    },
    (a, b, config: IConfiguration) => {
      console.log('Finished accesing proxy', a, b);
      return '';
    },
    (a, b, config: IConfiguration) => {
      console.log('Accessed proxy', a, b);
      return '';
    },
  );
};
