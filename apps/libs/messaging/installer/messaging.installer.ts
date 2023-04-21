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
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { MessagingParamType } from '@libs/messaging/decorators/message.decorator';
import { validateValue } from '@libs/validation/validation.utils';

export class MessagingParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: number, data: ParamData, args: any): any {
    switch (type) {
      case MessagingParamType.MESSAGE:
        const result = args[type];
        const typeMeta = Reflect.getMetadata('design:type', result);
        validateValue(args[type], typeMeta);
        return args[type];
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
