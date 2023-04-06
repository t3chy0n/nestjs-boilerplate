import { JsonPointer } from 'json-ptr';

export type YieldedDeepIteratee = [any, string | number, JsonPointer];

export function* deepPairs(
  obj,
  currentPtr: JsonPointer = null,
): Generator<YieldedDeepIteratee, YieldedDeepIteratee, void> {
  if (!obj) {
    return;
  }

  const keys = Object.keys(obj);
  const ptr = currentPtr ?? JsonPointer.create('/').relative('1');

  for (const k of keys) {
    const type = typeof obj[k];
    const currentPtr = ptr.relative(`0/${k}`);
    if (!!obj[k] && type === 'object') {
      yield [obj[k], k, currentPtr];
      yield* deepPairs(obj[k], currentPtr);
    } else {
      yield [obj[k], k, currentPtr];
    }
  }
}
