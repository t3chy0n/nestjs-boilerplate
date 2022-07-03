import { IRequestContextService } from './interfaces/request-context-service.interface';
import { RequestContextDto } from '@libs/request-context/request-context.dto';
import { RequestContextAsyncLocalStorage } from './request-context.als';
import { Injectable } from '@nestjs/common';

/***
 * Implementation of services that handles request context
 */
@Injectable()
export class RequestContextService implements IRequestContextService {
  constructor(private readonly storage: RequestContextAsyncLocalStorage) {}
  getContext(): RequestContextDto {
    const context = this.storage.getStore();
    if (!context) {
      return {};
    }
    return context;
  }

  updateContext(ctx: RequestContextDto) {
    this.storage.enterWith(ctx);
  }
}
