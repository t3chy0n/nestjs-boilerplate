import { Module } from '@libs/discovery';

import './tracing.factory';
import './tracing';
import './drivers/jaeger/jaeger.config';

import { ITracing } from '@libs/telemetry/tracing.interface';

@Module({
  exports: [ITracing],
})
export class TelemetryModule {}
