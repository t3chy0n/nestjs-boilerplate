import {
  ADVICES_AFTER,
  ADVICES_AFTER_THROW,
  ADVICES_BEFORE,
  ADVICES_SETTER_BEFORE,
  PROXY_FIELD_DEFAULTS,
  SKIP_BEAN_PROXY_TRAPS_FOR,
  SKIP_IF_NEST_METHODS_ARE_NOT_DEFINED,
} from '@libs/discovery/const';
import { AnyConstructor } from '@libs/lazy-loader/types';
import { LazyLoader } from '@libs/lazy-loader/lazy-loader.service';

export class Bean<T> {
  private getters: any[];
  private getterFinishers: any[];
  private afterThrowings: any[];
  private setters: any[];
  private defaults: any[];

  private instance: T;

  constructor(
    private readonly target: AnyConstructor<T>,
    private readonly injected: Record<string, any> = {},
  ) {
    this.getters =
      Reflect.getMetadata(ADVICES_BEFORE, this.target.prototype) || [];
    this.getterFinishers =
      Reflect.getMetadata(ADVICES_AFTER, this.target.prototype) || [];
    this.afterThrowings =
      Reflect.getMetadata(ADVICES_AFTER_THROW, this.target.prototype) || [];
    this.setters =
      Reflect.getMetadata(ADVICES_SETTER_BEFORE, this.target.prototype) || [];
    this.defaults =
      Reflect.getMetadata(PROXY_FIELD_DEFAULTS, this.target.prototype) || [];
  }

  wireMethodAdvices(
    beforeCallbacks: any[],
    afterCallbacks: any[],
    property: string | symbol,
    ctx: Record<any, any>,
  ) {
    const method = this.instance[property];
    //If it's a function we call all defined callbacks and return overriden method,
    //To invoke finisher callbacks after original operation is done.4
    const results = beforeCallbacks[property]?.map((call) =>
      call(ctx, this.instance, property, this.injected),
    ) ?? [this.defaults[property]];

    const overriden = (...args) => {
      const result = method?.call(this.instance, ...args);
      //Call finishers if any from decorator
      const results = afterCallbacks[property]?.map((call) =>
        call(ctx, this.instance, property, this.injected, ...args),
      ) ?? [this.defaults[property]];
      return result;
    };

    return overriden.bind(this.instance);
  }

  wireExceptionAdvices(
    property: string | symbol,
    e: Error,
    ctx: Record<any, any>,
  ) {
    if (this.afterThrowings.length) {
      this.afterThrowings[property]?.forEach((call) =>
        call(ctx, this.instance, property, e),
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
    const results = beforeCallbacks[property]?.map((call) =>
      call(ctx, this.instance, property, this.injected),
    ) ?? [this.defaults[property]];

    let res;
    if (!results.length) {
      res = this.defaults[property];
    }
    if (results.length === 1) {
      res = results[0];
    } else {
      res = results;
    }

    afterCallbacks[property]?.map((call) =>
      call(ctx, this.instance, property, this.injected),
    ) ?? [this.defaults[property]];

    return res;
  }

  async setInstance(instance: T) {
    this.instance = instance;
  }

  constructGetHandler() {
    return (target, property) => {
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

      if (!this.instance) {
        throw new Error(
          `There is no instance in a Bean for ${this.target?.name}`,
        );
      }

      const fieldType = typeof target.prototype[property];
      const ctx = {};
      try {
        if ('function' === fieldType) {
          return this.wireMethodAdvices(
            this.getters,
            this.getterFinishers,
            property,
            ctx,
          );
        } else {
          return this.wireFieldAdvices(
            this.getters,
            this.getterFinishers,
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
    return new Proxy(this.target, {
      get: this.constructGetHandler(),
    });
  }
}