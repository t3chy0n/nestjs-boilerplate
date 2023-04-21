import { expect } from 'chai';
import { sharedSandbox } from '@libs/testing/test-utils';
import { InterceptorPromiseStrategy } from '@libs/discovery/bean/interceptors/interceptor-promise.strategy';

describe('InterceptorPromiseStrategy', () => {
  const sandbox = sharedSandbox();

  it('should call interceptors with result and arguments', async () => {
    const interceptor = sandbox.spy();
    const strategy = new InterceptorPromiseStrategy(
      Promise.resolve('result'),
      [interceptor],
      [],
    );

    const res = await strategy.intercept('arg1', 'arg2');
    expect(res).to.equal('result');
    expect(interceptor.calledOnce).to.be.true;
    expect(interceptor.calledWith('result', 'arg1', 'arg2')).to.be.true;
  });

  it('should call exceptionInterceptors on error', async () => {
    const interceptor = sandbox.spy();
    const exceptionInterceptor = sandbox.spy();
    const strategy = new InterceptorPromiseStrategy(
      Promise.reject('error'),
      [interceptor],
      [exceptionInterceptor],
    );
  });
});
