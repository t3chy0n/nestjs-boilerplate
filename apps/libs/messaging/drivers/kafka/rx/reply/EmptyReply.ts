import { Replies } from 'amqplib/properties';
import RxConnection from '@libs/messaging/drivers/kafka/rx/connection.rx';

export class EmptyReply implements Replies.Empty {
  constructor(public readonly connection: RxConnection) {}
}
