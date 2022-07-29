export abstract class IConfigServerClient {
  abstract fetchConfiguration(): Promise<any>;
}

export abstract class IConfigServerConfiguration {
  abstract getProfile(): string;

  abstract isEnabled(): boolean;

  abstract getUrl(): string;

  abstract getLabel(): string;

  abstract getAppName(): string;

  abstract getConfigurationUrl(): string[];
}
