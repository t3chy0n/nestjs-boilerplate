import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { getDecoratorCallerPath } from '@libs/discovery/utils';
import { AllModules } from '@libs/discovery/registry';


export function Module(metadata: ModuleMetadata) {
  return (target: object) => {
    const path = getDecoratorCallerPath();
    AllModules[path] = target;
    for (const property in metadata) {
      if (metadata.hasOwnProperty(property)) {
        Reflect.defineMetadata(property, (metadata as any)[property], target);
      }
    }
  };
}
