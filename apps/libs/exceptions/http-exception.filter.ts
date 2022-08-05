import { HttpException as InternalHttpException } from '@libs/exceptions/http.exception';
import { ILogger } from '@libs/logger/logger.interface';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';

import { IHttpExceptionFilter } from '@libs/exceptions/interfaces/http-exception-filter.interface';

@Injectable()
export class HttpExceptionFilter implements IHttpExceptionFilter {
  constructor(private readonly logger: ILogger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (
      exception instanceof InternalHttpException ||
      exception instanceof HttpException
    ) {
      const status = exception.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;

      const res = exception.getResponse();

      this.logger.error(`Error ${typeof exception}: ${JSON.stringify(res)}`);

      response?.status(status).json({
        status: exception.getStatus(),
        message: exception.message,
        ...(typeof res === 'object' ? res : { message: res }),
      });
      return;
    }

    ///Log not translated errors, we need to have visibility on this, if we miss or missimplement some exceptions
    this.logger.error(
      `Exception of type ${typeof exception} needs to be instance of internal HttpException`,
    );
    this.logger.error(`Exception was thrown here: ${(exception as any).stack}`);
    response?.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: (exception as Error).message,
    });
  }
}

export class HttpExceptionFilterStub implements IHttpExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {}
}
