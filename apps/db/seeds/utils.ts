// eslint-disable-next-line @typescript-eslint/ban-types
export function* generator(factory, limit) {
  while (limit-- > 0) {
    yield factory();
  }
}
