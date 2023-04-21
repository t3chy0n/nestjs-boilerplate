import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message?: any, cause?: Error) {
    super(message ?? 'Bad request', HttpStatus.BAD_REQUEST);
    this.cause = cause;
  }
}
