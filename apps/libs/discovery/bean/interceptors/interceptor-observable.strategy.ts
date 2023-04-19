import { MethodType } from '@libs/discovery/types';
import { defer, Observable, tap } from 'rxjs';
import {
  WithResultCallback,
  ExceptionHandler,
} from '@libs/discovery/bean/types';

export class InterceptorObservableStrategy {
  constructor(
    protected readonly methodFactory: (continuation: () => void) => MethodType,
    protected readonly result: Observable<any>,
    protected readonly interceptors: WithResultCallback[],
    protected readonly exceptionInterceptors: ExceptionHandler[],
  ) {}
  handleError(e: any) {
    this.exceptionInterceptors?.map((cb) => cb(e));
    console.error('InterceptorObservableStrategy', e);
  }

  intercept(...args) {
    type Operator<TSource> = (
      source: Observable<TSource>,
    ) => Observable<TSource>;

    const startSpanOperator = <TSource>(): Operator<TSource> => {
      const methodFactory = this.methodFactory;
      const handleError = this.handleError.bind(this);
      return (source) =>
        new Observable<TSource>((subscriber) => {
          return source.subscribe({
            next(value) {
              const method = methodFactory(() => subscriber.next(value));
              if (this.callWrapper) method(...args);
              else {
                subscriber.next(value);
              }
            },
            error(error) {
              subscriber.error(error);
              handleError(error);
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
              this.interceptors?.map((cb) => cb.call(null, v, ...args));
            },
            error: (error) => {
              this.handleError(error);
            },
            complete: () => {
              this.interceptors?.map((cb) => cb.call(null, 'end', ...args));
            },
          }),
        );
    };

    const wrapperStream$ = defer(() =>
      this.result.pipe(
        startSpanOperator<any>(),
        tap((value) => console.log('Proxied value:', value)),
        endSpanOperator<any>(),
      ),
    );
    return wrapperStream$;
  }
}
