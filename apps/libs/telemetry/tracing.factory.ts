import { Factory, Injectable } from '@libs/discovery';
import { ITracing } from '@libs/telemetry/tracing.interface';
import { JaegerTracerDriver } from '@libs/telemetry/drivers/jaeger/tracer.driver';
import {Global} from "@nestjs/common";

/***
 * Factory class instantiating new tracing service
 */
@Injectable()
export class TracingFactory {
  constructor(private jaegerDriver: JaegerTracerDriver) {
    console.log('Tracing Factory');
  }

  /***
   * Create new instance of Configuration adapter, with all configuration drivers
   */
  @Factory({ provide: ITracing })
  async create(): Promise<ITracing> {

    this.jaegerDriver.initialize();
    return this.jaegerDriver;
  }
}
