import { Bean } from './bean';
import {
  ADVICES_AFTER,
  ADVICES_AFTER_THROW,
  ADVICES_BEFORE,
  ADVICES_SETTER_AFTER,
  ADVICES_SETTER_BEFORE,
} from '@libs/discovery/const';
import { AnyConstructor } from '@libs/lazy-loader/types';
import { expect } from '@utils/test-utils';
import * as sinon from 'sinon';
import { assert } from 'chai';

describe('Bean', () => {
  class TestClass {
    public testField = 'testField';

    public async testMethod(d?: string) {
      return `testMethod ${d}`;
    }
  }

  let bean: Bean<any>;
  let testInstance: TestClass;

  beforeEach(() => {
    testInstance = new TestClass();
    bean = new Bean(TestClass);
  });

  it('should create an instance', () => {
    expect(bean).not.to.be.undefined;
  });

  it('should set instance', async () => {
    await bean.setInstance(testInstance);
    expect(bean['instance']).to.be.equal(testInstance);
  });

  describe('wireMethodAdvices', () => {
    let beforeCallbacks: any[];
    let afterCallbacks: any[];
    let property: string;
    let ctx: Record<any, any>;

    beforeEach(async () => {
      await bean.setInstance(testInstance);
      beforeCallbacks = [];
      afterCallbacks = [];
      property = 'testMethod';
      ctx = {};
    });

    it('should return the overriden method without executing the callbacks', () => {
      const overriden = bean['wireMethodAdvices'](
        beforeCallbacks,
        afterCallbacks,
        property,
        ctx,
      );
      expect(overriden).to.be.instanceof(Function);
    });

    it('should call the original method when invoking the overridden method', async () => {
      const overridden = bean['wireMethodAdvices'](
        beforeCallbacks,
        afterCallbacks,
        property,
        ctx,
      );
      const result = await overridden('example');
      expect(result).to.be.equal('testMethod example');
    });

    describe('createProxy with getters on async method', () => {
      let adviceBefore;
      let adviceAfter;
      let adviceBeforeSetter;
      let adviceAfterSetter;
      let adviceAfterThrow;
      let testInstance: TestClassWithAdvices;

      class TestClassWithAdvices {
        public testField = 'testField';

        public async testMethod(arg: string, shouldThrow = false) {
          if (shouldThrow) {
            throw new Error('Test');
          }
          return `testMethod ${arg}`;
        }
      }

      beforeEach(() => {
        adviceBefore = sinon.stub();
        adviceAfter = sinon.stub();

        adviceBeforeSetter = sinon.stub();
        adviceAfterSetter = sinon.stub();
        adviceAfterThrow = sinon.stub();

        Reflect.defineMetadata(
          ADVICES_BEFORE,
          { testMethod: [adviceBefore] },
          TestClassWithAdvices.prototype,
        );
        Reflect.defineMetadata(
          ADVICES_AFTER,
          { testMethod: [adviceAfter] },
          TestClassWithAdvices.prototype,
        );
        Reflect.defineMetadata(
          ADVICES_AFTER_THROW,
          { testMethod: [adviceAfterThrow] },
          TestClassWithAdvices.prototype,
        );
        Reflect.defineMetadata(
          ADVICES_SETTER_BEFORE,
          { testMethod: [adviceBeforeSetter] },
          TestClassWithAdvices.prototype,
        );
        Reflect.defineMetadata(
          ADVICES_SETTER_AFTER,
          { testMethod: [adviceAfterSetter] },
          TestClassWithAdvices.prototype,
        );

        testInstance = new TestClassWithAdvices();
        bean = new Bean(TestClassWithAdvices);
      });

      it('should call before and after advices when invoking the method', async () => {
        await bean.setInstance(testInstance);
        const proxy: any = bean.createProxy();
        const wireMethodAdvicesSpy = sinon.spy(bean, 'wireMethodAdvices');
        const wireExceptionAdvicesSpy = sinon.spy(bean, 'wireExceptionAdvices');
        const wireFieldAdvicesSpy = sinon.spy(bean, 'wireFieldAdvices');

        const result = await proxy.testMethod('example');

        expect(wireMethodAdvicesSpy.callCount).to.be.equal(1);
        expect(wireExceptionAdvicesSpy.callCount).to.be.equal(0);
        expect(wireFieldAdvicesSpy.callCount).to.be.equal(0);
        expect(result).to.be.equal('testMethod example');

        expect(adviceBefore.callCount).to.be.equal(1);
        expect(adviceAfter.callCount).to.be.equal(1);
        expect(adviceBeforeSetter.callCount).to.be.equal(0);
        expect(adviceAfterSetter.callCount).to.be.equal(0);
        expect(adviceAfterThrow.callCount).to.be.equal(0);
      });

      it('should call after throw advices when invoking the method', async () => {
        await bean.setInstance(testInstance);
        const proxy: any = bean.createProxy();
        const wireMethodAdvicesSpy = sinon.spy(bean, 'wireMethodAdvices');
        const wireExceptionAdvicesSpy = sinon.spy(bean, 'wireExceptionAdvices');
        const wireFieldAdvicesSpy = sinon.spy(bean, 'wireFieldAdvices');

        const result = await proxy.testMethod('example', true);

        expect(wireMethodAdvicesSpy.callCount).to.be.equal(1);
        expect(wireExceptionAdvicesSpy.callCount).to.be.equal(1);
        expect(wireFieldAdvicesSpy.callCount).to.be.equal(0);
        expect(result).to.be.undefined;
        expect(adviceBefore.callCount).to.be.equal(1);
        expect(adviceAfter.callCount).to.be.equal(0);
        expect(adviceBeforeSetter.callCount).to.be.equal(0);
        expect(adviceAfterSetter.callCount).to.be.equal(0);
        expect(adviceAfterThrow.callCount).to.be.equal(1);
      });
    });

    describe('createProxy with getters on sync method', () => {
      let adviceBefore;
      let adviceAfter;
      let adviceBeforeSetter;
      let adviceAfterSetter;
      let adviceAfterThrow;
      let testInstance: TestClassWithAdvices;

      class TestClassWithAdvices {
        public testField = 'testField';

        public testMethod(arg: string, shouldThrow = false) {
          if (shouldThrow) {
            throw new Error('Test');
          }
          return `testMethod ${arg}`;
        }
      }

      beforeEach(() => {
        adviceBefore = sinon.stub();
        adviceAfter = sinon.stub();

        adviceBeforeSetter = sinon.stub();
        adviceAfterSetter = sinon.stub();
        adviceAfterThrow = sinon.stub();

        Reflect.defineMetadata(
          ADVICES_BEFORE,
          { testMethod: [adviceBefore] },
          TestClassWithAdvices.prototype,
        );
        Reflect.defineMetadata(
          ADVICES_AFTER,
          { testMethod: [adviceAfter] },
          TestClassWithAdvices.prototype,
        );
        Reflect.defineMetadata(
          ADVICES_AFTER_THROW,
          { testMethod: [adviceAfterThrow] },
          TestClassWithAdvices.prototype,
        );
        Reflect.defineMetadata(
          ADVICES_SETTER_BEFORE,
          { testMethod: [adviceBeforeSetter] },
          TestClassWithAdvices.prototype,
        );
        Reflect.defineMetadata(
          ADVICES_SETTER_AFTER,
          { testMethod: [adviceAfterSetter] },
          TestClassWithAdvices.prototype,
        );

        testInstance = new TestClassWithAdvices();
        bean = new Bean(TestClassWithAdvices);
      });

      it('should call before and after advices when invoking the method', async () => {
        await bean.setInstance(testInstance);
        const proxy = bean.createProxy();
        const wireMethodAdvicesSpy = sinon.spy(bean, 'wireMethodAdvices');
        const wireExceptionAdvicesSpy = sinon.spy(bean, 'wireExceptionAdvices');
        const wireFieldAdvicesSpy = sinon.spy(bean, 'wireFieldAdvices');

        const result = await proxy.testMethod('example');

        expect(wireMethodAdvicesSpy.callCount).to.be.equal(1);
        expect(wireExceptionAdvicesSpy.callCount).to.be.equal(0);
        expect(wireFieldAdvicesSpy.callCount).to.be.equal(0);

        expect(result).to.be.equal('testMethod example');
        expect(adviceBefore.callCount).to.be.equal(1);
        expect(adviceAfter.callCount).to.be.equal(1);
        expect(adviceBeforeSetter.callCount).to.be.equal(0);
        expect(adviceAfterSetter.callCount).to.be.equal(0);
        expect(adviceAfterThrow.callCount).to.be.equal(0);
      });

      it('should call after throw advices when invoking the method', async () => {
        await bean.setInstance(testInstance);
        const proxy = bean.createProxy();
        const wireMethodAdvicesSpy = sinon.spy(bean, 'wireMethodAdvices');
        const wireExceptionAdvicesSpy = sinon.spy(bean, 'wireExceptionAdvices');
        const wireFieldAdvicesSpy = sinon.spy(bean, 'wireFieldAdvices');

        const result = await proxy.testMethod('example', true);

        expect(wireMethodAdvicesSpy.callCount).to.be.equal(1);
        expect(wireExceptionAdvicesSpy.callCount).to.be.equal(1);
        expect(wireFieldAdvicesSpy.callCount).to.be.equal(0);
        expect(result).to.be.undefined;

        expect(adviceBefore.callCount).to.be.equal(1);
        expect(adviceAfter.callCount).to.be.equal(0);
        expect(adviceBeforeSetter.callCount).to.be.equal(0);
        expect(adviceAfterSetter.callCount).to.be.equal(0);
        expect(adviceAfterThrow.callCount).to.be.equal(1);
      });
    });
  });

  describe('wireFieldAdvices', () => {
    let beforeCallbacks: any[];
    let afterCallbacks: any[];
    let property: string;
    let ctx: Record<any, any>;
    let adviceBefore;
    let adviceAfter;

    beforeEach(async () => {
      adviceBefore = sinon.stub();
      adviceAfter = sinon.stub();

      await bean.setInstance(testInstance);
      beforeCallbacks = [];
      afterCallbacks = [];
      property = 'testField';
      ctx = {};
      Reflect.defineMetadata(
        ADVICES_BEFORE,
        { testMethod: [adviceBefore] },
        TestClass.prototype,
      );
      Reflect.defineMetadata(
        ADVICES_AFTER,
        { testMethod: [adviceAfter] },
        TestClass.prototype,
      );
    });

    it('should return default value if no callbacks are provided', () => {
      const proxy = bean.createProxy();

      const wireMethodAdvicesSpy = sinon.spy(bean, 'wireMethodAdvices');
      const wireExceptionAdvicesSpy = sinon.spy(bean, 'wireExceptionAdvices');
      const wireFieldAdvicesSpy = sinon.spy(bean, 'wireFieldAdvices');

      const result = proxy.testField;

      expect(wireMethodAdvicesSpy.callCount).to.be.equal(0);
      expect(wireExceptionAdvicesSpy.callCount).to.be.equal(0);
      expect(wireFieldAdvicesSpy.callCount).to.be.equal(1);
      expect(result).to.be.equal('testField');
    });

    // Add more test cases for different scenarios
  });

  describe('constructGetHandler', () => {
    beforeEach(async () => {
      await bean.setInstance(testInstance);
    });
    it('should throw an error if no target is provided', () => {
      const getHandler = bean['constructGetHandler']();

      assert.throws(
        () => getHandler(null, 'testField'),
        Error,
        'There is no target for a Bean',
      );
    });

    // Add more test cases for different scenarios
  });
});
