import { AbstractMessageDto } from '@libs/messaging/dto/abstract-message.dto';
import { RxConsumer } from '@libs/messaging/drivers/kafka/rx/RxConsumer';
import { EachMessagePayload, KafkaMessage } from 'kafkajs';
// import RxConfirmChannel from './RxConfirmChannel';

/**
 * RxMessage Class
 */
export class RxMessage extends AbstractMessageDto {
  public consumer: RxConsumer;

  public topic: string;
  public partition: number;
  public message: KafkaMessage;

  toRaw() {
    return {};
  }
  /**
   * RxMessage constructor.
   *
   * @param message
   * @param consumer
   */
  constructor(message: EachMessagePayload, consumer?: RxConsumer) {
    super();

    this.topic = message.topic;
    this.partition = message.partition;
    this.message = message.message;
  }

  /**
   * Acknowledge this message
   *
   * @param allUpTo
   */
  public ack(allUpTo?: boolean): void {
    // return this.channel.ack(this, allUpTo);
  }

  /**
   * Reject this message. If requeue is true, the message will be put back onto the queue it came from.
   *
   * @param requeue
   */
  public nack(requeue?: boolean): void {
    // return this.channel.nack(this, false, requeue);
  }
}

export default RxMessage;
