import { Bean } from '@libs/discovery/bean/bean';
import { AnyConstructor } from '@libs/lazy-loader/types';
import * as Advices from '@libs/discovery/decorators/advices.decorators';
import * as Discovery from '@libs/discovery/decorators/injectable.decorator';
import * as sinon from 'sinon';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';

export const wireBeanProxy = (
  Ctor: AnyConstructor<any>,
  inject,
  externalContextCreator: ExternalContextCreator = null,
  ...arg
) => {
  const instance = new Ctor(...arg);
  const bean = new Bean(Ctor, inject, externalContextCreator);
  bean.setInstance(instance);
  return bean.createProxy() as any;
};

export function spyOnDiscoveryModuleAnnotations(sandbox: sinon.SinonSandbox) {
  const spyBefore = sandbox.spy(Advices, 'Before');
  const spyAfter = sandbox.spy(Advices, 'After');
  const spyAfterThrow = sandbox.spy(Advices, 'AfterThrow');
  const spyInjectable = sandbox.spy(Discovery, 'Injectable');

  return {
    spyInjectable,
    spyBefore,
    spyAfter,
    spyAfterThrow,
  };
}
