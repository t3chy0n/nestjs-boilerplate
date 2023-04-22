import { Module } from '@libs/discovery';

import './openai.factory';
import './openai.service';
import './openai.configuration';

import { Global } from '@nestjs/common';
import { IAIService } from '@libs/openai/ai-service.interface';

@Global()
@Module({
  exports: [IAIService],
})
export class OpenaiModule {
  constructor() {}

  //Applies request context middlewares
}
