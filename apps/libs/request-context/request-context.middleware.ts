import { NextFunction } from 'express';
import { RequestContextDto } from './request-context.dto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { IRequestContextService } from './interfaces/request-context-service.interface';
import { RequestContextAsyncLocalStorage } from './request-context.als';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: IRequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const ctx = this.contextService.getContext() || {};
    ctx.requestId = req.headers['x-request-id'] as string;
    ctx.requestMethod = req.method;

    this.contextService.updateContext(ctx);
    return next();
  }
}

@Injectable()
export class RequestContextInitMiddleware implements NestMiddleware {
  constructor(private readonly storage: RequestContextAsyncLocalStorage) {}

  use(req: Request, res: Response, next: NextFunction) {
    const newContext = new RequestContextDto();

    this.storage.run(newContext, () => {
      return Promise.resolve(next());
    });
  }
}
