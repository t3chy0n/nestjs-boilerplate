import { makeInjectableDecorator } from '@golevelup/nestjs-common';
import 'reflect-metadata';
import { applyDecorators, SetMetadata } from '@nestjs/common';

import {
  FLINK_CONFIG_TOKEN,
  FLINK_HANDLER,
  FlinkFunctionConfig,
} from './flink.contsnts';

export function FlinkHandler(config: FlinkFunctionConfig) {
  return applyDecorators(SetMetadata(FLINK_HANDLER, config));
}

export const InjectFlinkConfig = makeInjectableDecorator(FLINK_CONFIG_TOKEN);
