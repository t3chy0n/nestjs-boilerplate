import { IConfiguration } from './configuration.interface';

export abstract class IBootstrapConfigurationFactory {
  abstract create(): Promise<IConfiguration>;
}
