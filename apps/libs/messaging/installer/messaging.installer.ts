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
import { groupBy } from 'lodash';
import {
  INCOMMING_METADATA_KEY,
  OUTGOING_METADATA_KEY,
} from '@libs/messaging/consts';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { ILogger } from '@libs/logger/logger.interface';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { DiscoveredMethodWithMeta } from '@golevelup/nestjs-discovery/lib/discovery.interfaces';
import { OutgoingChannelDto } from '@libs/messaging/dto/outgoing-channel.dto';
import { ChannelConfigurationDto } from '@libs/messaging/dto/channel-configuration.dto';
import { MessagingParamType } from '@libs/messaging/decorators/message.decorator';
import { BEAN_METHOD_ARGS_METADATA_KEY } from '@libs/discovery/const';

export class MessagingParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: number, data: ParamData, args: any): any {
    switch (type) {
      case MessagingParamType.MESSAGE:
      case MessagingParamType.INCOMING_CONFIGURATION:
        return args[type];
      default:
        return null;
    }
  }
}

@Injectable()
export class MessagingInstaller implements OnApplicationBootstrap {
  private static bootstrapped = false;
  private cachedHandlers = {};

  constructor(
    @Inject('MESSAGING_CONNECTIONS')
    private readonly connections: IMessagingConnection[],

  ) {}
  public async onApplicationBootstrap() {
    if (MessagingInstaller.bootstrapped) {
      return;
    }

    MessagingInstaller.bootstrapped = true;
    this.connections.forEach((conn) => conn.initialize());
  }
}
