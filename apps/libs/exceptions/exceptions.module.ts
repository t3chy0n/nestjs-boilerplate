import { Global, Module } from '@nestjs/common';
import {
  HttpExceptionFilter,
  HttpExceptionFilterStub,
} from './http-exception.filter';
import { IHttpExceptionFilter } from './interfaces/http-exception-filter.interface';

@Global()
@Module({})
export class ExceptionsModule {
  static forRoot() {
    return {
      module: ExceptionsModule,
      providers: [
        { provide: IHttpExceptionFilter, useClass: HttpExceptionFilter },
      ],
      exports: [IHttpExceptionFilter],
    };
  }

  static forTests() {
    return {
      module: ExceptionsModule,
      providers: [
        { provide: IHttpExceptionFilter, useClass: HttpExceptionFilterStub },
      ],
      exports: [IHttpExceptionFilter],
    };
  }
}
