import { Replies } from 'amqplib/properties';
import RxChannel from '../RxChannel';
// import RxConfirmChannel from '../RxConfirmChannel';

export class AssertExchangeReply implements Replies.AssertExchange {
  public channel: RxChannel /*| RxConfirmChannel */;
  public exchange: string;

  constructor(channel: RxChannel /*| RxConfirmChannel */, reply: Replies.AssertExchange) {
    this.channel = channel;
    this.exchange = reply.exchange;
  }
}

export default AssertExchangeReply;
