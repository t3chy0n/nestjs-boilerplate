import { IAIService } from '@libs/openai/ai-service.interface';
import { from, Observable } from 'rxjs';
import { Traced } from '@libs/telemetry/decorators/traced.decorator';
import { OpenAIApi } from 'openai';
import { Injectable } from '@libs/discovery';
import { OpenAIConfiguration } from '@libs/openai/openai.configuration';

enum OpenAIModel {
  DAVINCI = 'text-davinci-003',
  CHAT_GPT = 'gpt-3.5-turbo',
}
@Injectable({ provide: IAIService })
@Traced
export class OpenAIService implements IAIService {
  constructor(
    private readonly openAi: OpenAIApi,
    private readonly config: OpenAIConfiguration,
  ) {}

  async models() {
    const res = await this.openAi.listModels();
    return res.data;
  }
  async query(prompt: string): Promise<string> {
    const models = await this.models();
    const completion = await this.openAi.createCompletion({
      model: OpenAIModel.DAVINCI,
      prompt,
      temperature: 0,
      max_tokens: 1000,
    });

    let res = '';
    for (const parts of completion.data.choices) res = `${res}${parts.text}`;

    return res;
  }
  async chatQuery(prompt: string): Promise<string> {
    const models = await this.models();

    const history: any[] = [{ role: 'user', content: prompt }];

    const completion = await this.openAi.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: history,
      temperature: 0.2,
    });

    let res = '';
    for (const parts of completion.data.choices) {
      res = `${res}${parts.message.content}`;
    }

    return res;
  }
}
