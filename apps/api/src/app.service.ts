import { Logger, Provider, UsePipes, ValidationPipe } from '@nestjs/common';
import { Outgoing } from '@libs/messaging/decorators/outgoing.decorator';
import { Incoming } from '@libs/messaging/decorators/incoming.decorator';
import {
  IncomingConfiguration,
  Message,
} from '@libs/messaging/decorators/message.decorator';
import { IsDefined, ValidateNested } from 'class-validator';

export class TestDto {
  // @IsNumber()
  // @Min(0)
  challengeAmount: number;
}

export class Payload {
  content: string;
}

import {
  Config,
  ConfigProperty,
} from '@libs/configuration/decorators/config.decorators';
import { Type } from 'class-transformer';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { ConfigurationModule } from '@libs/configuration/configuration.module';

import { Injectable } from '@libs/discovery/decorators/injectable.decorator';
import {Traceable, Traced} from "@libs/telemetry/decorators/traced.decorator";

class Inner {
  @IsDefined()
  a: string;
  @IsDefined()
  b: string;


  @IsDefined()
  c: string;
}
class Nested {
  a: string;
  @IsDefined()
  b: string;
  @Type(() => Inner)
  @ValidateNested({ each: true })
  arr: Inner[];
  @Type(() => Inner)
  @ValidateNested({ each: true })
  arr2: Map<string, Inner>;
}

@Config('test')
@Traceable()
export class TestConfig {

  constructor(
  ) {
    console.log("TESTEST")
  }
  @ConfigProperty('inner')
  @Traced()
  a: string = '';
  @ConfigProperty('inner2')
  @Traced()
  b: string = '';
  @ConfigProperty('inner3')
  @Traced()
  c: Nested;
  @ConfigProperty('inner3')
  @Traced()
  test() {
    return 'asd2';
  }
}

@Injectable()
@Traceable()
// @UsePipes(new ValidationPipe({ transform: true }))
export class AppService {
  constructor(private readonly config: TestConfig) {
    const providers: Provider[] = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      ConfigurationModule,
    );
    const ex: Provider[] = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      ConfigurationModule,
    );
    console.log('Config');
  }
  @Outgoing('test_outgoing_message')
  @Traced()
  async getHello(): Promise<any> {
    const a = this.config.a;
    const b = this.config.b;
    const c = this.config.c;
    console.log('Configs', a, b, c);
    return {
      a,
      b,
      c,
      d: this.config.test(),
    };
  }

  @Outgoing('test_outgoing_kafka_message')
  getHelloKafka(msg: Payload): string {
    const a = this.config.a;
    return a;
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
