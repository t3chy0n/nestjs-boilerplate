export abstract class IConfiguration {
  abstract get<T>(key: string, defaultValue?: T): T;

  abstract load(): Promise<void>;

  abstract getProfile(): string;
}

export abstract class IBootstrapConfiguration extends IConfiguration {}
