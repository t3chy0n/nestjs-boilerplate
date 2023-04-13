import {
  Config,
  ConfigProperty,
} from '@libs/configuration/decorators/config.decorators';

@Config('tracing.jaeger')
export class JaegerConfig {
  constructor() {
    console.log('ASD');
  }
  @ConfigProperty()
  endpoint: string;
}
