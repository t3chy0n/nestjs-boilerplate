export type BeforeAdviceCallback<A extends any[] = any[], R = any> = (
  ctx: Record<any, any>,
  target: any,
  property: symbol | string,
  injected: Record<string, any>,
  ...args: any[]
) => R;

export type CallWrapperAdviceCallback<A extends any[] = any[], R = any> = (
  ctx: Record<any, any>,
  target: any,
  property: symbol | string,
  injected: Record<string, any>,
  continuation: MethodType,
  ...args: any[]
) => R;

export type AfterAdviceCallback<A extends any[] = any[], R = any> = (
  ctx: Record<any, any>,
  target: any,
  property: symbol | string,
  injected: Record<string, any>,
  result: any,
  ...args: any[]
) => R;

export type AfterConstructAdviceDecorator<A extends any[] = any[], R = any> = (
  target: any,
  property: symbol | string,
  descriptor: any,
  instance: any,
  proxy: any,
  injected: Record<string, any>,
  ...args: any[]
) => R;

export type AfterConstructAdviceCallback<A extends any[] = any[], R = any> = (
  instance: any,
  proxy: any,
  injected: Record<string, any>,
  ...args: any[]
) => R;

export type AfterExceptionAdviceCallback<A extends any[] = any[], R = any> = (
  ctx: Record<any, any>,
  target: any,
  property: symbol | string,
  injected: Record<string, any>,
  error: Error,
  ...args: any[]
) => R;
export type MethodType = (...args: any[]) => any;
