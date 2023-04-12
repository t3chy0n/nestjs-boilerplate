import { DynamicModule, Global, Module, Scope } from '@nestjs/common';
import { ConsoleDriver } from './drivers/console.driver';
import { ILogger } from './logger.interface';
import { LoggerService } from './logger.service';
import { LoggerInterceptor } from './logger.interceptor';
import { ConfigurationModule } from '../configuration/configuration.module';
import { IJsonObfuscator } from './interfaces/json-obfuscator.interface';
import { JsonObfuscator } from './json-obfuscator.service';
import { HttpLoggerInterceptor } from './interceptors/http-logger.interceptor';

@Global()
@Module({
  imports: [],
  providers: [
    ConsoleDriver,
    LoggerInterceptor,
    HttpLoggerInterceptor,
    {
      scope: Scope.TRANSIENT,
      provide: 'LOGGER_DRIVERS',
      useFactory: (...drivers: ILogger[]) => [...drivers],
      inject: [ConsoleDriver],
    },
    {
      provide: ILogger,
      useClass: LoggerService,
    },
    {
      provide: IJsonObfuscator,
      useClass: JsonObfuscator,
    },
  ],
  exports: [ILogger, LoggerInterceptor, IJsonObfuscator],
})
export class LoggerModule {}
