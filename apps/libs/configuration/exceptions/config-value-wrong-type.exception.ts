import { HttpException, HttpStatus } from '@nestjs/common';

export class ConfigValueWrongTypeException extends HttpException {
  constructor(message?: any, cause?: Error) {
    super(message ?? 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    this.cause = cause;
  }
}
