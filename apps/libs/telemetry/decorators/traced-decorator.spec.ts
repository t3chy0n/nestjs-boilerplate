import { Traced } from './traced.decorator';
import {
  EnsureParentImports,
  Before,
  After,
  AfterThrow,
  Injectable,
} from '@libs/discovery';
import { ADVICES_ENSURE_PARENT_IMPORTS } from '@libs/discovery/const';
import { ITracing } from '@libs/telemetry/tracing.interface';

const mockBefore = jest.fn();
const mockAfter = jest.fn();
const mockAfterThrow = jest.fn();
const mockInjectable = jest.fn();
jest.mock('@libs/discovery', () => {
  const originalModule = jest.requireActual('@libs/discovery');

  const mockedModule = {
    ...originalModule,
    Injectable: jest.fn(() => (target, propertyKey, descriptor) => {
      mockInjectable(target, propertyKey, descriptor);
    }),
    Before: jest.fn(() => (target, propertyKey, descriptor) => {
      mockBefore(target, propertyKey, descriptor);
    }),
    After: jest.fn(() => (target, propertyKey, descriptor) => {
      mockAfter(target, propertyKey, descriptor);
    }),
    AfterThrow: jest.fn(() => (target, propertyKey, descriptor) => {
      mockAfterThrow(target, propertyKey, descriptor);
    }),
  };

  return mockedModule;
});
describe('Traced', () => {
  afterAll(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('when applied to a field', () => {
    it('should decorate the field with TracedField decorator', () => {
      class TestClass {
        @Traced
        myField = 123;

        @Traced
        myField2 = 123;

        @Traced
        myField3 = 123;
      }

      const instance = new TestClass();

      const moduleImports = Reflect.getMetadata(
        ADVICES_ENSURE_PARENT_IMPORTS,
        instance,
      );

      expect(instance.myField).toEqual(123);
      expect(moduleImports.length).toEqual(1);
    });
  });

  describe('when applied to a class', () => {
    it('should decorate all methods and fields with TracedField decorator', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation();

      @Traced
      class TestClass {
        constructor() {}

        myMethod() {}

        myField = 123;
      }

      const instance = new TestClass();
      const methods = Object.getOwnPropertyNames(TestClass.prototype).filter(
        (prop) =>
          typeof instance[prop] === 'function' && prop !== 'constructor',
      );

      expect(Injectable).toHaveBeenCalledWith({
        inject: { tracer: ITracing },
      });

      const moduleImports = Reflect.getMetadata(
        ADVICES_ENSURE_PARENT_IMPORTS,
        TestClass,
      );
      expect(moduleImports.length).toEqual(1);
      expect(spy).not.toHaveBeenCalled();
      expect(instance.myField).toEqual(123);

      for (const method of methods) {
        instance[method]();

        expect(Before).toHaveBeenCalled();
        // expect(instance.tracer.startActiveSpan).toHaveBeenCalled();

        if (method === 'myMethod') {
          expect(After).toHaveBeenCalled();
          expect(AfterThrow).toHaveBeenCalled();
        }
      }

      spy.mockRestore();
    });
  });

  describe('when applied to a method', () => {
    it('should decorate the method with TracedField decorator', () => {

      class TestClass {
        @Traced
        myMethod() {}
        @Traced
        myMethod2() {}
      }

      const instance = new TestClass();
      instance.myMethod();

      expect(Before).toHaveBeenCalled();
      expect(After).toHaveBeenCalled();
      expect(AfterThrow).toHaveBeenCalled();

      const moduleImports = Reflect.getMetadata(
        ADVICES_ENSURE_PARENT_IMPORTS,
        instance,
      );
      expect(moduleImports.length).toEqual(1);
    });
  });
});
