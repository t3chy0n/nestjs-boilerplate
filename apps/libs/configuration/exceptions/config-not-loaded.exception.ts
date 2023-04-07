import { HttpException, HttpStatus } from '@nestjs/common';

export class ConfigValueNotLoadedException extends HttpException {
  constructor(message?: string, cause?: Error) {
    super(message ?? 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    this.cause = cause;
  }
}
