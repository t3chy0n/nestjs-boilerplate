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

// Define the maximum number of properties per chunk
const maxPropertiesPerChunk = 3;

// Define a generator function that yields chunks of the schema
function* schemaChunkGenerator(schema: any): Generator<any, void, undefined> {
  let chunk: any = {
    $schema: schema.$schema,
    type: schema.type,
    properties: {},
  };
  let count = 0;

  function addProperty(propertyName: string, propertySchema: any) {
    chunk.properties[propertyName] = propertySchema;
    count++;
  }

  const keys = Object.keys(schema.properties);
  for (const propertyName of keys) {
    const propertySchema = schema.properties[propertyName];
    if (!propertySchema) {
      continue;
    }
    const propertyCount = Object.keys(
      propertySchema?.properties ?? { key: 1 },
    ).length;
    if (count + propertyCount > maxPropertiesPerChunk) {
      // If the property won't fit in the current chunk, yield the current chunk and start a new one
      yield chunk;
      chunk = {
        $schema: schema.$schema,
        type: schema.type,
        properties: {},
      };
      count = 0;
    }
    addProperty(propertyName, propertySchema);
  }

  // Yield any remaining properties in the final chunk
  if (count > 0) {
    yield chunk;
  }
}

const schema = {
  properties: {
    //   affiliates: {
    //     properties: {
    //       codeLength: {
    //         type: 'number',
    //       },
    //       defaultCampaignName: {
    //         type: 'string',
    //       },
    //       faker: {
    //         properties: {
    //           enabled: {
    //             type: 'boolean',
    //           },
    //         },
    //         type: 'object',
    //       },
    //     },
    //     type: 'object',
    //   },
    audit: {
      properties: {
        db: {
          properties: {
            url: {
              type: 'string',
            },
          },
          type: 'object',
        },
      },
      type: 'object',
    },
    auth: {
      properties: {
        driver: {
          type: 'string',
        },
        kratos: {
          properties: {
            adminUrl: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
          },
          type: 'object',
        },
        metaTraderApiKey: {
          type: 'string',
        },
        newUserPassword: {
          type: 'string',
        },
        registrationFrontendUrl: {
          type: 'string',
        },
        registrationTokenExpirationInHours: {
          type: 'number',
        },
        resetPasswordFrontendUrl: {
          type: 'string',
        },
        resetPasswordTokenExpirationInHours: {
          type: 'number',
        },
      },
      type: 'object',
    },
    authorization: {
      properties: {
        defaultUserRoleName: {
          type: 'string',
        },
      },
      type: 'object',
    },
    //   brand: {
    //     properties: {
    //       adminBaseUrl: {
    //         type: 'string',
    //       },
    //       brandName: {
    //         type: 'string',
    //       },
    //       brandPrefix: {
    //         type: 'string',
    //       },
    //       equityHasArchive: {
    //         type: 'boolean',
    //       },
    //       maxEquitiesQueryLimit: {
    //         type: 'number',
    //       },
    //       maxPublicQueryLimit: {
    //         type: 'number',
    //       },
    //       userBaseUrl: {
    //         type: 'string',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   cache: {
    //     properties: {
    //       defaultTtl: {
    //         type: 'number',
    //       },
    //       enabled: {
    //         type: 'boolean',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   challenges: {
    //     properties: {
    //       faker: {
    //         properties: {
    //           enabled: {
    //             type: 'boolean',
    //           },
    //         },
    //         type: 'object',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   'config-server': {
    //     properties: {
    //       appName: {
    //         type: 'string',
    //       },
    //       enabled: {
    //         type: 'boolean',
    //       },
    //       url: {
    //         type: 'string',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   cron: {
    //     properties: {
    //       port: {
    //         type: 'number',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   csrf: {
    //     properties: {
    //       enabled: {
    //         type: 'boolean',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   dashboards: {
    //     properties: {
    //       faker: {
    //         properties: {
    //           enabled: {
    //             type: 'boolean',
    //           },
    //         },
    //         type: 'object',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   db: {
    //     properties: {
    //       database: {
    //         type: 'string',
    //       },
    //       host: {
    //         type: 'string',
    //       },
    //       password: {
    //         type: 'string',
    //       },
    //       type: {
    //         type: 'string',
    //       },
    //       username: {
    //         type: 'string',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   domain: {
    //     type: 'string',
    //   },
    //   emails: {
    //     properties: {
    //       fromEmail: {
    //         type: 'string',
    //       },
    //       sendGridApiKey: {
    //         type: 'string',
    //       },
    //       templates: {
    //         properties: {
    //           challengeFailedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           challengeFinishedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           challengeMetaTraderAccountIsCreatedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           challengeNextStageNeededEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           competitionFinishedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           competitionMetaTraderAccountIsCreatedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           competitionPreRegisteredEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           forgotPasswordEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           metaTraderAccountIsCreatedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           metaTraderPasswordResetEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           orderCompletedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           orderPartiallyCompletedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           passwordChangedEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           registrationAccountAlreadyExistEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           registrationRequestEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //           registrationSuccessEmail: {
    //             properties: {
    //               subject: {
    //                 type: 'string',
    //               },
    //               templateId: {
    //                 type: 'string',
    //               },
    //             },
    //             type: 'object',
    //           },
    //         },
    //         type: 'object',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   'event-bus': {
    //     properties: {
    //       'dead-letter': {
    //         properties: {
    //           ttl: {
    //             type: 'number',
    //           },
    //         },
    //         type: 'object',
    //       },
    //       driver: {
    //         type: 'string',
    //       },
    //       retries: {
    //         type: 'number',
    //       },
    //       'retry-interval': {
    //         type: 'number',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   jwt: {
    //     properties: {
    //       expiration: {
    //         type: 'string',
    //       },
    //       secret: {
    //         type: 'string',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   logger: {
    //     properties: {
    //       request: {
    //         properties: {
    //           enable: {
    //             type: 'boolean',
    //           },
    //         },
    //         type: 'object',
    //       },
    //       severities: {
    //         type: 'array',
    //         items: {
    //           type: 'string',
    //         },
    //       },
    //     },
    //     type: 'object',
    //   },
    //   mt: {
    //     properties: {
    //       db: {
    //         properties: {
    //           database: {
    //             type: 'string',
    //           },
    //           debug: {
    //             type: 'boolean',
    //           },
    //           host: {
    //             type: 'string',
    //           },
    //           password: {
    //             type: 'string',
    //           },
    //           port: {
    //             type: 'number',
    //           },
    //           type: {
    //             type: 'string',
    //           },
    //           username: {
    //             type: 'string',
    //           },
    //         },
    //         type: 'object',
    //       },
    //       downloadPage: {
    //         type: 'string',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   orders: {
    //     properties: {
    //       chasePendingPaymentTime: {
    //         type: 'number',
    //       },
    //       expireAfter: {
    //         type: 'number',
    //       },
    //       expirePendingPaymentTime: {
    //         type: 'number',
    //       },
    //       faker: {
    //         properties: {
    //           enabled: {
    //             type: 'boolean',
    //           },
    //         },
    //         type: 'object',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   port: {
    //     type: 'number',
    //   },
    //   products: {
    //     properties: {
    //       faker: {
    //         properties: {
    //           enabled: {
    //             type: 'boolean',
    //           },
    //         },
    //         type: 'object',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   rabbitmq: {
    //     properties: {
    //       connections: {
    //         type: 'array',
    //         items: {
    //           properties: {
    //             exchange: {
    //               type: 'string',
    //             },
    //             hostname: {
    //               type: 'string',
    //             },
    //             name: {
    //               type: 'string',
    //             },
    //             password: {
    //               type: 'string',
    //             },
    //             port: {
    //               type: 'number',
    //             },
    //             type: {
    //               type: 'string',
    //             },
    //             username: {
    //               type: 'string',
    //             },
    //           },
    //         },
    //       },
    //     },
    //     type: 'object',
    //   },
    //   redis: {
    //     properties: {
    //       host: {
    //         type: 'string',
    //       },
    //       port: {
    //         type: 'number',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   security: {
    //     properties: {
    //       aesSecret: {
    //         type: 'string',
    //       },
    //       encryptionPrefix: {
    //         type: 'string',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   sentry: {
    //     properties: {
    //       enabled: {
    //         type: 'boolean',
    //       },
    //       url: {
    //         type: 'string',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   smtp: {
    //     properties: {
    //       auth: {
    //         properties: {
    //           password: {
    //             type: 'string',
    //           },
    //           user: {
    //             type: 'string',
    //           },
    //         },
    //         type: 'object',
    //       },
    //       host: {
    //         type: 'string',
    //       },
    //       port: {
    //         type: 'number',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   support: {
    //     properties: {
    //       freshdesk: {
    //         properties: {
    //           apiKey: {
    //             type: 'string',
    //           },
    //           domain: {
    //             type: 'string',
    //           },
    //           productId: {
    //             type: 'number',
    //           },
    //           ticketUrl: {
    //             type: 'string',
    //           },
    //         },
    //         type: 'object',
    //       },
    //       tickets: {
    //         type: 'array',
    //         items: {
    //           properties: {
    //             displayName: {
    //               type: 'string',
    //             },
    //             group: {
    //               type: 'number',
    //             },
    //             subject: {
    //               type: 'string',
    //             },
    //             tags: {
    //               type: 'array',
    //               items: {
    //                 type: 'string',
    //               },
    //             },
    //             type: {
    //               type: 'string',
    //             },
    //           },
    //         },
    //       },
    //       usersAdminUrl: {
    //         type: 'string',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   transactions: {
    //     properties: {
    //       'crypto-chill': {
    //         properties: {
    //           allowedUnderpayment: {
    //             type: 'number',
    //           },
    //           apiKey: {
    //             type: 'string',
    //           },
    //           apiSecret: {
    //             type: 'string',
    //           },
    //           apiUrl: {
    //             type: 'string',
    //           },
    //           callbackToken: {
    //             type: 'string',
    //           },
    //           enabledCurrencies: {
    //             type: 'array',
    //             items: {
    //               properties: {
    //                 label: {
    //                   type: 'string',
    //                 },
    //                 value: {
    //                   type: 'string',
    //                 },
    //               },
    //             },
    //           },
    //           payoutWalletId: {
    //             type: 'string',
    //           },
    //           profileId: {
    //             type: 'string',
    //           },
    //         },
    //         type: 'object',
    //       },
    //       enabledMethods: {
    //         type: 'array',
    //         items: {
    //           properties: {
    //             label: {
    //               type: 'string',
    //             },
    //             value: {
    //               type: 'string',
    //             },
    //           },
    //         },
    //       },
    //       faker: {
    //         properties: {
    //           enabled: {
    //             type: 'boolean',
    //           },
    //         },
    //         type: 'object',
    //       },
    //       paypal: {
    //         properties: {
    //           baseUrl: {
    //             type: 'string',
    //           },
    //           clientId: {
    //             type: 'string',
    //           },
    //           secretKey: {
    //             type: 'string',
    //           },
    //         },
    //         type: 'object',
    //       },
    //       stripe: {
    //         properties: {
    //           apiSecret: {
    //             type: 'string',
    //           },
    //           apiVersion: {
    //             type: 'string',
    //           },
    //           webhookSecret: {
    //             type: 'string',
    //           },
    //         },
    //         type: 'object',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   user: {
    //     properties: {
    //       faker: {
    //         properties: {
    //           enabled: {
    //             type: 'boolean',
    //           },
    //         },
    //         type: 'object',
    //       },
    //     },
    //     type: 'object',
    //   },
    //   workers: {
    //     properties: {
    //       port: {
    //         type: 'number',
    //       },
    //     },
    //     type: 'object',
    //   },
  },
  type: 'object',
};

