import {
  ADVICE_EXTERNAL_CONTEXT,
  ADVICE_EXTERNAL_CONTEXT_TYPE,
  ADVICES_AFTER,
  ADVICES_AFTER_CONSTRUCTOR,
  ADVICES_AFTER_THROW,
  ADVICES_BEFORE,
  ADVICES_CALL_WRAPPER,
  ADVICES_SETTER_BEFORE,
  BEAN_METHOD_ARGS_METADATA_KEY,
  PROXY_FIELD_DEFAULTS,
  SKIP_BEAN_PROXY_TRAPS_FOR,
  SKIP_IF_NEST_METHODS_ARE_NOT_DEFINED,
} from '@libs/discovery/const';
import { AnyConstructor } from '@libs/lazy-loader/types';
import { LazyLoader } from '@libs/lazy-loader/lazy-loader.service';
import {
  ExternalContextCreator,
  ParamsFactory,
} from '@nestjs/core/helpers/external-context-creator';
import { ConsoleLogger } from '@nestjs/common';
import { defer, Observable, of, switchMap, tap } from 'rxjs';

export class Bean<T> {
  private getters: any[];
  private callWrapper: any;
  private getterFinishers: any[];
  private afterThrowings: any[];
  private afterConstructor: any[];
  private setters: any[];
  private paramsFactory: ParamsFactory;
  private shouldUseExternalContext: boolean;
  private contextType: string;
  private defaults: any[];

  private logger: ConsoleLogger;

  private instance: T;
  private proxy: ProxyHandler<any>;

  constructor(
    private readonly target: AnyConstructor<T>,
    private injected: Record<string, any>,
    private readonly externalContextCreator: ExternalContextCreator = null,
  ) {
    this.getters =
      Reflect.getMetadata(ADVICES_BEFORE, this.target.prototype) || [];
    this.callWrapper = Reflect.getMetadata(
      ADVICES_CALL_WRAPPER,
      this.target.prototype,
    );
    this.getterFinishers =
      Reflect.getMetadata(ADVICES_AFTER, this.target.prototype) || [];
    this.afterThrowings =
      Reflect.getMetadata(ADVICES_AFTER_THROW, this.target.prototype) || [];
    this.afterConstructor =
      Reflect.getMetadata(ADVICES_AFTER_CONSTRUCTOR, this.target.prototype) ||
      [];
    this.setters =
      Reflect.getMetadata(ADVICES_SETTER_BEFORE, this.target.prototype) || [];
    this.defaults =
      Reflect.getMetadata(PROXY_FIELD_DEFAULTS, this.target.prototype) || [];
    const paramsFactoryClass = Reflect.getMetadata(
      ADVICE_EXTERNAL_CONTEXT,
      this.target.prototype,
    );
    this.contextType = Reflect.getMetadata(
      ADVICE_EXTERNAL_CONTEXT_TYPE,
      this.target.prototype,
    );

    this.shouldUseExternalContext = !!paramsFactoryClass;

    this.logger = new ConsoleLogger(`${this.target.name}-Bean`);
    if (paramsFactoryClass) {
      this.paramsFactory = new paramsFactoryClass();
    }
  }

  setInjected(inject: any) {
    this.injected = inject;
  }

  methodWrapper(ctx: Record<any, any>, property: string | symbol) {
    const method = this.callWrapper
      ? (...args) => {
          const continuation = this.instance[property].bind(
            this.instance,
            ...args,
          );
          return this.callWrapper(
            ctx,
            this.instance,
            property,
            this.injected,
            continuation,
            ...args,
          );
        }
      : this.instance[property];

    if (this.shouldUseExternalContext && this.externalContextCreator) {
      const instance = this.instance as any;
      return this.externalContextCreator.create(
        instance,
        // proxy.bind(parentClass.instance),
        method,
        property.toString(),
        BEAN_METHOD_ARGS_METADATA_KEY,
        this.paramsFactory
          ? new (this.paramsFactory.constructor as any)()
          : undefined,
        undefined,
        undefined,
        undefined,
        this.contextType,
      );
    }

    return method;
  }

