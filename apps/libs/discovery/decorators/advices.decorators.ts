import {
  ADVICES_AFTER,
  ADVICES_AFTER_THROW,
  ADVICES_BEFORE,
  ADVICES_SETTER_AFTER,
  ADVICES_SETTER_AFTER_THROW,
  ADVICES_SETTER_BEFORE,
  PROXY_FIELD_DEFAULTS,
  ADVICES_BELONGS_TO,
  ADVICES_ENSURE_PARENT_IMPORTS,
} from '@libs/discovery/const';
import { AnyConstructor } from '@libs/lazy-loader/types';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { UpsertMetadata } from '@libs/discovery/decorators/upsert-metadata.decorator';

function dumpDefaults(target: any, key: string | symbol) {
  const defaults = Reflect.getMetadata(PROXY_FIELD_DEFAULTS, target) || {};
  defaults[key] = target[key];
  Reflect.defineMetadata(PROXY_FIELD_DEFAULTS, defaults, target);
}
function ensureAdviceCb(
  metadataKey: string,
  target: any,
  key: any,
  cb: (target: any, property: symbol | number, ...args: any[]) => any,
) {
  try {
    const t = Reflect.getMetadataKeys(target) || {};
    const callbacks = Reflect.getMetadata(metadataKey, target) || {};
    dumpDefaults(target, key);

    if (!callbacks[key]) {
      callbacks[key] = [];
    }
    callbacks[key].push(cb);
    Reflect.defineMetadata(metadataKey, callbacks, target);
  } catch (e) {
    console.error('Error adding Advice', e);
  }
}

export function Before(
  cb: (
    ctx: Record<any, any>,
    target: any,
    property: symbol | number,
    ...args: any[]
  ) => any,
) {
  return (target: any, key: string | symbol | undefined, index?: number) => {
    ensureAdviceCb(ADVICES_BEFORE, target, key, cb);
  };
}
export function After(
  cb: (
    ctx: Record<any, any>,
    target: any,
    property: symbol | number,
    ...args: any[]
  ) => any,
) {
  return (target: any, key: string | symbol | undefined, index?: number) => {
    ensureAdviceCb(ADVICES_AFTER, target, key, cb);
  };
}

export function Around(
  cb: (
    ctx: Record<any, any>,
    target: any,
    property: symbol | number,
    ...args: any[]
  ) => any,
) {
  return applyDecorators(Before(cb), After(cb));
}

export function AfterThrow(
  cb: (
    ctx: Record<any, any>,
    target: any,
    property: symbol | number,
    ...args: any[]
  ) => any,
) {
  return (target: any, key: string | symbol | undefined, index?: number) => {
    ensureAdviceCb(ADVICES_AFTER_THROW, target, key, cb);
  };
}

export function BeforeSetter(
  cb: (
    ctx: Record<any, any>,
    target: any,
    property: symbol | number,
    ...args: any[]
  ) => any,
) {
  return (target: any, key: string | symbol | undefined, index?: number) => {
    ensureAdviceCb(ADVICES_SETTER_BEFORE, target, key, cb);
  };
}
export function AfterSetter(
  cb: (
    ctx: Record<any, any>,
    target: any,
    property: symbol | number,
    ...args: any[]
  ) => any,
) {
  return (target: any, key: string | symbol | undefined, index?: number) => {
    ensureAdviceCb(ADVICES_SETTER_AFTER, target, key, cb);
  };
}
export function AfterThrowSetter(
  cb: (
    ctx: Record<any, any>,
    target: any,
    property: symbol | number,
    args: Error,
  ) => any,
) {
  return (target: any, key: string | symbol | undefined, index?: number) => {
    ensureAdviceCb(ADVICES_SETTER_AFTER_THROW, target, key, cb);
  };
}

export function BelongsTo(module: AnyConstructor<any>) {
  return applyDecorators(SetMetadata(ADVICES_BELONGS_TO, module));
}
export function EnsureParentImports(...modules: AnyConstructor<any>[]) {
  return applyDecorators(
    UpsertMetadata(ADVICES_ENSURE_PARENT_IMPORTS, modules),
  );
}
