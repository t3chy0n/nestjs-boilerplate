import {
  After,
  AfterThrow,
  Before,
  EnsureParentImports,
  UseCallWrapper,
} from '@libs/discovery/decorators/advices.decorators';

import { Injectable } from '@libs/discovery/decorators/injectable.decorator';
import { ITracing } from '@libs/telemetry/tracing.interface';
import { TelemetryModule } from '@libs/telemetry/telemetry.module';
import { SpanStatusCode } from '@opentelemetry/api';
import {
  isClassDecorator,
  isFieldDecorator,
  isMethodDecorator,
} from '@libs/discovery';
import { applyDecorators } from '@libs/discovery/utils';
import { RequestContextModule } from '@libs/request-context/request-context.module';
import { IRequestContextService } from '@libs/request-context/interfaces/request-context-service.interface';
import { RequestContextDto } from '@libs/request-context/request-context.dto';

const Traceable = () =>
  applyDecorators(
    Injectable({
      inject: { tracer: ITracing, requestContext: IRequestContextService },
    }),
    EnsureParentImports(RequestContextModule),
  );

const TracedField = () =>
  applyDecorators(
    UseCallWrapper(
      (
        ctx,
        target,
        property,
        { tracer, requestContext },
        continuation,
        ...args
      ) => {
        return tracer.startSpan(
          `${target?.__proto__?.constructor?.name}:${property?.toString()}`,
          (span) => {
            ctx.span = span;

            return continuation();
          },
          // activeSpan
        );
      },
    ),
    After(
      (ctx, target, property, { tracer, requestContext }, result, ...args) => {
        try {
          const rCtx = requestContext.getContext();

          //TODO: Try to serialize each parameter seperately
          ctx.span?.setAttribute('parameters', args);

          ctx.span?.setAttribute('result', result);
          ctx.span?.end();

          // ctx.span?.setStatus(SpanStatusCode.OK);
          rCtx.lastSpans?.pop();
          requestContext.updateContext(rCtx);
          return '';
        } catch (e) {
          console.log(e);
        }
      },
    ),
    AfterThrow((ctx, target, property, { tracer }, exception) => {
      ctx.span?.recordException(exception);
      ctx.span?.setAttribute('error', true);
      ctx.span?.setStatus(SpanStatusCode.ERROR);
      ctx.span?.end();

      throw exception;
    }),
  );

const SKIP_DISCOVERY_FOR_FIELDS = [
  'constructor',
  '__proto__',
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

function getMethodNames(obj) {
  let methodNames = [];
  while (obj) {
    const properties = Object.getOwnPropertyNames(obj);
    const methods = properties.filter(
      (prop) =>
        typeof obj[prop] === 'function' &&
        !SKIP_DISCOVERY_FOR_FIELDS.includes(prop),
    );
    methodNames = methodNames.concat(methods);
    obj = Object.getPrototypeOf(obj);
  }
  return methodNames;
}

function getFieldNames(obj) {
  let fieldNames = [];
  while (obj) {
    const properties = Object.getOwnPropertyNames(obj);
    const fields = properties.filter(
      (prop) =>
        typeof obj[prop] !== 'function' &&
        !SKIP_DISCOVERY_FOR_FIELDS.includes(prop),
    );
    fieldNames = fieldNames.concat(fields);
    obj = Object.getPrototypeOf(obj);
  }
  return fieldNames;
}

export function Traced(...args: any[]): any {
  if (isClassDecorator<any>(args)) {
    const [constructor] = args;
    Traceable()(constructor);

    // const instance = new constructor();
    const fields = getFieldNames(constructor.prototype);
    const methods = getMethodNames(constructor.prototype);

    const toDecorate = new Set([...fields, ...methods]);
    const allFields = [...toDecorate].filter(
      (v) => !SKIP_DISCOVERY_FOR_FIELDS.includes(v),
    );
    for (const propertyKey of allFields) {
      TracedField()(constructor.prototype, propertyKey, {});
    }

    return constructor;
  } else if (isMethodDecorator(args)) {
    const [target, propertyKey, descriptor] = args;

    Traceable()(target);
    TracedField()(target, propertyKey, descriptor);
  } else if (isFieldDecorator(args)) {
    const [target, propertyKey] = args;
    Traceable()(target);
    TracedField()(target, propertyKey);
  }
}
