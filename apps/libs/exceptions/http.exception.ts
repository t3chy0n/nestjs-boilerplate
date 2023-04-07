import { HttpStatus } from '@nestjs/common';
import { HttpException as NestJsHttpException } from '@nestjs/common';

export class HttpException extends NestJsHttpException {
  private _params: any[] = [];
  private _cause: Error;
  protected translatedMessage: string;
  public message: string;

  constructor(status?: HttpStatus) {
    super({}, status ?? HttpStatus.SERVICE_UNAVAILABLE);
    this.message = '';
  }

  params(...args: any[]): HttpException {
    this._params = args;
    return this;
  }

  translation(translationKey: string): HttpException {
    this.translatedMessage = translationKey;
    return this;
  }

  setMessage(message: string): HttpException {
    this.message = message;
    return this;
  }

  setCause(error: Error): HttpException {
    this._cause = error;
    return this;
  }

  getCause(): Error {
    return this._cause;
  }

  getParams(): any[] {
    return this._params;
  }

  getTranslationKey(): string {
    return this.translatedMessage;
  }
}
