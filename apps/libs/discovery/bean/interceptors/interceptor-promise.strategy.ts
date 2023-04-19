import {
  WithResultCallback,
  ExceptionHandler,
} from '@libs/discovery/bean/types';

export class InterceptorPromiseStrategy {
  constructor(
    protected readonly result: Promise<any>,
    protected readonly interceptors: WithResultCallback[],
    protected readonly exceptionInterceptors: ExceptionHandler[],
  ) {}

  handleError(e: any) {
    this.exceptionInterceptors?.map((cb) => cb(e));
  }

  intercept(...args: any[]) {
    return this.result
      .then((res) => {
        const interceptorArgs = [res, ...args];
        this.interceptors?.map((cb) => {
          return cb.call(null, ...interceptorArgs);
        });
        return res;
      })
      .catch((e) => {
        this.handleError(e);
      });
  }
}
