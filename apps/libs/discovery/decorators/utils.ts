export type ClassDecorator<T = any> = (
  constructor: new (...args: any[]) => T,
) => void;
export type MethodDecorator = (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<any>,
) => void;
export type FieldDecorator = (
  target: any,
  propertyKey: string | symbol,
) => void;

export function isClassDecorator<T>(
  args: any[],
): args is [new (...args: any[]) => T] {
  return (
    args.length === 1 && typeof args[0] === 'function' && !!args[0].prototype
  );
}

export function isMethodDecorator(args: any[]): args is [any, any, any] {
  return args.length === 3 && typeof args[1] === 'string' && !!args[2]?.value;
}

export function isFieldDecorator(args: any[]): args is [any, any] {
  return args.length >= 2 && typeof args[1] === 'string' && !args[2]?.value;
}
