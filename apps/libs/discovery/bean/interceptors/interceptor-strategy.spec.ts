import { expect } from 'chai';
import { sharedSandbox } from '@libs/testing/test-utils';
import { InterceptorStrategy } from '@libs/discovery/bean/interceptors/interceptor.strategy';

describe('InterceptorStrategy', () => {
  const sandbox = sharedSandbox();

  it('should call interceptors with result and arguments', () => {
    const interceptor = sandbox.spy();
    const strategy = new InterceptorStrategy('result', [interceptor], []);
    strategy.intercept('arg1', 'arg2');

    expect(interceptor.callCount).to.be.equal(1);
    expect(interceptor.calledWith('result', 'arg1', 'arg2')).to.be.true;
  });
});
