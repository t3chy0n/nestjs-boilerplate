import { HttpException, HttpStatus } from '@nestjs/common';

export class ConfigUnknownException extends HttpException {
  constructor(message?: string, cause?: Error) {
    super('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    this.cause = cause;
  }
}
