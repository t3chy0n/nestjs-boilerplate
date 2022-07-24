export const FLINK_HANDLER = Symbol('FLINK_HANDLER');
export const FLINK_CONFIG_TOKEN = Symbol('FLINK_CONFIG_TOKEN');
export const FLINK_ARGS_METADATA = 'FLINK_ARGS_METADATA';
export const FLINK_PARAM_TYPE = 3;

export class FlinkFunctionConfig {
  handler?: any;
  name: any;
  specs: any;
}
