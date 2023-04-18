import { createParamDecorator } from '@libs/discovery';

export enum MessagingParamType {
  INCOMING_CONFIGURATION = 0,
  MESSAGE = 2,
}

export const Message = createParamDecorator(MessagingParamType.MESSAGE);
export const IncomingConfiguration = createParamDecorator(
  MessagingParamType.INCOMING_CONFIGURATION,
);
