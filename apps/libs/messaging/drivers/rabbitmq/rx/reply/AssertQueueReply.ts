import {Replies} from 'amqplib/properties';
import RxChannel from '../RxChannel';
// import RxConfirmChannel from '../RxConfirmChannel';

export class AssertQueueReply implements Replies.AssertQueue {
  public channel: RxChannel /*| RxConfirmChannel*/;
  public queue: string;
  public messageCount: number;
  public consumerCount: number;

  constructor(
    channel: RxChannel /*| RxConfirmChannel*/,
    reply: Replies.AssertQueue,
  ) {
    this.channel = channel;

    this.queue = reply.queue;
    this.messageCount = reply.messageCount;
    this.consumerCount = reply.consumerCount;
  }
}

export default AssertQueueReply;
