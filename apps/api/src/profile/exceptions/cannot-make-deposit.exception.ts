import { Messages } from '../consts';
import { HttpException } from '@libs/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

/***
 * Thrown when contract cannot be found
 */
export class CannotMakeDepositException extends HttpException {
  translatedMessage = Messages.ERROR_CANNOT_MAKE_DEPOSIT;
  constructor() {
    super(HttpStatus.NOT_ACCEPTABLE);
    this.message = Messages.ERROR_CANNOT_MAKE_DEPOSIT;
  }
}
