import {Replies} from 'amqplib/properties';
import RxChannel from '../RxChannel';
// import RxConfirmChannel from '../RxConfirmChannel';

export class DeleteQueueReply implements Replies.DeleteQueue {
  public channel: RxChannel /*| RxConfirmChannel */;
  public messageCount: number;

  constructor(channel: RxChannel /*| RxConfirmChannel */, deleteQueue: Replies.DeleteQueue) {
    this.channel = channel;
    this.messageCount = deleteQueue.messageCount;
  }
}

export default DeleteQueueReply;
