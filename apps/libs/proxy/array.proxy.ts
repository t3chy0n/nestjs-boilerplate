type Enricher = (() => any[]) | any[];

export function createArrayProxy(handler: any, enricher: Enricher) {
  if (!handler && !enricher) {
    throw new Error('handler and enricher arguments are required');
  }
  if (typeof handler !== 'object') {
    throw new Error('handler argument must be an object');
  }
  if (typeof enricher !== 'function' && !Array.isArray(enricher)) {
    throw new Error('enricher argument must be an array or a function');
  }

  return {
    ...handler,
    get: (target: any, prop: any, receiver: any) => {
      if (!Array.isArray(target)) {
        throw new Error('target must be an array');
      }

      const value = handler.get
        ? handler.get(target, prop, receiver)
        : Reflect.get(target, prop, receiver);

      if (
        typeof value === 'function' &&
        Reflect.get(Array.prototype, value.name) === value //||
        // Reflect.get(ArrayIteratorProto, value.name) === value\
      ) {
        if (value.name != 'values') return value.bind(target);
        else {
          const generator = function* () {
            for (const element of target) {
              yield element;
            }
            // Extend the array with additional elements
            const enrichedValues =
              typeof enricher === 'function' ? enricher() : [...enricher];
            yield* enrichedValues;
          }.bind(target);
          return generator.bind(target);
        }
      }
      return value;
    },
  };
}
