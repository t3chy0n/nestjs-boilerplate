import { Module } from '@libs/discovery';

import './tracing.factory';
import './tracing';
import './drivers/jaeger/jaeger.config';

import { ITracing } from '@libs/telemetry/tracing.interface';
import { RequestContextModule } from '@libs/request-context/request-context.module';
import { RequestSpanMiddleware } from '@libs/telemetry/request-span.middleware';
import { Global, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

@Global()
@Module({
  imports: [RequestContextModule],
  providers: [RequestSpanMiddleware],
  exports: [ITracing],
})
export class TelemetryModule {
  constructor(private readonly span: RequestSpanMiddleware) {}

  //Applies request context middlewares
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(this.span.use.bind(this.span)).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
