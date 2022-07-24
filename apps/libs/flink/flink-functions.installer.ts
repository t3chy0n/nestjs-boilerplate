import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  Module,
  Logger,
  OnApplicationBootstrap,
  ParamData,
  Global,
} from '@nestjs/common';
import {
  ExternalContextCreator,
  ParamsFactory,
} from '@nestjs/core/helpers/external-context-creator';
import { groupBy } from 'lodash';
import { StateFun } from 'apache-flink-statefun';
import {
  FLINK_ARGS_METADATA,
  FLINK_HANDLER,
  FlinkFunctionConfig,
} from './flink.contsnts';
import { FlinkController } from './flink.controller';
import { FlinkClient } from './flink.client';
import { FlinkParamTypes } from '@libs/flink/flink.decorators';

export class FlinkParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: number, data: ParamData, args: any): any {
    switch (type) {
      case FlinkParamTypes.MESSAGE:
      case FlinkParamTypes.CONTEXT:
        return args[type];
      case FlinkParamTypes.STORAGE:
        return args[FlinkParamTypes.CONTEXT]?.storage;
      default:
        return null;
    }
    console.log('Flink debug', type, data, args);
  }
}

@Global()
@Module({
  controllers: [FlinkController],
  providers: [StateFun, FlinkParamsFactory, FlinkClient],
  exports: [FlinkClient],
  imports: [DiscoveryModule],
})
export class FlinkFunctionsModule implements OnApplicationBootstrap {
  private static bootstrapped = false;

  private logger = new Logger(FlinkFunctionsModule.name);
  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly stateFun: StateFun,
    private readonly flinkParamsFactory: FlinkParamsFactory,
  ) {}

  public bind(config: FlinkFunctionConfig) {
    this.stateFun.bind({
      typename: config.name,
      fn: config.handler,
      specs: config.specs,
    });
  }

  public async onApplicationBootstrap() {
    if (FlinkFunctionsModule.bootstrapped) {
      return;
    }

    FlinkFunctionsModule.bootstrapped = true;

    this.logger.log('Initializing RabbitMQ Handlers');

    let flinkMeta =
      await this.discover.providerMethodsWithMetaAtKey<FlinkFunctionConfig>(
        FLINK_HANDLER,
      );

    this.logger.log(
      'Searching for Flink Handlers in Controllers. You can not use NestJS HTTP-Requests in these controllers!',
    );

    flinkMeta = flinkMeta.concat(
      await this.discover.controllerMethodsWithMetaAtKey<FlinkFunctionConfig>(
        FLINK_HANDLER,
      ),
    );

    const grouped = groupBy(
      flinkMeta,
      (x) => x.discoveredMethod.parentClass.name,
    );

    const providerKeys = Object.keys(grouped);

    for (const key of providerKeys) {
      this.logger.log(`Registering flink handlers from ${key}`);
      await Promise.all(
        grouped[key].map(async ({ discoveredMethod, meta: config }) => {
          const handler = this.externalContextCreator.create(
            discoveredMethod.parentClass.instance,
            discoveredMethod.handler,
            discoveredMethod.methodName,
            FLINK_ARGS_METADATA,
            this.flinkParamsFactory,
            undefined,
            undefined,
            undefined,
            'flink',
          );

          const { name, specs } = config;

          this.logger.log(`Flink function ${name} found`);

          this.bind({
            handler,
            name: name,
            specs,
          });
        }),
      );
    }
  }
}
