import { ILogger } from '../logger.interface';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, throwError } from 'rxjs';
import { Request } from 'express';
import { catchError } from 'rxjs/operators';
import { IJsonObfuscator } from '../interfaces/json-obfuscator.interface';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: ILogger,
    private readonly obfuscator: IJsonObfuscator,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();

    const body = this.obfuscator.obfuscate({ ...request.body });
    const stringifiedBody = JSON.stringify(body);

    const headers = this.obfuscator.obfuscate({ ...request.headers });
    const stringifiedHeaders = JSON.stringify(headers);

    const now = Date.now();

    const method = request.method;
    const url = request.originalUrl;

    // this.logger.debug(
    //   `Request ${request.method} ${request.path} - body: ${stringifiedBody} headers: ${stringifiedHeaders}`,
    // );

    return next.handle().pipe(
      tap((rawBody) => {
        const body = this.obfuscator.obfuscate({ ...rawBody });
        const stringifiedBody = JSON.stringify(body);

        const delay = Date.now() - now;
        // this.logger.debug(
        //   `Response ${request.method} ${request.path} - body: ${stringifiedBody} - ${delay}ms`,
        // );
      }),
      catchError((error: HttpException) => {
        if (error instanceof HttpException) {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.error(
            `${error?.getStatus()} | [${method}] ${url} - ${delay}ms`,
          );
        }

        return throwError(error);
      }),
    );
  }
}
