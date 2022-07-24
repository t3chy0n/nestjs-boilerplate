import { Injectable } from '@nestjs/common';
import { Outgoing } from '@libs/messaging/decorators/outgoing.decorator';
import { Incoming } from '@libs/messaging/decorators/incoming.decorator';
import {
  Connection,
  Message,
} from '@libs/messaging/decorators/message.decorator';

export class Payload {
  content: string;
}

@Injectable()
export class AppService {
  @Outgoing('test_outgoing_message')
  getHello(msg: Payload): string {
    return 'Hello World!';
  }

  @Outgoing('test_outgoing_kafka_message')
  getHelloKafka(msg: Payload): string {
    return 'Hello World kafka!';
  }

  @Incoming('test_outgoing_kafka_message')
  getHelloKafka2(msg: Payload): string {
    console.error('Received: ', msg.content);
    return 'Hello World kafka!';
  }

  @Outgoing('test_outgoing_message2')
  @Incoming('test_outgoing_message')
  getHello2(@Message() msg: Payload, @Connection() msg2: Payload): string {
    return 'Hello World!';
  }

  getHello3(msg: any): string {
    return 'Hello World!';
  }
}
