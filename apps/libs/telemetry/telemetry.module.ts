import { Module } from '@libs/discovery';

import './tracing.factory';
import './tracing';

import { ITracing } from '@libs/telemetry/tracing.interface';

@Module({
  exports: [ITracing],
})
export class TelemetryModule {}
