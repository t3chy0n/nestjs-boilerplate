import {
  AfterAdviceCallback,
  AfterExceptionAdviceCallback,
  MethodType,
} from '@libs/discovery/types';

export type WithResultCallback = (result: any) => any;
export type ExceptionHandler = (e: Error) => any;

export interface BeanMethodInterceptor {
  intercept(
    method: MethodType,
    interceptors: AfterAdviceCallback[],
    exceptionInterceptors: AfterExceptionAdviceCallback[],
  );
}
