import { Injectable, UsePipes, ValidationPipe } from '@nestjs/common';
import { Outgoing } from '@libs/messaging/decorators/outgoing.decorator';
import { Incoming } from '@libs/messaging/decorators/incoming.decorator';
import {
  IncomingConfiguration,
  Message,
} from '@libs/messaging/decorators/message.decorator';
import { IsNumber, Min } from 'class-validator';

export class TestDto {
  // @IsNumber()
  // @Min(0)
  challengeAmount: number;
}

export class Payload {
  content: string;
}

@Injectable()
// @UsePipes(new ValidationPipe({ transform: true }))
export class AppService {
  @Outgoing('test_outgoing_message')
  async getHello(): Promise<any> {
    return {
      challengeAmount: 1,
      challengeAmounts: 1,
    };
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

  @Incoming('test_outgoing_message')
  @Outgoing('test_outgoing_message2')
  getHello2(
    @Message() msg: TestDto,
    @IncomingConfiguration() msg2: Payload,
  ): any {
    return {};
  }

  @Incoming('test_outgoing_message2')
  test(@Message() msg: any, @IncomingConfiguration() msg2: Payload): string {
    return 'Hello World!';
  }

  @Incoming('test_outgoing_message5')
  @Outgoing('test_outgoing_message4')
  getHello4(
    @Message() msg: Payload,
    @IncomingConfiguration() msg2: Payload,
  ): string {
    console.log('Received message');
    return 'Hello World!';
  }

  @Outgoing('test_outgoing_message5')
  getHello5(msg: string) {
    return msg;
  }

  getHello3(msg: any): string {
    return 'Hello World!';
  }
}
