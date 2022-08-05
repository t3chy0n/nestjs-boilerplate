export enum AcknowledgementStrategy {
  PRE_PROCESSING = 'pre_processing',
  POST_PROCESSING = 'post_processing',
}

export class AcknowledgementMetadata {
  ack: AcknowledgementStrategy;
  targetClass: string;

  targetName: string;
  methodName: string;
  callback: (message: any) => void;
}
