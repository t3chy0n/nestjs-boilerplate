import { Messages } from '../consts';
import { HttpException } from '@libs/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

/***
 * Thrown when contract cannot be found
 */
export class ContractNotFoundException extends HttpException {
  translatedMessage = Messages.ERROR_NOT_FOUND;
  constructor() {
    super(HttpStatus.NOT_FOUND);
  }
}
