import { expect } from 'chai';
import { Observable } from 'rxjs';
import { BeanInterceptorFactory } from '@libs/discovery/bean/interceptors/interceptor.factory';
import { InterceptorStrategy } from '@libs/discovery/bean/interceptors/interceptor.strategy';
import { InterceptorPromiseStrategy } from '@libs/discovery/bean/interceptors/interceptor-promise.strategy';
import { sharedSandbox } from '@libs/testing/test-utils';

describe('BeanInterceptorFactory', () => {
  const sandbox = sharedSandbox();
  const noop: any = () => {};

  describe('for Promise', () => {
    describe('on promise result', () => {
      it('should select InterceptorPromiseStrategy for Promise', () => {
        const factory = new BeanInterceptorFactory(noop, [], {} as any, [], []);
        const strategy = factory.selectStrategy(Promise.resolve());
        expect(strategy).to.be.instanceof(InterceptorPromiseStrategy);
      });

      it('with successful result should call interceptors with result and arguments', async () => {
        const interceptor = sandbox.spy();
        const errorInterceptor = sandbox.spy();

        const factory = new BeanInterceptorFactory(
          () => noop,
          ['arg1', 'arg2'],
          {} as any,
          [interceptor],
          [errorInterceptor],
        );
        const strategy = factory.selectStrategy(Promise.resolve('result'));
        await strategy.intercept('arg1', 'arg2');

        expect(interceptor.callCount).to.be.equal(1);
        expect(errorInterceptor.callCount).to.be.equal(0);
        expect(interceptor.calledWith('result', 'arg1', 'arg2')).to.be.true;
      });

      it('with rejection should call interceptors with result and arguments', async () => {
        const errorInterceptor = sandbox.spy();
        const interceptor = sandbox.spy();
        const factory = new BeanInterceptorFactory(
          () => noop,
          ['arg1', 'arg2'],
          {} as any,
          [interceptor],
          [errorInterceptor],
        );
        const strategy = factory.selectStrategy(
          Promise.reject('resultException'),
        );

        await strategy.intercept('arg1', 'arg2');

        expect(interceptor.callCount).to.be.equal(0);
        expect(errorInterceptor.callCount).to.be.equal(1);
        expect(errorInterceptor.calledWith('resultException')).to.be.true;
      });
    });
  });

  it('should select InterceptorObservableStrategy for Observable', () => {
    const factory = new BeanInterceptorFactory(noop, [], {} as any, [], []);
    const strategy = factory.selectStrategy(new Observable());
    expect(strategy.constructor.name).to.equal('InterceptorObservableStrategy');
  });

  it('should select InterceptorStrategy for other types', () => {
    const factory = new BeanInterceptorFactory(noop, [], {} as any, [], []);
    const strategy = factory.selectStrategy('some string');
    expect(strategy.constructor.name).to.equal('InterceptorStrategy');
  });
});
