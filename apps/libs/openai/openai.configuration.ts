import {
  Config,
  ConfigProperty,
} from '@libs/configuration/decorators/config.decorators';

@Config('openai')
export class OpenAIConfiguration {
  @ConfigProperty('api-key')
  apiKey: string;
}
