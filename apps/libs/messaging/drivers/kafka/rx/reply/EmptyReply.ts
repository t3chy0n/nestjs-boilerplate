import { Replies } from 'amqplib/properties';
import RxConnection from '@libs/messaging/drivers/kafka/rx/RxConnection';

export class EmptyReply implements Replies.Empty {
  constructor(public readonly connection: RxConnection) {}
}
