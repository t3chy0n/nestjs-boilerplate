import { Messages } from '../consts';
import { HttpException } from '@libs/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

/***
 * Thrown when job cannot be found
 */
export class JobWasAlreadyPaidException extends HttpException {
  translatedMessage = Messages.ERROR_JOB_WAS_ALREADY_PAID;
  constructor() {
    super(HttpStatus.CONFLICT);
  }
}
