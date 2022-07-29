import { Injectable } from '@nestjs/common';
import { IConfigServerConfiguration } from './config-server.interfaces';
import { IBootstrapConfiguration } from '../../interfaces/configuration.interface';
import { Config } from '../../config.map';

@Injectable()
export class ConfigServerConfiguration implements IConfigServerConfiguration {
  private _profile: string;

  constructor(private readonly config: IBootstrapConfiguration) {}

  getProfile(): string {
    return this.config.get(Config.Profile, null);
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
  getConfigurationUrl(): string[] {
    const profile = this.getProfile();
    const labelString = this.getLabel();
    const appName = this.getAppName();
    const url = this.getUrl();

    const labels = labelString?.split(',') || [];

    if (labels.length > 0) {
      return labels.map((label) => {
        return profile
          ? `${url}/${label}/${appName}-${profile}.json`
          : `${url}/${label}/${appName}.json`;
      });
    }
    if (profile && labels.length == 0) {
      return [`${url}/${appName}-${profile}.json`];
    }

    return [`${url}/${appName}.json`];
  }
}
