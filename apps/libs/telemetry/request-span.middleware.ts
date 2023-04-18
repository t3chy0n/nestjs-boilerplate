import { NextFunction } from 'express';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ITracing } from '@libs/telemetry/tracing.interface';

@Injectable()
export class RequestSpanMiddleware implements NestMiddleware {
  constructor(
    private readonly tracer: ITracing,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const name = `${req.method.toUpperCase()} /${req.baseUrl}`;
    return this.tracer.startSpan(name, (s) => {
      const res = next();

      s.end();

      return res;
    });
  }
}
