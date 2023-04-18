import { applyDecorators, SetMetadata } from '@nestjs/common';
import { MessagingMetadata } from '@libs/messaging/dto/messaging.metadata';
import { OUTGOING_METADATA_KEY } from '@libs/messaging/consts';
import { createPropertyDecorator } from '@nestjs/swagger/dist/decorators/helpers';
import { CONFIGURATION_KEY_METADATA } from '@libs/configuration/decorators/config.decorators';
import {
  After,
  AfterConstructor,
  Before,
  ExternalContextType,
  UseExternalContext,
} from '@libs/discovery';
import { MessagingParamsFactory } from '@libs/messaging/installer/messaging.installer';
import { OutgoingChannelDto } from '@libs/messaging/dto/outgoing-channel.dto';

export const OutgoingOld = (event: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata<string, MessagingMetadata>(OUTGOING_METADATA_KEY, {
      event,
      targetClass: target.constructor,
      targetName: target.constructor.name,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};

export const OutgoingNew = (event?: string): MethodDecorator => {
  return applyDecorators(
    AfterConstructor(
      (
        target,
        property,
        descriptor,
        instance,
        proxy,
        { logger, messagingConfig, connections },
      ) => {
        if (!instance.__outgoing_channel_dtos) {
          instance.__outgoing_channel_dtos = {};
        }

        const channelConfig: any =
          messagingConfig.getOutgoingEventConfiguration(event);

        const dto = OutgoingChannelDto.toDto({
          ...channelConfig,
          event,
        });

        const allCurrentOutgoingChannels =
          instance.__outgoing_channel_dtos[property] ?? [];
        instance.__outgoing_channel_dtos[property] = [
          ...allCurrentOutgoingChannels,
          dto,
        ];

        const matchingConnections = connections.filter(
          (conn) =>
            conn.driver === channelConfig.driver &&
            (channelConfig.name ? conn.name === channelConfig.name : true),
        );
        matchingConnections[0].addOutgoing(dto);

        logger.log(
          `Registered outgoing message handler ${
            target.constructor.name
          }:${property.toString()}`,
        );
        return '';
      },
    ),

    After((ctx, target, property, { logger }, payload: any) => {
      const outgoingCallbacks: OutgoingChannelDto[] =
        Object.values(target.__outgoing_channel_dtos[property]) ?? [];
      outgoingCallbacks.forEach((outgoingChannelDto) => {
        outgoingChannelDto?.publicator$?.next(payload);
      });
      logger.debug(
        `Sent all messages messages form ${
          target.constructor.name
        }:${property.toString()}`,
      );
      return '';
    }),
  );
};

export const Outgoing = OutgoingNew;
