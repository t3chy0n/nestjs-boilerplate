import { Bean } from '@libs/discovery/bean';
import { AnyConstructor } from '@libs/lazy-loader/types';
import * as Advices from '@libs/discovery/decorators/advices.decorators';
import * as Discovery from '@libs/discovery/decorators/injectable.decorator';
import * as sinon from 'sinon';

export const wireTestProxy = (Ctor: AnyConstructor<any>, inject, ...arg) => {
  const instance = new Ctor(...arg);
  const bean = new Bean(Ctor, inject);
  bean.setInstance(instance);
  return bean.createProxy();
};

export function mockDiscoveryModuleAnnotations(sandbox: sinon.SinonSandbox) {
  const mockBefore = sandbox.spy(Advices, 'Before');
  const mockAfter = sandbox.spy(Advices, 'After');
  const mockAfterThrow = sandbox.spy(Advices, 'AfterThrow');
  const mockBeforeSetter = sandbox.spy(Advices, 'BeforeSetter');
  const mockAfterSetter = sandbox.spy(Advices, 'AfterSetter');
  const mockInjectable = sandbox.spy(Discovery, 'Injectable');

  return {
    mockInjectable,
    mockBefore,
    mockBeforeSetter,
    mockAfter,
    mockAfterSetter,
    mockAfterThrow,
  };
}
