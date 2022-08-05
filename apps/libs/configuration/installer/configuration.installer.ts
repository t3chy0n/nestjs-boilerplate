import { DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  OnApplicationBootstrap,
  ParamData,
  Injectable,
  Inject,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, validateSync } from 'class-validator';
import { groupBy } from 'lodash';
import { ILogger } from '@libs/logger/logger.interface';
import { IConfiguration } from '@libs/configuration/interfaces/configuration.interface';
import {
  CONFIGURATION_KEY_METADATA,
  CONFIGURATION_MAIN_KEY_METADATA,
} from '@libs/configuration/decorators/config.decorators';
import { MESSAGING_ARGS_METADATA_KEY } from '@libs/messaging/consts';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';
import { ConfigValueWrongTypeException } from '@libs/configuration/exceptions/config-value-wrong-type.exception';
//
// export function id() {
//   return (target: {} | any, name?: PropertyKey): any => {
//     const descriptor = {
//       get(this: any) {},
//       set(value: any) {},
//       enumerable: true,
//       configurable: true,
//     };
//
//     Object.defineProperty(target, name, descriptor);
//   };
// }
@Injectable()
export class ConfigurationInstaller implements OnApplicationBootstrap {
  private static bootstrapped = false;
  private cachedHandlers = {};

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
    for (const key of Object.keys(providers)) {
      this.logger.log(`Registering incomming handlers from ${key}`);

      providers[key].map((method) => {
        const { discoveredClass, meta: config } = method;
        const { targetName, methodName, specs } = config;

        for (const field of Object.keys(discoveredClass.instance)) {
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
              const res = this.config.get(composedConfigKey, oldValue);
              if (typeof res === 'object') {
                const e = validateSync(plainToInstance(fieldMeta.type, res));
                console.log(e);
                if (e.length > 0) {
                  throw new ConfigValueWrongTypeException(e);
                }
              } else {
                const match =
                  (typeof res).toLowerCase() ===
                  fieldMeta.type.name.toLowerCase();
                if (!match) {
                  throw new ConfigValueWrongTypeException(
                    `${composedConfigKey} expects to be ${fieldMeta.type.name.toLowerCase()} type!`,
                  );
                }
              }

              return plainToInstance(fieldMeta.type, res);
            },
            set(value: any) {},
            enumerable: true,
            configurable: true,
          };

          Object.defineProperty(discoveredClass.instance, field, descriptor);
          try {
            const meta = Reflect.getMetadata(
              CONFIGURATION_KEY_METADATA,
              discoveredClass.instance,
              field,
            );
          } catch (e) {
            console.error(e);
          }
        }
        this.logger.log(`Config function ${targetName}.${methodName} found`);
      });
    }

    const providersProperties =
      (await this.providersFinder(CONFIGURATION_KEY_METADATA)) ?? [];
    for (const key of Object.keys(providersProperties)) {
      this.logger.log(`Registering incomming handlers from ${key}`);
      const channel = key;

      providers[key].map((method) => {
        const { discoveredMethod, meta: config } = method;

        const { targetName, methodName, specs } = config;

        this.logger.log(
          `Config prop function ${targetName}.${methodName} found`,
        );
      });
    }
  }
}
