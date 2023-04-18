import { ITracing } from '@libs/telemetry/tracing.interface';
import { Span } from '@opentelemetry/api/build/src/trace/span';
import { Injectable } from '@libs/discovery';
import opentelemetry, { TraceAPI, Tracer, Context } from '@opentelemetry/api';

import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  BasicTracerProvider,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { KafkaJsInstrumentation } from 'opentelemetry-instrumentation-kafkajs';
import { JaegerConfig } from '@libs/telemetry/drivers/jaeger/jaeger.config';
import { ILogger } from '@libs/logger/logger.interface';
import { IRequestContextService } from '@libs/request-context/interfaces/request-context-service.interface';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import * as api from '@opentelemetry/api';
import { setSpanContext } from '@opentelemetry/api/build/src/trace/context-utils';

@Injectable()
export class JaegerTracerDriver extends ITracing {
  private tracer: Tracer;

  constructor(
    private readonly config: JaegerConfig,
    private readonly logger: ILogger,
    private readonly requestContext: IRequestContextService,
  ) {
    super();
  }
  public startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    cb: (span: Span) => unknown,
  ) {
    const span = this.tracer.startActiveSpan(name, cb);

    if (!this.tracer) {
      this.logger.warn('Tracer is not initialized. Cannot send spans yet.');
      return;
    }
    return span;
  }
  public startSpan<F extends (span: Span) => unknown>(
    name: string,
    continuation: any,
  ) {
    if (!this.tracer) {
      throw new Error('Tracer is not initialized. Cannot send spans yet.');
    }

    const span = this.tracer.startSpan(name);

    const activeCtx = opentelemetry.context.active();
    return opentelemetry.context.with(
      opentelemetry.trace.setSpan(activeCtx, span),
      () => {
        return continuation(span);
      },
    );

    return span;
  }

  initialize() {
    // Optionally register instrumentation libraries

    const contextManager = new AsyncLocalStorageContextManager();
    contextManager.enable();
    api.context.setGlobalContextManager(contextManager);

    const options = {
      tags: [],
      url: this.config.endpoint,
    };

    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'json-schema-service',
        [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
      }),
    );

    const provider = new BasicTracerProvider({
      resource: resource,
    });


    const exporter = new OTLPTraceExporter();
    const processor = new BatchSpanProcessor(exporter, {
      // The maximum queue size. After the size is reached spans are dropped.
      maxQueueSize: 1000,
      // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
      maxExportBatchSize: 100,
      // The interval between two consecutive exports
      scheduledDelayMillis: 5000,
      // How long the export can run before it is cancelled
      exportTimeoutMillis: 300000,
    });

    provider.addSpanProcessor(processor);

    provider.register();
    registerInstrumentations({
      instrumentations: [
        new ExpressInstrumentation(),
        new HttpInstrumentation(),
        // new AmqplibInstrumentation(),
        // new KafkaJsInstrumentation({
        //   // see under for available configuration
        // }),
      ],
    });

    // Enable Express instrumentation
    this.tracer = opentelemetry.trace.getTracer('my-service-tracer');
  }
}
