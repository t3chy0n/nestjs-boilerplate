import { IConfiguration } from './configuration.interface';

export abstract class IConfigurationFactory {
  abstract create(): Promise<IConfiguration>;
}
