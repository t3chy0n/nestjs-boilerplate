import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { OnApplicationBootstrap, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { groupBy } from 'lodash';
import { ILogger } from '@libs/logger/logger.interface';
import { IConfiguration } from '@libs/configuration/interfaces/configuration.interface';
import {
  CONFIGURATION_KEY_METADATA,
  CONFIGURATION_MAIN_KEY_METADATA,
} from '@libs/configuration/decorators/config.decorators';

import { ConfigValueWrongTypeException } from '@libs/configuration/exceptions/config-value-wrong-type.exception';

@Injectable()
export class ConfigurationInstaller implements OnApplicationBootstrap {
  private static bootstrapped = false;

  constructor(
    private readonly logger: ILogger,
    private readonly discover: DiscoveryService,
    private readonly config: IConfiguration,
  ) {}

  public async providersFinder(metadataKey: string) {
    this.logger.log('Initializing Configuration provider classes Handlers');

    const providers = await this.discover.providersWithMetaAtKey<string>(
      metadataKey,
    );

    return groupBy(providers, (x) => x.discoveredClass.name);
  }

  public async onApplicationBootstrap() {
    ConfigurationInstaller.bootstrapped = true;

    this.logger.log('Initializing Configuration providers');

    const providers =
      (await this.providersFinder(CONFIGURATION_MAIN_KEY_METADATA)) ?? [];
    for (const className of Object.keys(providers)) {
      this.logger.log(`Registering incoming handlers from ${className}`);
      this.installConfigurationClass(providers[className]);
    }
  }

  private installConfigurationClass(provider) {
    provider.map((classMeta) => {
      const { discoveredClass, meta: config } = classMeta;
      const { targetName, methodName, specs } = config;

      for (const field of Object.keys(discoveredClass.instance)) {
        const descriptor = this.createConfigurationClassFieldDescriptor(
          discoveredClass,
          field,
          config,
        );

        Object.defineProperty(discoveredClass.instance, field, descriptor);
      }
      this.logger.log(`Config function ${targetName}.${methodName} found`);
    });
  }

  private createConfigurationClassFieldDescriptor(
    discoveredClass,
    field: string,
    config,
  ) {
    const fieldMeta = Reflect.getMetadata(
      CONFIGURATION_KEY_METADATA,
      discoveredClass.instance,
      field,
    );

    const composedConfigKey = config.key
      ? `${config.key}.${fieldMeta.key}`
      : fieldMeta.key;

    const oldValue = discoveredClass.instance[field];
    const descriptor = {
      get: () => {
        const value = this.config.get(composedConfigKey, oldValue);
        this.validateConfigValue(value, fieldMeta, composedConfigKey);

        return plainToInstance(fieldMeta.type, value);
      },
      set(value: any) {},
      enumerable: true,
      configurable: true,
    };
    return descriptor;
  }

  private validateConfigValue(value, fieldMeta, composedConfigKey) {
    if (typeof value === 'object') {
      this.validateObjectValue(value, fieldMeta);
    } else {
      this.validatePrimitiveValue(value, fieldMeta, composedConfigKey);
    }
  }

  private validatePrimitiveValue(value, fieldMeta, composedConfigKey) {
    const match =
      (typeof value).toLowerCase() === fieldMeta.type.name.toLowerCase();
    if (!match) {
      throw new ConfigValueWrongTypeException(
        `${composedConfigKey} expects to be ${fieldMeta.type.name.toLowerCase()} type!`,
      );
    }
  }

  private validateObjectValue(value, fieldMeta) {
    const e = validateSync(plainToInstance(fieldMeta.type, value));
    if (e.length > 0) {
      throw new ConfigValueWrongTypeException(e);
    }
  }
}
