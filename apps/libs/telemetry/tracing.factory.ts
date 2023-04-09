import { Factory, Injectable } from '@libs/discovery';
import { ITracing } from '@libs/telemetry/tracing.interface';
import opentelemetry from '@opentelemetry/api';

/***
 * Factory class instantiating new tracing service
 */
@Injectable()
export class TracingFactory {
  constructor() {
    console.log('Tracing Factory');
  }

  /***
   * Create new instance of Configuration adapter, with all configuration drivers
   */
  @Factory({ provide: ITracing })
  async create(): Promise<ITracing> {
    return opentelemetry.trace.getTracer('my-service-tracer');
  }
}