  wireMethodAdvices(
    beforeCallbacks: any[],
    afterCallbacks: any[],
    property: string | symbol,
    ctx: Record<any, any>,
  ) {
    const method = this.methodWrapper(ctx, property);
    //If it's a function we call all defined callbacks and return overriden method,
    //To invoke finisher callbacks after original operation is done.4
    if (
      beforeCallbacks[property] &&
      typeof beforeCallbacks[property]?.map !== 'function'
    ) {
      console.log('Proxy error not a function');
    }
    const results = beforeCallbacks[property]?.map((call) =>
      call(ctx, this.instance, property, this.injected),
    ) ?? [this.defaults[property]];

    const overridden = (...args) => {
      try {
        let result = method?.call(this.instance, ...args);
        //Call finishers if any from decorator

        type Operator<TSource> = (
          source: Observable<TSource>,
        ) => Observable<TSource>;

        const startSpanOperator = <TSource>(): Operator<TSource> => {
          return (source) =>
            new Observable<TSource>((subscriber) => {
              return source.subscribe({
                next(value) {
                  if (this.callWrapper)
                    method(
                      ctx,
                      this.instance,
                      property,
                      this.injected,
                      () => subscriber.next(value),
                      ...args,
                    );
                  else {
                    subscriber.next(value);
                  }
                },
                error(err) {
                  subscriber.error(err);
                },
                complete() {
                  subscriber.complete();
                },
              });
            });
        };

        const endSpanOperator = <TSource>(): Operator<TSource> => {
          return (source) =>
            source.pipe(
              tap({
                next: (v) => {
                  const results = afterCallbacks[property]?.map((call) =>
                    call(
                      ctx,
                      this.instance,
                      property,
                      this.injected,
                      v,
                      ...args,
                    ),
                  ) ?? [this.defaults[property]];
                },
                error: (error) => {},
                complete: () => {
                  const results = afterCallbacks[property]?.map((call) =>
                    call(
                      ctx,
                      this.instance,
                      property,
                      this.injected,
                      'end',
                      ...args,
                    ),
                  ) ?? [this.defaults[property]];
                },
              }),
            );
        };
        if (result?.subscribe) {
          const wrapperStream$ = defer(() =>
            result.pipe(
              startSpanOperator<any>(),
              tap((value) => console.log('Proxied value:', value)),
              endSpanOperator<any>(),
            ),
          );
          return wrapperStream$;
        }
        if (result?.catch) {
          result = result
            .then((res) => {
              const results = afterCallbacks[property]?.map((call) =>
                call(ctx, this.instance, property, this.injected, res, ...args),
              ) ?? [this.defaults[property]];
              return res;
            })
            .catch((e) => {
              this.wireExceptionAdvices(property, e, ctx);
            });
        } else {
          const results = afterCallbacks[property]?.map((call) =>
            call(ctx, this.instance, property, this.injected, result, ...args),
          ) ?? [this.defaults[property]];
        }

        return result;
      } catch (e) {
        this.wireExceptionAdvices(property, e, ctx);
      }
    };

    return overridden.bind(this.instance);
  }

  wireConstructorAdvices() {
    const allAfterConstructorCallbacks = this.afterConstructor
      ? Object.values(this.afterConstructor).flatMap((cb) => cb)
      : [];
    allAfterConstructorCallbacks.forEach((call) =>
      call(this.instance, this.proxy, this.injected),
    );
  }

  wireExceptionAdvices(
    property: string | symbol,
    e: Error,
    ctx: Record<any, any>,
  ) {
    if (this.afterThrowings[property]?.length) {
      this.afterThrowings[property]?.forEach((call) =>
        call(ctx, this.instance, property, this.injected, e),
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
    const results = beforeCallbacks[property]
      ?.map((call) => call(ctx, this.instance, property, this.injected))
      .filter(Boolean) ?? [this.defaults[property] ?? this.instance[property]];

    let res;
    if (!results.length) {
      res = this.defaults[property] ?? this.instance[property];
    } else {
      if (results.length === 1) {
        res = results[0];
      } else {
        res = results;
      }
    }

    afterCallbacks[property]?.map((call) =>
      call(ctx, this.instance, property, this.injected, res),
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

      if (!this.injected) {
        this.logger.warn(
          'Aspect Injected values are not yet resolved, skipping proxy trap',
        );
        return this.instance[property];
      }

      const fieldType = typeof (target[property] ?? target.prototype[property]);
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
    const self = this;
    this.proxy = new Proxy(this.target, {
      get: this.constructGetHandler(),
      ownKeys: (target: any) => {
        return Reflect.ownKeys(target) as any;
      },
      set(target, prop, value, receiver) {
        self.instance[prop] = value;
        console.log('Setter on proxy');
        return true;
      },
    });

    this.wireConstructorAdvices();
    return this.proxy;
  }
}
