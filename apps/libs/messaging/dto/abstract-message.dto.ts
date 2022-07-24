export abstract class AbstractMessageDto {
  /**
   * Acknowledge this message
   *
   * @param allUpTo
   */
  abstract ack(allUpTo?: boolean): void;

  /**
   * Reject this message. If requeue is true, the message will be put back onto the queue it came from.
   *
   * @param requeue
   */
  abstract nack(requeue?: boolean): void;
}
