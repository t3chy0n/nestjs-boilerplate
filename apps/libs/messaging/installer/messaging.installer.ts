import { DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  OnApplicationBootstrap,
  ParamData,
  Injectable,
  Inject,
} from '@nestjs/common';
import {
  ExternalContextCreator,
  ParamsFactory,
} from '@nestjs/core/helpers/external-context-creator';
import { groupBy, isObject } from 'lodash';
import {
  INCOMMING_METADATA_KEY,
  MESSAGING_ARGS_METADATA_KEY,
  OUTGOING_METADATA_KEY,
} from '@libs/messaging/consts';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { ILogger } from '@libs/logger/logger.interface';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { DiscoveredMethodWithMeta } from '@golevelup/nestjs-discovery/lib/discovery.interfaces';
import { OutgoingChannelDto } from '@libs/messaging/dto/outgoing-channel.dto';
import { IncomingChannelDto } from '@libs/messaging/dto/incomming-channel.dto';

export class MessagingParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: number, data: ParamData, args: any): any {
    console.log('Messaging debug', type, data, args);

    return data && !isObject(data) ? args[0]?.[data as string] : args[0];
  }
}

@Injectable()
export class MessagingInstaller implements OnApplicationBootstrap {
  private static bootstrapped = false;

  constructor(
    @Inject('MESSAGING_CONNECTIONS')
    private readonly connections: IMessagingConnection[],
    private readonly logger: ILogger,
    private readonly discover: DiscoveryService,
    private readonly config: MessagingConfiguration,
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly paramsFactory: MessagingParamsFactory,
  ) {}

  public async providersFinder(metadataKey: string) {
    this.logger.log('Initializing Messeging Handlers');

    let providers =
      await this.discover.providerMethodsWithMetaAtKey<MessagingMetadata>(
        metadataKey,
      );

    this.logger.log(
      `Searching for Handlers marked with ${metadataKey} key  in Controllers. You can not use NestJS HTTP-Requests in these controllers!`,
    );

    providers = providers.concat(
      await this.discover.controllerMethodsWithMetaAtKey<MessagingMetadata>(
        metadataKey,
      ),
    );

    return groupBy(providers, (x) => x.discoveredMethod.parentClass.name);
  }

  public createHandler({
    discoveredMethod,
    meta,
  }: DiscoveredMethodWithMeta<any>) {
    return this.externalContextCreator.create(
      discoveredMethod.parentClass.instance,
      discoveredMethod.handler,
      discoveredMethod.methodName,
      MESSAGING_ARGS_METADATA_KEY,
      this.paramsFactory,
      undefined,
      undefined,
      undefined,
      'messaging',
    );
  }

  public async onApplicationBootstrap() {
    if (MessagingInstaller.bootstrapped) {
      return;
    }

    MessagingInstaller.bootstrapped = true;

    this.logger.log('Initializing Messeging Handlers');

    const providers = (await this.providersFinder(OUTGOING_METADATA_KEY)) ?? [];
    for (const key of Object.keys(providers)) {
      this.logger.log(`Registering incomming handlers from ${key}`);
      const channel = key;

      await Promise.all(
        providers[key].map(async (method) => {
          const { discoveredMethod, meta: config } = method;
          const { instance } = method.discoveredMethod.parentClass;

          const channelConfig: any = this.config.getOutgoingEventConfiguration(
            config.event,
          );

          const connections: any = this.config.getConnectionsConfigurations(
            channelConfig.driver,
          );
          const handler = this.createHandler(method);
          const dto = OutgoingChannelDto.toDto(method, channelConfig);

          const decoratedMethod = function (...args) {
            const payload = handler.call(instance, ...args);
            dto.publicator$.next(payload);
            return payload;
          };

          const matchingConnections = this.connections.filter(
            (conn) => conn.driver === channelConfig.driver,
          );

          matchingConnections[0].addOutgoing(dto);
          const { targetName, methodName, specs } = config;

          this.logger.log(
            `Messaging function ${targetName}.${methodName} found`,
          );
          instance[methodName] = decoratedMethod.bind(instance);
        }),
      );
    }

    const incomingProviders =
      (await this.providersFinder(INCOMMING_METADATA_KEY)) ?? [];
    for (const key of Object.keys(incomingProviders)) {
      this.logger.log(`Registering incomming handlers from ${key}`);

      await Promise.all(
        incomingProviders[key].map(async (method) => {
          const { discoveredMethod, meta: config } = method;
          const { instance } = method.discoveredMethod.parentClass;

          const channelConfig: any = this.config.getIncomingEventConfiguration(
            config.event,
          );

          const connections: any = this.config.getConnectionsConfigurations(
            channelConfig.driver,
          );
          const handler = this.createHandler(method);
          const dto = IncomingChannelDto.toDto(method, channelConfig);

          const matchingConnections = this.connections.filter(
            (conn) => conn.driver === channelConfig.driver,
          );

          matchingConnections[0].addIncoming(dto);
          dto.callback = handler.bind(instance);
          const { targetName, methodName, specs } = config;

          this.logger.log(
            `Incoming messaging function ${targetName}.${methodName} found`,
          );
        }),
      );
    }
    this.connections.forEach((conn) => conn.initialize());
  }
}
