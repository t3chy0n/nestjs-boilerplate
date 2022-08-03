import { AbstractMessageDto } from '@libs/messaging/dto/abstract-message.dto';
import { RxChannel } from '@libs/messaging/drivers/event-emitter/rx/channel.rx';

/**
 * RxMessage Class
 */
export class RxMessage extends AbstractMessageDto {
  toRaw() {
    return {};
  }
  /**
   * RxMessage constructor.
   *
   * @param message
   * @param event
   * @param channel
   */
  constructor(
    public readonly message: any,
    public readonly event: string,
    public readonly channel?: RxChannel,
  ) {
    super();
  }

  /**
   * Acknowledge this message
   *
   * @param allUpTo
   */
  public ack(allUpTo?: boolean): void {
    //noop
  }

  /**
   * Reject this message. If requeue is true, the message will be put back onto the queue it came from.
   *
   * @param requeue
   */
  public nack(requeue?: boolean): void {
    //noop
  }
}

export default RxMessage;
