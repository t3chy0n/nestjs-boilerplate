export const CONFIGURATION_MAIN_KEY_METADATA = 'Configuration.main.key';
export const CONFIGURATION_KEY_METADATA = 'Configuration.key';

import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ConfigurationModule } from '@libs/configuration/configuration.module';
import {
  IBootstrapConfiguration,
  IConfiguration,
} from '@libs/configuration/interfaces/configuration.interface';
import { Injectable } from '@libs/discovery/decorators/injectable.decorator';
import { After, Before, EnsureParentImports } from '@libs/discovery';
import { ConfigValueWrongTypeException } from '@libs/configuration/exceptions/config-value-wrong-type.exception';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { createPropertyDecorator } from '@nestjs/swagger/dist/decorators/helpers';

export function Config(topConfigKey = ''): ClassDecorator {
  return applyDecorators(
    (target: any, key: string | symbol | undefined, index?: number) => {
      Reflect.defineMetadata(
        CONFIGURATION_MAIN_KEY_METADATA,
        topConfigKey,
        target.prototype,
      );
    },
    Injectable({ inject: { config: IConfiguration } }),
    EnsureParentImports(ConfigurationModule),
  );
}

export function BootstrapConfig(key = ''): ClassDecorator {
  return applyDecorators(
    (target: any, key: string | symbol | undefined, index?: number) => {
      Reflect.defineMetadata(CONFIGURATION_MAIN_KEY_METADATA, key, target);
    },
    Injectable({ inject: { config: IBootstrapConfiguration } }),
    EnsureParentImports(ConfigurationModule),
  );
}

export function validateConfigValue(value, type, composedConfigKey) {
  if (typeof value === 'object') {
    validateObjectValue(value, type);
  } else {
    validatePrimitiveValue(value, type, composedConfigKey);
  }
}

export function validatePrimitiveValue(value, type, composedConfigKey) {
  const match = (typeof value).toLowerCase() === type.name.toLowerCase();
  if (!match) {
    throw new ConfigValueWrongTypeException(
      `${composedConfigKey} expects to be ${type.name} type!`,
    );
  }
}

function validateObjectValue(value, type) {
  const e = validateSync(plainToInstance(type, value));
  if (e.length > 0) {
    throw new ConfigValueWrongTypeException(e);
  }
}

export const ConfigProperty = (key?: string): PropertyDecorator => {
  return applyDecorators(
    createPropertyDecorator(CONFIGURATION_KEY_METADATA, { key }, true),
    Before((ctx, target, property, inj: any) => {
      const { config, ...rest }: { config: IConfiguration } = inj;
      const asd2 = Reflect.getMetadataKeys(target);
      const configKey = Reflect.getMetadata(
        CONFIGURATION_MAIN_KEY_METADATA,
        target,
      );

      const typeMeta = Reflect.getMetadata(
        'design:type',
        target,
        property?.toString(),
      );

      const composedConfigKey = configKey
        ? `${configKey}.${key ?? property.toString()}`
        : key ?? property;

      console.log('Accessed proxy', target, property, composedConfigKey);
      const resultValue = config.get(composedConfigKey?.toString());
      validateConfigValue(resultValue, typeMeta, composedConfigKey);
      return resultValue;
    }),
    After((ctx, a, b, config: IConfiguration) => {
      console.log('Finished accessing proxy', a, b);
      return '';
    }),
  );
};
