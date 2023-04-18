
export const INCOMMING_METADATA_KEY = 'Messaging.incomming.metadata';
export const DRIVER_METADATA_KEY = 'Messaging.driver.metadata';
export const OUTGOING_METADATA_KEY = 'Messaging.publisher.metadata';
export const CHANNEL_METADATA_KEY = 'Messaging.channel.metadata';
export const QUEUE_METADATA_KEY = 'Messaging.channel.metadata';
export const EXCHANGE_METADATA_KEY = 'Messaging.channel.metadata';
export const ACKNOWLEDGEMENT_METADATA_KEY =
  'Messaging.acknowledgement.metadata';

export enum MessagingDriver {
  RABBITMQ = 'rabbitmq',
  SQS = 'sqs',
  KAFKA = 'kafka',
  MEMORY = 'memory',
}

export const MessagingConfig = {
  INCOMING: 'messaging.incoming',
  OUTGOING: 'messaging.outgoing',
  CONNECTIONS: 'messaging.connections',
  RABBITMQ_CONNECTIONS: `messaging.connections.${MessagingDriver.RABBITMQ}`,
  KAFKA_CONNECTIONS: `messaging.connections.${MessagingDriver.SQS}`,
  SQS_CONNECTIONS: `messaging.connections.${MessagingDriver.KAFKA}`,
  DEAD_LETTER_TTL: 'messaging.dead-letter.ttl',
  RETRIES: 'messaging.retries',
  RETRY_INTERVAL: 'messaging.retry-interval',
};
