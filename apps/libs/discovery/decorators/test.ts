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

export function spyOnDiscoveryModuleAnnotations(sandbox: sinon.SinonSandbox) {
  const spyBefore = sandbox.spy(Advices, 'Before');
  const spyAfter = sandbox.spy(Advices, 'After');
  const spyAfterThrow = sandbox.spy(Advices, 'AfterThrow');
  const spyBeforeSetter = sandbox.spy(Advices, 'BeforeSetter');
  const spyAfterSetter = sandbox.spy(Advices, 'AfterSetter');
  const spyInjectable = sandbox.spy(Discovery, 'Injectable');

  return {
    spyInjectable,
    spyBefore,
    spyBeforeSetter,
    spyAfter,
    spyAfterSetter,
    spyAfterThrow,
  };
}
