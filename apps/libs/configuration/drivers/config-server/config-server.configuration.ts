import { Injectable } from '@nestjs/common';
import { IConfigServerConfiguration } from './config-server.interfaces';
import { IBootstrapConfiguration } from '../../interfaces/configuration.interface';
import { Config } from '../../config.map';

@Injectable()
export class ConfigServerConfiguration implements IConfigServerConfiguration {
  private _profile: string;

  constructor(private readonly config: IBootstrapConfiguration) {}

  getProfile(): string {
    return process.env.NODE_ENV;
  }

  isEnabled(): boolean {
    return this.config.get<boolean>(Config.ConfigServer.Enabled, null);
  }

  getUrl(): string {
    return this.config.get(Config.ConfigServer.Url, null);
  }

  getLabel(): string {
    return this.config.get(Config.ConfigServer.Label, null);
  }

  getAppName(): string {
    return this.config.get(Config.ConfigServer.AppName, null);
  }

  /***
   * Composes url to config server accoding to spring cloud config server documentatnion
   * @examples
   *  - /label/application-profile.yaml
   *  - /application-profile.yaml
   *  - /application.yaml
   */
  getConfigurationUrl(): string {
    const profile = this.getProfile();
    const label = this.getLabel();
    const appName = this.getAppName();
    const url = this.getUrl();

    if (profile && label) {
      return `${url}/${label}/${appName}-${profile}.yaml`;
    }
    if (profile && !label) {
      return `${url}/${appName}-${profile}.yaml`;
    }

    return `${url}/${appName}.yaml`;
  }
}
