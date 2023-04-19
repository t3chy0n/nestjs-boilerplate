import {
  SKIP_BEAN_PROXY_TRAPS_FOR,
  SKIP_IF_NEST_METHODS_ARE_NOT_DEFINED,
} from '@libs/discovery/const';
import { AnyConstructor } from '@libs/lazy-loader/types';

import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { ConsoleLogger } from '@nestjs/common';

import { BeanInterceptorFactory } from '@libs/discovery/bean/interceptors/interceptor.factory';
import { BeanMetadata } from '@libs/discovery/bean/bean-metadata';
import { BeanInstance } from '@libs/discovery/bean/bean-instance';
import { MethodWrapperFactory } from '@libs/discovery/bean/method-wrapper.factory';

export class Bean<T> {
  private metadata: BeanMetadata<T>;
  private logger: ConsoleLogger;

  private instanceData: BeanInstance<T>;
  private methodFactory: MethodWrapperFactory;
  private proxy: ProxyHandler<any>;

  constructor(
    private readonly target: AnyConstructor<T>,
    injected: Record<string, any> = null,
    private readonly externalContextCreator: ExternalContextCreator = null,
  ) {
    this.instanceData = new BeanInstance<T>(injected);
    this.metadata = new BeanMetadata<T>(target);
    this.logger = new ConsoleLogger(`${this.target.name}-Bean`);
    this.methodFactory = new MethodWrapperFactory(
      this.metadata,
      this.instanceData,
      externalContextCreator,
    );
  }

  wireMethodAdvices(
    beforeCallbacks: any[],
    afterCallbacks: any[],
    property: string | symbol,
    ctx: Record<any, any>,
  ) {
    const instance = this.getInstance();
    const injected = this.instanceData.getInjected();
    const methodFactory = this.methodFactory.wrapper(ctx, property);
    //If it's a function we call all defined callbacks and return overriden method,
    //To invoke finisher callbacks after original operation is done.4
    if (beforeCallbacks && typeof beforeCallbacks?.map !== 'function') {
      console.log('Proxy error not a function');
    }

    const results = beforeCallbacks?.map((call) =>
      call(ctx, instance, property, injected),
    ) ?? [this.metadata.defaults[property]];

    const overridden = (...args) => {
      const instance = this.getInstance();
      const injected = this.instanceData.getInjected();
      try {
        const interceptorFactory = new BeanInterceptorFactory<T>(
          methodFactory,
          args,
          this.instanceData,
          afterCallbacks.map((cb) =>
            cb.bind(null, ctx, instance, property, injected),
          ),
          this.metadata.afterThrowings[property.toString()]?.map((cb) =>
            cb.bind(null, ctx, instance, property, injected),
          ),
        );
        const method = methodFactory();
        const result = method?.call(instance, ...args);
        //Call finishers if any from decorator
        const strategy = interceptorFactory.selectStrategy(result);
        return strategy.intercept(...args);
      } catch (e) {
        this.wireExceptionAdvices(property, e, ctx);
      }
    };

    return overridden.bind(instance);
  }

  wireConstructorAdvices() {
    const instance = this.getInstance();
    const injected = this.instanceData.getInjected();

    const allAfterConstructorCallbacks = this.metadata.afterConstructor
      ? Object.values(this.metadata.afterConstructor).flatMap((cb) => cb)
      : [];
    allAfterConstructorCallbacks.forEach((call) =>
      call(instance, this.proxy, injected),
    );
  }

  wireExceptionAdvices(
    property: string | symbol,
    e: Error,
    ctx: Record<any, any>,
  ) {
    const instance = this.getInstance();
    const injected = this.instanceData.getInjected();

    if (this.metadata.afterThrowings[property.toString()]?.length) {
      this.metadata.afterThrowings[property.toString()]?.forEach((call) =>
        call(ctx, instance, property, injected, e),
      );
    } else {
      throw e;
    }
  }

  wireFieldAdvices(
    beforeCallbacks: any[],
    afterCallbacks: any[],
    property: string | symbol,
    ctx: Record<any, any>,
  ) {
    //If its not a function we need to return some value
    const instance = this.getInstance();
    const injected = this.instanceData.getInjected();

    const results = beforeCallbacks
      ?.map((call) => call(ctx, instance, property, injected))
      .filter(Boolean) ?? [
      this.metadata.defaults[property] ?? instance[property],
    ];

    let res;
    if (!results.length) {
      res = this.metadata.defaults[property] ?? instance[property];
    } else {
      if (results.length === 1) {
        res = results[0];
      } else {
        res = results;
      }
    }

    afterCallbacks?.forEach((call) =>
      call(ctx, instance, property, injected, res),
    );

    return res;
  }

  setInstance(instance: T) {
    this.instanceData.setInstance(instance);
  }
  setInjected(injected: Record<string, any>) {
    this.instanceData.setInjected(injected);
  }
  getInstance() {
    return this.instanceData.getInstance();
  }

  constructGetHandler() {
    return (target, property) => {
      const instance = this.getInstance();
      if (!target) {
        throw new Error('There is no target for a Bean');
      }
      if (SKIP_BEAN_PROXY_TRAPS_FOR.includes(property.toString())) {
        return target.prototype[property];
      }
      if (SKIP_IF_NEST_METHODS_ARE_NOT_DEFINED.includes(property.toString())) {
        if (!this.target.prototype[property]) {
          return null;
        }
      }

      if (!instance) {
        throw new Error(
          `There is no instance in a Bean for ${this.target?.name}`,
        );
      }

      if (!this.instanceData.getInjected()) {
        this.logger.warn(
          'Aspect Injected values are not yet resolved, skipping proxy trap',
        );
        return instance[property];
      }

      const fieldType = typeof (target[property] ?? target.prototype[property]);
      const ctx = {};
      try {
        if ('function' === fieldType) {
          return this.wireMethodAdvices(
            this.metadata.getters[property] ?? [],
            this.metadata.getterFinishers[property] ?? [],
            property,
            ctx,
          );
        } else {
          return this.wireFieldAdvices(
            this.metadata.getters[property] ?? [],
            this.metadata.getterFinishers[property] ?? [],
            property,
            ctx,
          );
        }
      } catch (e) {
        this.wireExceptionAdvices(property, e, ctx);
      }
    };
  }

  createProxy() {
    const instance = this.getInstance();
    this.proxy = new Proxy(this.target, {
      get: this.constructGetHandler(),
      ownKeys: (target: any) => {
        return Reflect.ownKeys(target) as any;
      },
      set(target, prop, value, receiver) {
        instance[prop] = value;
        console.log('Setter on proxy');
        return true;
      },
    });

    this.wireConstructorAdvices();
    return this.proxy;
  }
}
