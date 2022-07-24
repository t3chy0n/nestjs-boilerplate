import {Replies} from 'amqplib/properties';
import RxChannel from '../RxChannel';
// import RxConfirmChannel from '../RxConfirmChannel';

export class PurgeQueueReply implements Replies.PurgeQueue {
  public channel: RxChannel /*| RxConfirmChannel */;
  public messageCount: number;

  constructor(channel: RxChannel/*| RxConfirmChannel */, deleteQueue: Replies.PurgeQueue) {
    this.channel = channel;
    this.messageCount = deleteQueue.messageCount;
  }
}

export default PurgeQueueReply;
