import { SetMetadata } from '@nestjs/common';
import { ACKNOWLEDGEMENT_METADATA_KEY} from "@libs/messaging/consts";
import { AcknowledgementMetadata, AcknowledgementStrategy } from "@libs/messaging/dto/akcnowledgement.metadata";

export const Acknowledgement = (ack: AcknowledgementStrategy) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata<string, AcknowledgementMetadata>(ACKNOWLEDGEMENT_METADATA_KEY, {
      ack,
      targetClass: target.constructor,
      targetName: target.constructor.name,
      methodName: propertyKey,
      callback: descriptor.value,
    })(target, propertyKey, descriptor);
  };
};
