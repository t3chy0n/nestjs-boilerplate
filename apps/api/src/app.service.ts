import { Provider } from '@nestjs/common';
import { Outgoing } from '@libs/messaging/decorators/outgoing.decorator';
import { Incoming } from '@libs/messaging/decorators/incoming.decorator';
import {
  IncomingConfiguration,
  Message,
} from '@libs/messaging/decorators/message.decorator';
import { IsDefined, ValidateNested } from 'class-validator';
import * as JSON5 from 'json5';

export class TestDto {
  // @IsNumber()
  // @Min(0)
  @IsDefined()
  aasd: number;
}

export class Payload {
  @IsDefined()
  queue22123: string;
}

import {
  Config,
  ConfigProperty,
} from '@libs/configuration/decorators/config.decorators';
import { Type } from 'class-transformer';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { ConfigurationModule } from '@libs/configuration/configuration.module';

import { Injectable } from '@libs/discovery/decorators/injectable.decorator';
import { Traced } from '@libs/telemetry/decorators/traced.decorator';
import { MessagingController } from '@libs/messaging/decorators';
import { IAIService } from '@libs/openai/ai-service.interface';

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
@Traced
@Config('test')
export class TestConfig {
  constructor() {
    console.log('TESTEST');
  }
  @ConfigProperty('inner')
  a: string = '';
  @ConfigProperty('inner2')
  b: string = '';

  @ConfigProperty('inner3')
  c: Nested;

  @ConfigProperty('inner3')
  test() {
    return 'asd2';
  }
}

const JsonSchemaEnrichmentPrompt = `
  Given a JSONSchema of configuration, do following:
  0. Group all config keys and parents, by realistic company departments.
     add all detected departments in property's __aiMetadata as array of strings named 'departments'
  1. For parent nodes, prepare a 'title' and 'description' describing what section is about.
  2. Infer 'title' for every property in a schema.
  3. Infer 'description', that will best describe given property. Explain in details what key does.
  4. Infer 'placeholder', for an input field.
  5. Infer whether or not field shoulbe be 'secret' as boolean value,
  6. Infer most suitable 'iconSVG' from simple-icons library for a property only if it exists in library. Also suggest CSS class 'iconClass' 
     for this config key from fontawesome. Select most appropriate color to match true logo and save as 'iconColor' in hex.
  7. All above values should be added it __aiMetadata object on property value level.
     Remove original schema properties other than __aiMetadata properties at this level.
  8. Output valid enriched raw json only without any extra text,
  
  JSONSchema: {
  "$id": "https://example.com/person.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Person",
  "type": "object",
  "properties": {
    "rabbitmq": {
      "host": {
        "type": "string",
      },
      "user": {
        "type": "string",
      },
      "password": {
        "type": "string",
      },
    },
    "lastName": {
      "type": "string",
    },
    "age": {
      "type": "integer",
      "minimum": 0
    }
  }
}
`;

const TemplatedEmailGeneration = (whatFor: string) => `
  1. Generate an mjml email which will be used ${whatFor}
  2. Email will be sent from commertial app, it needs to have proper layout, styling and images
  3. Deduce all templateable fields and remember them as 'fields'
  4. Structure of email should be json of form { "fields": <fields here>, "email": <generated email here>}
  5. Print only raw json without any extra text
`;

@Injectable()
@Traced
@MessagingController()
// @UsePipes(new ValidationPipe({ transform: true }))
export class AppService {
  constructor(
    private readonly config: TestConfig,
    private readonly ai: IAIService,
  ) {
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
  async getHello(p: string): Promise<any> {
    const res = await this.ai.query(JsonSchemaEnrichmentPrompt);
    let json;
    let raw;
    try {
      raw = res.replace(/\n/g, '');
      json = JSON5.parse(`${raw}`);
    } catch (e) {
      console.error('Couldnt parse', e);
    }

    return { raw, json };
  }
  @Outgoing('test_outgoing_kafka_message')
  getHelloKafka(msg: Payload): string {
    const a = this.config.a;
    return a;
  }

  @Incoming('test_outgoing_kafka_message')
  getHelloKafka2(msg: Payload): string {
    console.error('Received: ', msg);
    return 'Hello World kafka!';
  }

  @Incoming('test_outgoing_message')
  @Outgoing('test_outgoing_message5')
  getHello2(
    @Message() msg: TestDto,
    @IncomingConfiguration() msg2: Payload,
  ): any {
    throw new Error('TEST ERROR RECEIVE');
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

  // @Outgoing('test_outgoing_message5')
  getHello5(msg: string) {
    return msg;
  }

  getHello3(msg: any): string {
    return 'Hello World!';
  }
}
