export interface AnyConstructor<T> {
  new (...args: any[]): T;
  prototype: any;
}
