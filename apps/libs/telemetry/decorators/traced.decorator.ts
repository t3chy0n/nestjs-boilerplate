import {
  After,
  AfterThrow,
  Before,
  EnsureParentImports,
  Injectable,
  isClassDecorator,
  isFieldDecorator,
  isMethodDecorator,
} from '@libs/discovery';
import { ITracing } from '@libs/telemetry/tracing.interface';
import { TelemetryModule } from '@libs/telemetry/telemetry.module';
import { SpanStatusCode, TraceFlags } from '@opentelemetry/api';

/**
 * Function that returns a new decorator that applies all decorators provided by param
 *
 * Useful to build new decorators (or a decorator factory) encapsulating multiple decorators related with the same feature
 *
 * @param decorators one or more decorators (e.g., `ApplyGuard(...)`)
 *
 * @publicApi
 */
export function applyDecorators(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  return <TFunction extends Function, Y>(
    target: TFunction | object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<Y>,
  ) => {
    for (const decorator of decorators) {
      (decorator as MethodDecorator | PropertyDecorator)(
        target,
        propertyKey,
        descriptor,
      );
    }
  };
}

const Traceable = applyDecorators(
  Injectable({ inject: { tracer: ITracing } }),
  EnsureParentImports(TelemetryModule),
);

const TracedField = applyDecorators(
  Before((ctx, target, property, { tracer }, ...args) => {
    tracer.startActiveSpan(
      `${target?.__proto__?.constructor?.name}:${property?.toString()}`,
      // activeSpan
      (span) => {
        ctx.span = span;
      },
    );

    return '';
  }),
  After((ctx, target, property, { tracer }, ...args) => {
    ctx.span?.setAttribute('parameters', args);

    const result = ctx.result;
    if (result.then) {
      result
        .then((r) => {
          ctx.span?.setAttribute('result', JSON.stringify(r, null, 2));
        })
        .finally(() => {
          // ctx.span?.setStatus(SpanStatusCode.OK);
          ctx.span?.end();
        });
    } else {
      ctx.span?.setAttribute('result', result);

      // ctx.span?.setStatus(SpanStatusCode.OK);
      ctx.span?.end();
    }
    return '';
  }),
  AfterThrow((ctx, target, property, { tracer }, exception) => {
    ctx.span?.recordException(exception);
    ctx.span?.setAttribute('error', true);
    ctx.span?.setStatus(SpanStatusCode.ERROR);
    ctx.span?.end();

    throw exception;
  }),
);

function getMethodNames(obj) {
  let methodNames = [];
  while (obj) {
    const properties = Object.getOwnPropertyNames(obj);
    const methods = properties.filter(
      (prop) => typeof obj[prop] === 'function',
    );
    methodNames = methodNames.concat(methods);
    obj = Object.getPrototypeOf(obj);
  }
  return methodNames;
}

const SKIP_METHODS_DISCOVERY = [
  'constructor',
  '__defineGetter__',
  '__defineSetter__',
  'hasOwnProperty',
  '__lookupGetter__',
  '__lookupSetter__',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toString',
  'valueOf',
  'toLocaleString',
];

export function Traced(...args: any[]): any {
  if (isClassDecorator<any>(args)) {
    const [constructor] = args;
    Traceable(constructor);

    const instance = new constructor();
    const fields = Object.keys(instance);
    const methods = getMethodNames(instance);

    const toDecorate = new Set([...fields, ...methods]);
    const allFields = [...toDecorate].filter(
      (v) => !SKIP_METHODS_DISCOVERY.includes(v),
    );
    for (const propertyKey of allFields) {
      TracedField(constructor.prototype, propertyKey, {});
    }

    return constructor;
  } else if (isMethodDecorator(args)) {
    const [target, propertyKey, descriptor] = args;

    Traceable(target);
    TracedField(target, propertyKey, descriptor);
  } else if (isFieldDecorator(args)) {
    const [target, propertyKey] = args;
    Traceable(target);
    TracedField(target, propertyKey);
  }
}
