import { ILogger } from './logger.interface';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { Context } from '@libs/const';
import { HttpLoggerInterceptor } from './interceptors/http-logger.interceptor';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly httpLoggerInterceptor: HttpLoggerInterceptor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { contextType } = context as any;

    switch (contextType) {
      case Context.HTTP:
        return this.httpLoggerInterceptor.intercept(context, next);

      default:
        return next.handle();
    }
  }
}
