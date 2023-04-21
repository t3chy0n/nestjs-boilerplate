import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { BEAN_METHOD_ARGS_METADATA_KEY } from '@libs/discovery/const';
import { BeanMetadata } from '@libs/discovery/bean/bean-metadata';
import { BeanInstance } from '@libs/discovery/bean/bean-instance';

export class MethodWrapperFactory {
  constructor(
    private metadata: BeanMetadata<any>,
    private instanceData: BeanInstance<any>,
    private readonly externalContextCreator: ExternalContextCreator = null,
  ) {}

  wrapper(ctx: Record<any, any>, property: string | symbol) {
    return (continuation?: () => void) => {
      const instance = this.instanceData.getInstance();

      const method = this.metadata.callWrapper
        ? (...args) => {
            const cb =
              continuation ?? instance[property].bind(instance, ...args);
            return this.metadata.callWrapper(
              ctx,
              instance,
              property,
              this.instanceData.getInjected(),
              cb,
              ...args,
            );
          }
        : instance[property];

      const withBeforeAdvice = (...args) => {
        this.metadata.beforeAdvices[property.toString()]?.map((call) =>
          call(
            ctx,
            instance,
            property,
            this.instanceData.getInjected(),
            ...args,
          ),
        );

        return method.call(instance, ...args);
      };

      if (
        this.metadata.shouldUseExternalContext &&
        this.externalContextCreator
      ) {
        return this.externalContextCreator.create(
          instance,
          // proxy.bind(parentClass.instance),
          withBeforeAdvice,
          property.toString(),
          BEAN_METHOD_ARGS_METADATA_KEY,
          this.metadata.paramsFactory
            ? new (this.metadata.paramsFactory.constructor as any)()
            : undefined,
          undefined,
          undefined,
          undefined,
          this.metadata.contextType,
        );
      }
      return withBeforeAdvice;
    };
  }
}
