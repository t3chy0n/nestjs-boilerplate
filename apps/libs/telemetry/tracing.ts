import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import {ExpressInstrumentation} from "@opentelemetry/instrumentation-express";
import {HttpInstrumentation} from "@opentelemetry/instrumentation-http";

// Optionally register instrumentation libraries
registerInstrumentations({
  instrumentations: [],
});

const options = {
  tags: [],
  endpoint: `http://localhost:14268/api/traces`,
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
    instrumentations: [new ExpressInstrumentation(), new HttpInstrumentation()],
})
const exporter = new JaegerExporter(options);
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
