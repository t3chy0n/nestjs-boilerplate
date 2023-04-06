import { Module, MetadataScanner } from '@nestjs/common';

@Module({})
export class DiscoveryModule {
  constructor(private readonly metadataScanner: MetadataScanner) {
    this.discover();
  }

  private discover() {
    const target = {
      /* your target object here */
    };
    const instance = new target.constructor();

    this.metadataScanner.scanFromPrototype(instance, target, (name) => {
      const method = target[name];
      const isMethodDecorated = Reflect.hasMetadata(
        'myCustomDecorator',
        method,
      );
      const isClassDecorated = Reflect.hasMetadata(
        'myCustomDecorator',
        instance.constructor,
      );

      if (isMethodDecorated) {
        console.log(`Method ${name} is decorated`);
      }

      if (isClassDecorated) {
        console.log(`Class ${instance.constructor.name} is decorated`);
      }
    });
  }
}
