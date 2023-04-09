import { applyDecorators, SetMetadata } from '@nestjs/common';
import { createPropertyDecorator } from '@nestjs/swagger/dist/decorators/helpers';
import { After, Before, EnsureParentImports } from '@libs/discovery';
import { IConfiguration } from '@libs/configuration/interfaces/configuration.interface';
import {
  CONFIGURATION_KEY_METADATA,
  CONFIGURATION_MAIN_KEY_METADATA,
} from '@libs/configuration/decorators/config.decorators';
import { Injectable } from '@libs/discovery/decorators/injectable.decorator';
import { ConfigurationModule } from '@libs/configuration/configuration.module';
import { ITracing } from '@libs/telemetry/tracing.interface';
import { TelemetryModule } from '@libs/telemetry/telemetry.module';

export function Traceable(topConfigKey = ''): ClassDecorator {
  return applyDecorators(
    (target: any, key: string | symbol | undefined, index?: number) => {
      Reflect.defineMetadata(
        CONFIGURATION_MAIN_KEY_METADATA,
        topConfigKey,
        target.prototype,
      );
    },
    Injectable({ inject: { tracer: ITracing } }),
    EnsureParentImports(TelemetryModule),
  );
}

export const Traced = (key = ''): PropertyDecorator => {
  let span: any;

  return applyDecorators(
    createPropertyDecorator(CONFIGURATION_KEY_METADATA, { key }, true),
    Before((ctx, target, property, { tracer }) => {
      span = tracer.startSpan(
        `${target?.__proto__?.constructor?.name}:${property?.toString()}`,
      );
      ctx.span = span;
      console.log('Starting accessing proxy', target, property);
      return '';
    }),
    After((ctx, target, b, config: IConfiguration) => {
      console.log('Finished accessing proxy', target, b);
      ctx.span?.end();
      return '';
    }),
  );
};
