import { applyDecorators, SetMetadata } from '@nestjs/common';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';
import { INCOMMING_METADATA_KEY } from '@libs/messaging/consts';
import {
  After,
  AfterConstructor,
  Before,
  NonInjectable,
} from '@libs/discovery';
import { ChannelConfigurationDto } from '@libs/messaging/dto/channel-configuration.dto';
import { Traced } from '@libs/telemetry/decorators/traced.decorator';
import { validateValue } from '@libs/validation/validation.utils';
import { MessagingParamType } from '@libs/messaging/decorators/message.decorator';
import { BEAN_METHOD_ARGS_METADATA_KEY } from '@libs/discovery/const';
import { MessagingValidationException } from '@libs/messaging/exceptions/messaging-validation-exception';

export const IncomingOld = (event: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata<string, MessagingMetadata>(INCOMMING_METADATA_KEY, {
      event,
      targetClass: target.constructor,
      targetName: target.constructor.name,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};

@NonInjectable()
@Traced
class IncommingMessageHandler {}
export const IncomingNew = (event?: string): MethodDecorator => {
  return applyDecorators(
    AfterConstructor(
      (
        target,
        property,
        descriptor,
        instance,
        proxy,
        { logger, messagingConfig, connections, lazy },
      ) => {
        const channelConfig: any =
          messagingConfig.getIncomingEventConfiguration(event);

        const channelParams = {
          ...channelConfig,
          event: event,
        };
        const dto = lazy.resolveBean(ChannelConfigurationDto, channelParams);

        const matchingConnections = connections.filter(
          (conn) =>
            conn.driver === channelConfig.driver &&
            (channelConfig.name ? conn.name === channelConfig.name : true),
        );
        matchingConnections[0].addIncoming(dto);
        dto.callback = (...args) => proxy[property](...args);
        logger.log(
          `Registered incoming message handler ${
            target.constructor.name
          }:${property.toString()}`,
        );
        return '';
      },
    ),

    Before((ctx, target, property, { logger }, ...args) => {
      const paramsTypesMetadata =
        Reflect.getMetadata('design:paramtypes', target, property) ?? [];
      let idx = 0;
      for (const typeMeta of paramsTypesMetadata) {
        validateValue(args[idx], typeMeta, MessagingValidationException);
        idx++;
      }
      logger.debug(
        `Received message in ${target.constructor.name}:${property.toString()}`,
      );
    }),
  );
};

export const Incoming = IncomingNew;
