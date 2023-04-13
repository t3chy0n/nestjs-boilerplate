import { Traced } from './traced.decorator';

import { ADVICES_ENSURE_PARENT_IMPORTS } from '@libs/discovery/const';
import { expect, sharedSandbox } from '@utils/test-utils';
import { JaegerTracerDriver } from '@libs/telemetry/drivers/jaeger/tracer.driver';
import { Span } from '@opentelemetry/api/build/src/trace/span';
import {
  spyOnDiscoveryModuleAnnotations,
  wireTestProxy,
} from '@libs/discovery/decorators/test';
import { assert } from 'chai';

describe('Traced', () => {
  const sandbox = sharedSandbox();

  describe('with Jaeger driver', () => {
    let BeforeSpy;
    let AfterSpy;
    let AfterThrowSpy;
    let InjectableSpy;

    let tracer;
    let spanStub: Span;

    beforeEach(() => {
      const { spyBefore, spyAfter, spyInjectable, spyAfterThrow } =
        spyOnDiscoveryModuleAnnotations(sandbox);

      BeforeSpy = spyBefore;
      AfterSpy = spyAfter;
      AfterThrowSpy = spyAfterThrow;
      InjectableSpy = spyInjectable;

      spanStub = {
        recordException: sandbox.stub(),
        setAttribute: sandbox.stub(),
        setAttributes: sandbox.stub(),
        isRecording: sandbox.stub(),
        addEvent: sandbox.stub(),
        setStatus: sandbox.stub(),
        spanContext: sandbox.stub(),
        updateName: sandbox.stub(),
        end: sandbox.stub(),
      };

      sandbox.stub(JaegerTracerDriver.prototype, 'initialize');
      sandbox
        .stub(JaegerTracerDriver.prototype, 'startActiveSpan')
        .callsFake((name: string, cb) => {
          cb(spanStub);
        });

      tracer = new JaegerTracerDriver(
        sandbox.stub() as any,
        sandbox.stub() as any,
      );
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

        const instance = wireTestProxy(TestClass, { tracer });

        const moduleImports = Reflect.getMetadata(
          ADVICES_ENSURE_PARENT_IMPORTS,
          new TestClass(),
        );

        expect(instance.myField).to.be.equal(123);
        expect(moduleImports.length).to.be.equal(1);

        expect((spanStub.end as any).callCount).to.be.equal(1);
      });
    });

    describe('when applied to a class', () => {
      it('should decorate all methods and fields with TracedField decorator', () => {
        const spy = sandbox.stub(console, 'error');

        @Traced
        class TestClass {
          constructor() {}

          myMethod() {}

          myField = 123;
        }

        const instance = wireTestProxy(TestClass, { tracer });
        const methods = Object.getOwnPropertyNames(TestClass.prototype).filter(
          (prop) =>
            typeof instance[prop] === 'function' && prop !== 'constructor',
        );

        expect(InjectableSpy).to.have.been.called;
        expect(
          InjectableSpy.calledWithMatch(
            sandbox.match((v) => {
              return !!v?.inject?.tracer;
            }, 'Should inject tracer'),
          ),
        ).to.be.true;

        const moduleImports = Reflect.getMetadata(
          ADVICES_ENSURE_PARENT_IMPORTS,
          TestClass,
        );
        expect(moduleImports.length).to.be.equal(1);
        expect(spy).not.to.have.been.calledWith();
        expect(instance.myField).to.be.equal(123);

        expect((spanStub.end as any).callCount).to.be.equal(1);
        for (const method of methods) {
          instance[method]();

          expect(BeforeSpy).to.have.been.called;
          // expect(instance.tracer.startActiveSpan).toHaveBeenCalled();

          if (method === 'myMethod') {
            expect(AfterSpy).to.have.been.called;
            expect(AfterThrowSpy).to.have.been.called;
          }
        }
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

        const instance = wireTestProxy(TestClass, { tracer });
        instance.myMethod();

        expect((spanStub.end as any).callCount).to.be.equal(1);
      });
      describe('when Error is thrown', () => {
        const subjectError = new Error('Test');

        it('should handle trace from sync method', () => {
          class TestClass {
            @Traced
            myMethod() {
              throw subjectError;
            }
          }

          const instance = wireTestProxy(TestClass, { tracer });

          assert.throw(() => {
            instance.myMethod();
          });

          const moduleImports = Reflect.getMetadata(
            ADVICES_ENSURE_PARENT_IMPORTS,
            new TestClass(),
          );
          expect(moduleImports.length).to.be.equal(1);
          expect(spanStub.recordException).to.have.been.calledWith(
            subjectError,
          );
          expect((spanStub.end as any).callCount).to.be.equal(1);
        });
        it('should handle trace from async method', async () => {
          const subjectError = new Error('Test');
          class TestClass {
            @Traced
            async myMethod() {
              throw subjectError;
            }
          }

          const instance = wireTestProxy(TestClass, { tracer });

          let caughtError;
          try {
            await instance.myMethod();
          } catch (e) {
            caughtError = e;
          }

          const moduleImports = Reflect.getMetadata(
            ADVICES_ENSURE_PARENT_IMPORTS,
            new TestClass(),
          );
          expect(moduleImports.length).to.be.equal(1);
          expect(caughtError).to.be.equal(subjectError);
          expect(spanStub.recordException).to.have.been.calledWith(
            subjectError,
          );
          expect((spanStub.end as any).callCount).to.be.equal(1);
        });
      });
    });
  });
});
