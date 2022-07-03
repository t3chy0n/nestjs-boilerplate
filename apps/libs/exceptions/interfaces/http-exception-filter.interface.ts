import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';

export abstract class IHttpExceptionFilter implements ExceptionFilter {
  abstract catch(exception: HttpException, host: ArgumentsHost);
}
