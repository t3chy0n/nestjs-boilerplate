import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MethodType } from '@libs/discovery/types';
import { InterceptorPromiseStrategy } from '@libs/discovery/bean/interceptors/interceptor-promise.strategy';
import { InterceptorObservableStrategy } from '@libs/discovery/bean/interceptors/interceptor-observable.strategy';
import { InterceptorStrategy } from '@libs/discovery/bean/interceptors/interceptor.strategy';
import {
  WithResultCallback,
  ExceptionHandler,
} from '@libs/discovery/bean/types';
import { BeanInstance } from '@libs/discovery/bean/bean-instance';

export class BeanInterceptorFactory<T> {
  constructor(
    protected readonly methodFactory: (continuation: () => void) => MethodType,
    protected readonly args: any[],
    protected readonly instance: BeanInstance<T>,
    protected readonly interceptors: WithResultCallback[],
    protected readonly exceptionInterceptors: ExceptionHandler[],
  ) {}

  selectStrategy(result: any) {
    if (result instanceof Promise) {
      return new InterceptorPromiseStrategy(
        result,
        this.interceptors,
        this.exceptionInterceptors,
      );
    } else if (result instanceof Observable) {
      return new InterceptorObservableStrategy(
        this.methodFactory,
        result,
        this.interceptors,
        this.exceptionInterceptors,
      );
    } else {
      return new InterceptorStrategy(
        result,
        this.interceptors,
        this.exceptionInterceptors,
      );
    }
  }
}
