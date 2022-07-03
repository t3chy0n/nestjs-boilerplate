import { Messages } from '../consts';
import { HttpException } from '@libs/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

/***
 * Thrown when job cannot be found
 */
export class JobNotFoundException extends HttpException {
  translatedMessage = Messages.ERROR_NOT_FOUND;
  constructor() {
    super(HttpStatus.NOT_FOUND);
  }
}
