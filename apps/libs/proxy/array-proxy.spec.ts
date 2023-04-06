import { createArrayProxy } from '@libs/proxy/array.proxy';

describe('createArrayProxy', () => {
  it('should return an object containing the original handler', () => {
    const handler = { a: 1, b: 2 };
    const enricher = [];
    const proxy = createArrayProxy(handler, enricher);
    expect(proxy).toMatchObject(handler);
  });

  it('should return an object with all properties of the original handler', () => {
    const handler = { customProperty: 'customValue' };
    const enricher = [];
    const proxyHandler = createArrayProxy(handler, enricher);

    expect(proxyHandler.customProperty).toBe('customValue');
  });

  it('should return an object with a get method', () => {
    const handler = {};
    const enricher = [];
    const proxyHandler = createArrayProxy(handler, enricher);

    expect(typeof proxyHandler.get).toBe('function');
  });

  it('get method should return array methods bound to the target', () => {
    const handler = {};
    const enricher = [];
    const proxyHandler = createArrayProxy(handler, enricher);
    const target = [1, 2, 3];
    const prop = 'pop';
    const receiver = target;

    const boundMethod = proxyHandler.get(target, prop, receiver);

    expect(boundMethod()).toBe(3);
    expect(target).toEqual([1, 2]);
  });

  it('get method should return a generator function for values method', () => {
    const handler = {};
    const enricher = [4, 5, 6];
    const proxyHandler = createArrayProxy(handler, enricher);
    const target = [1, 2, 3];
    const prop = 'values';
    const receiver = target;

    const generator = proxyHandler.get(target, prop, receiver);
    const values = [...generator()];

    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('get method should work with a custom enricher function', () => {
    const handler = {};
    const enricher = () => [4, 5, 6];
    const proxyHandler = createArrayProxy(handler, enricher);
    const target = [1, 2, 3];
    const prop = 'values';
    const receiver = target;

    const generator = proxyHandler.get(target, prop, receiver);
    const values = [...generator()];

    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
  });

  describe('Errors', () => {
    it('should throw an error when both handler and enricher arguments are missing', () => {
      expect(() => {
        createArrayProxy(undefined, undefined);
      }).toThrowError('handler and enricher arguments are required');
    });

    it('should throw an error when the handler argument is not an object', () => {
      const handler = 'notAnObject';
      const enricher = [];

      expect(() => {
        createArrayProxy(handler, enricher);
      }).toThrowError('handler argument must be an object');
    });

    it('get method should throw an error when the target is not an array', () => {
      const handler = {};
      const enricher = [];
      const proxyHandler = createArrayProxy(handler, enricher);
      const target = 'notAnArray';
      const prop = 'values';
      const receiver = target;

      expect(() => {
        proxyHandler.get(target, prop, receiver);
      }).toThrowError('target must be an array');
    });
  });
  // Add more tests here
});
