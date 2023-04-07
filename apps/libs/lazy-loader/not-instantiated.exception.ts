import { HttpException, HttpStatus } from '@nestjs/common';

export class NotInstantiatedException extends HttpException {
  constructor(message?: string, cause?: Error) {
    super(message ?? 'Internal Server Error', HttpStatus.CONFLICT);
    this.cause = cause;
  }
}
