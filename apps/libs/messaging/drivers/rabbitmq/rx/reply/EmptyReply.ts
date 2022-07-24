import {Replies} from 'amqplib/properties';
import RxChannel from '../RxChannel';
// import RxConfirmChannel from '../RxConfirmChannel';

export class EmptyReply implements Replies.Empty {
  public channel: RxChannel /*| RxConfirmChannel */;

  constructor(channel: RxChannel /*| RxConfirmChannel */) {
    this.channel = channel;
  }
}

export default EmptyReply;
