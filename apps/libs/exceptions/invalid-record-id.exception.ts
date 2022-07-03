import { HttpException } from './http.exception';
import { HttpStatus } from '@nestjs/common';
import { Messages } from '../constants/messages';

export class InvalidRecordIdException extends HttpException {
  translatedMessage = Messages.ERROR_INVALID_RECORD_ID;
  constructor() {
    super(HttpStatus.BAD_REQUEST);
  }
}
