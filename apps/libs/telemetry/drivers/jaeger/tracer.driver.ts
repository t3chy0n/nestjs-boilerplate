import { ITracing } from '@libs/telemetry/tracing.interface';
import { Span } from '@opentelemetry/api/build/src/trace/span';
import { Injectable } from '@libs/discovery';
import opentelemetry, { Tracer } from '@opentelemetry/api';

import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { KafkaJsInstrumentation } from 'opentelemetry-instrumentation-kafkajs';
import { JaegerConfig } from '@libs/telemetry/drivers/jaeger/jaeger.config';
import { ILogger } from '@libs/logger/logger.interface';

@Injectable()
export class JaegerTracerDriver extends ITracing {
  private tracer: Tracer;

  constructor(
    private readonly config: JaegerConfig,
    private readonly logger: ILogger,
  ) {
    super();
  }
  public startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    cb: (span: Span) => unknown,
  ) {
    if (!this.tracer) {
      this.logger.warn('Tracer is not initialized. Cannot send spans yet.');
      return;
    }
    return this.tracer.startActiveSpan(name, cb);
  }

  initialize() {
    // Optionally register instrumentation libraries
    registerInstrumentations({
      instrumentations: [],
    });

    const options = {
      tags: [],
      endpoint: this.config.endpoint,
    };

    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'json-schema-service',
        [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
      }),
    );

    const provider = new NodeTracerProvider({
      resource: resource,
    });

    registerInstrumentations({
      instrumentations: [
        new ExpressInstrumentation(),
        new HttpInstrumentation(),
        new AmqplibInstrumentation(),
        new KafkaJsInstrumentation({
          // see under for available configuration
        }),
      ],
    });
    const exporter = new JaegerExporter(options);
    const processor = new BatchSpanProcessor(exporter);
    provider.addSpanProcessor(processor);

    provider.register();
    this.tracer = opentelemetry.trace.getTracer('my-service-tracer');
  }
}
