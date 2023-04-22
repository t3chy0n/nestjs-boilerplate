import { Factory, Injectable } from '@libs/discovery';
import { Configuration, OpenAIApi } from 'openai';
import { OpenAIConfiguration } from "@libs/openai/openai.configuration";

@Injectable()
export class OpenAIFactory {
  constructor(private readonly config: OpenAIConfiguration) {}

  @Factory({ provide: OpenAIApi })
  create(): OpenAIApi {
    const configuration = new Configuration({
      apiKey: this.config.apiKey,
    });
    return new OpenAIApi(configuration);
  }
}
