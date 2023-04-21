import { expect } from 'chai';
import { of } from 'rxjs';
import { sharedSandbox } from '@libs/testing/test-utils';
import { InterceptorObservableStrategy } from '@libs/discovery/bean/interceptors/interceptor-observable.strategy';

describe('InterceptorObservableStrategy', () => {
  const sandbox = sharedSandbox();

  it('should call interceptors and exceptionInterceptors with arguments', (done) => {
    const interceptor = sandbox.spy();
    const exceptionInterceptor = sandbox.spy();
    const methodFactory = sandbox.stub().callsFake((callback) => callback);
    const strategy = new InterceptorObservableStrategy(
      methodFactory,
      of('result'),
      [interceptor],
      [exceptionInterceptor],
    );

    strategy.intercept('arg1', 'arg2').subscribe({
      next: (value) => {
        expect(interceptor.calledOnce).to.be.true;
        expect(interceptor.calledWith('result', 'arg1', 'arg2')).to.be.true;
        expect(exceptionInterceptor.notCalled).to.be.true;
        done();
      },
    });
  });
});
