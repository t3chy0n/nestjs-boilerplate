import { AnyConstructor } from '@libs/lazy-loader/types';
import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator';
import {
  ADVICE_EXTERNAL_CONTEXT,
  ADVICE_EXTERNAL_CONTEXT_TYPE,
  ADVICES_AFTER,
  ADVICES_AFTER_CONSTRUCTOR,
  ADVICES_AFTER_THROW,
  ADVICES_BEFORE,
  ADVICES_CALL_WRAPPER,
  PROXY_FIELD_DEFAULTS,
} from '@libs/discovery/const';
import {
  AfterAdviceCallback,
  AfterConstructAdviceCallback,
  AfterExceptionAdviceCallback,
  BeforeAdviceCallback,
  CallWrapperAdviceCallback,
} from '@libs/discovery/types';

export class BeanMetadata<T> {
  public readonly getters: Record<string, BeforeAdviceCallback[]>;
  public readonly callWrapper: CallWrapperAdviceCallback;
  public readonly getterFinishers: Record<string, AfterAdviceCallback[]>;
  public readonly afterThrowings: Record<
    string,
    AfterExceptionAdviceCallback[]
  >;
  public readonly afterConstructor: Record<
    string,
    AfterConstructAdviceCallback[]
  >;
  public readonly paramsFactory: ParamsFactory;
  public readonly shouldUseExternalContext: boolean;
  public readonly contextType: string;
  public readonly defaults: any[];

  constructor(private readonly target: AnyConstructor<T>) {
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

    if (paramsFactoryClass) {
      this.paramsFactory = new paramsFactoryClass();
    }
  }
}
