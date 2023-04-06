import { DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  OnApplicationBootstrap,
  Injectable,
  Optional,
  Logger,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { groupBy } from 'lodash';
import { ILogger } from '@libs/logger/logger.interface';
import {
  IBootstrapConfiguration,
  IConfiguration,
} from '@libs/configuration/interfaces/configuration.interface';
import {
  CONFIGURATION_KEY_METADATA,
  CONFIGURATION_MAIN_KEY_METADATA,
} from '@libs/configuration/decorators/config.decorators';

import { ConfigValueWrongTypeException } from '@libs/configuration/exceptions/config-value-wrong-type.exception';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks/on-init.interface';

@Injectable()
export class ConfigurationInstaller {
  private static bootstrapped = false;
  private readonly logger: Logger = new Logger(ConfigurationInstaller.name);

  constructor(
    private readonly discover: DiscoveryService,
    private readonly bootstrapConfig: IBootstrapConfiguration,
    private readonly config: IConfiguration,
  ) {}
  onModuleInit() {
    // this.initialize();
  }
  public async providersFinder(metadataKey: string) {
    this.logger?.log('Initializing Configuration provider classes Handlers');

    const providers = await this.discover.providersWithMetaAtKey<string>(
      metadataKey,
    );

    return groupBy(providers, (x) => x.discoveredClass.name);
  }

  public async initialize(): Promise<void> {
    if (ConfigurationInstaller.bootstrapped) {
      return;
    }
    ConfigurationInstaller.bootstrapped = true;
    this.logger?.log('Initializing Configuration providers');

    const providers =
      (await this.providersFinder(CONFIGURATION_MAIN_KEY_METADATA)) ?? [];
    for (const className of Object.keys(providers)) {
      this.logger?.log(`Registering incoming handlers from ${className}`);
      this.installConfigurationClass(providers[className]);
    }
  }

  private installConfigurationClass(provider) {
    provider.map((classMeta) => {
      const { discoveredClass, meta: config, name } = classMeta;
      const { targetName, methodName, specs } = config;

      for (const field of Object.keys(discoveredClass.instance)) {
        const descriptor = this.createConfigurationClassFieldDescriptor(
          discoveredClass,
          field,
          config,
        );

        Object.defineProperty(discoveredClass.instance, field, descriptor);
      }
      this.logger?.log(
        `Config function ${targetName ?? name} ${methodName ?? ''} found`,
      );
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
      : fieldMeta.key != ''
      ? fieldMeta.key
      : field;

    const oldValue = discoveredClass.instance[field];
    const descriptor = {
      get: () => {
        const isBootstrap = fieldMeta.bootstrap || config.bootstrap;

        const value = !isBootstrap
          ? this.config.get(composedConfigKey, oldValue)
          : this.bootstrapConfig.get(composedConfigKey, oldValue);

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
