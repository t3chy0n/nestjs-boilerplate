import {
  WithResultCallback,
  ExceptionHandler,
} from '@libs/discovery/bean/types';

export class InterceptorStrategy {
  constructor(
    protected readonly result: any,
    private readonly interceptors: WithResultCallback[],
    private readonly exceptionInterceptors: ExceptionHandler[],
  ) {}

  intercept(...args: any[]) {
    try {
      this.interceptors?.map((cb) => cb.call(this.result, ...args));
      return this.result;
    } catch (e) {}
  }
}
