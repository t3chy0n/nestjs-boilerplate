import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { ILazyLoaderService } from './lazy-loader-service.interface';
import { Lazy } from './lazy';
import { AnyConstructor } from './types';

import {
  PARAMTYPES_METADATA,
  PROPERTY_DEPS_METADATA,
  SELF_DECLARED_DEPS_METADATA,
} from '@nestjs/common/constants';
import { DependencyIndex } from '@libs/discovery/utils';
import { Bean } from '@libs/discovery/bean/bean';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';

@Injectable()
export class LazyLoader implements ILazyLoaderService {
  private contextId;
  private readonly logger = new Logger(LazyLoader.name);

  private toLazyLoad: Lazy<any>[] = [];
  private lateBeans: any[] = [];

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly externalContextCreator: ExternalContextCreator,
  ) {
    this.contextId = ContextIdFactory.create();
  }

  /***
   * Instantiates lazy providers when module is initialized
   */
  async onApplicationBootstrap() {
    for (const lazy of this.toLazyLoad) {
      const instance = await this.create(
        lazy.clazz,
        ...lazy.assistedInjectionParams,
      );
      lazy.instantiate(instance);
    }
    this.toLazyLoad = [];
  }
  /***
   * Creates proxy to lazy object, allows overriding of depedencies at creation level
   * @param clazz
   */
  async lazyCreate<T>(clazz: AnyConstructor<T>, ...args: any[]): Promise<T> {
    const lazy = new Lazy<T>(clazz, this.logger);
    lazy.assistedInjectionParams = [...args];

    this.toLazyLoad.push(lazy);
    const res: unknown = new Proxy(lazy, {
      get: (target, propKey, receiver) => {
        //Allow only to instantiate lazy, otherwise we try to access proxy
        if (propKey == 'instantiate') {
          return lazy.instantiate;
        }
        if (propKey == 'instance') {
          return lazy.instance;
        }

        return lazy.proxy[propKey];
      },
    });
    return res as T;
  }

  resolveBean<T>(clazz: AnyConstructor<T>, ...args: any[]): T {
    const instance = this.create(clazz, ...args);
    const depIndex = new DependencyIndex(clazz);

    try {
      const resolved = depIndex.getArray().map((dep) =>
        this.moduleRef.get(
          //Either resolve injection token, or constructor dependency type passed
          dep,
          {
            strict: false,
          },
        ),
      );

      const toInject = depIndex.remapDepsToObject(resolved);
      const bean = new Bean(clazz, toInject, this.externalContextCreator);
      bean.setInstance(instance);

      return bean.createProxy() as T;
    } catch (e) {
      console.error(e);
    }
  }

  async resolve<T>(clazz: AnyConstructor<T>, ...args: any[]): Promise<T> {
    const types: any[] = Reflect.getMetadata(PARAMTYPES_METADATA, clazz) || [];
    const selfDeclaredDeps: any[] = Reflect.getMetadata(
      SELF_DECLARED_DEPS_METADATA,
      clazz,
    );

    //Check if there are no decorators used, that override provider to injection token
    const injectionTokens =
      selfDeclaredDeps?.reduce((acc, cv, i, arr) => {
        acc[cv.index] = cv.param;
        return acc;
      }, []) || [];

    //Resolved dependencies
    const resolved = args;

    let index = 0;
    for (const dep of types) {
      if (index < resolved.length) {
        index++;
        continue;
      }
      const res = await this.moduleRef.resolve(
        //Either resolve injection token, or constructor dependency type passed
        injectionTokens[index] ?? dep,
        this.contextId,
        {
          strict: false,
        },
      );

      resolved.push(res);
      index++;
    }
    return new clazz(...resolved);
  }

  create<T>(clazz: AnyConstructor<T>, ...args: any[]): T {
    const types: any[] = Reflect.getMetadata(PARAMTYPES_METADATA, clazz) || [];
    const selfDeclaredDeps: any[] = Reflect.getMetadata(
      SELF_DECLARED_DEPS_METADATA,
      clazz,
    );

    //Check if there are no decorators used, that override provider to injection token
    const injectionTokens =
      selfDeclaredDeps?.reduce((acc, cv, i, arr) => {
        acc[cv.index] = cv.param;
        return acc;
      }, []) || [];

    //Resolved dependencies
    const resolved = args;

    let index = 0;
    for (const dep of types) {
      if (index < resolved.length) {
        index++;
        continue;
      }
      const res = this.moduleRef.get(
        //Either resolve injection token, or constructor dependency type passed
        injectionTokens[index] ?? dep,
        {
          strict: false,
        },
      );
      resolved.push(res);
      index++;
    }
    return new clazz(...resolved);
  }

  async instantiate<T>(clazz: AnyConstructor<T>) {
    const res = await this.moduleRef.resolve(
      //Either resolve injection token, or constructor dependency type passed
      clazz,
      this.contextId,
      {
        strict: false,
      },
    );

    return res;
  }
}
