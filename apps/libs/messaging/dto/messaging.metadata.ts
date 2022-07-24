import { MessagingDriver } from '@libs/messaging/consts';

export class MessagingMetadata {
  event?: string;
  queue?: string;
  topic?: string;
  exchange?: string;
  driver?: MessagingDriver;
  targetClass: string;
  targetName: string;
  methodName: string;
  callback: (message: any) => void;
}
