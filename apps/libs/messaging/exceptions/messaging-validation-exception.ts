import { HttpException, HttpStatus } from '@nestjs/common';

export class MessagingValidationException extends HttpException {
  constructor(message?: any, cause?: Error) {
    super(message ?? 'Wrong message parameters!!!', HttpStatus.BAD_REQUEST);
    this.cause = cause;
  }
}
