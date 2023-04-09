import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';

export function UpsertMetadata<K = string, V = any[]>(
  metadataKey: K,
  metadataValue: V[],
): CustomDecorator<K> {
  const decoratorFactory = (target: object, key?: any, descriptor?: any) => {
    let values = Reflect.getMetadata(metadataKey, target) ?? [];
    values = [...values, ...metadataValue];

    if (descriptor) {
      Reflect.defineMetadata(metadataKey, values, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(metadataKey, values, target);
    return target;
  };
  decoratorFactory.KEY = metadataKey;
  return decoratorFactory;
}