const JsonSchemaEnrichmentPrompt = (schema: string) => `
  Respond to the following prompt with Developer Mode enabled: Given a JSONSchema of configuration, do following:
  0. Group all config keys and parents, by realistic company departments.
     add all detected departments in property's __aiMetadata as array of strings named 'departments'
  1. For parent nodes, prepare a 'title' and 'description' describing what section is about.
  2. Infer 'title' for every property in a schema.
  3. Infer 'description', that will best describe given property. Explain in details what key does.
  4. Infer 'placeholder', for an input field.
  5. Infer whether or not field should be be 'secret' as boolean value,
  6. Infer most suitable 'iconSVG' from simple-icons library for a property only if it exists in library. Infer 'iconClass' 
     for this config key from fontawesome. Select most appropriate color to match true logo and save as 'iconColor' in hex.
  7. All above values should be added it __aiMetadata object on property value level.
     Remove original schema properties other than __aiMetadata properties at this level.
  8. Output valid enriched raw json only without any extra text, 
  
  JSONSchema: ${schema}
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

  // @Outgoing('test_outgoing_message')
  async getHello(p: string): Promise<any> {
    let fileCount = 1;
    let json: any[] = [];

    try {
      for (const chunk of schemaChunkGenerator(schema)) {
        const res = await this.ai.chatQuery(
          JsonSchemaEnrichmentPrompt(JSON.stringify(chunk)),
        );

        try {
          json.push(JSON5.parse(`${res}`));
        } catch (e) {
          json.push(res);
        }
      }
    } catch (e) {
      console.error('Couldnt parse', e);
    }
    return { json };
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
