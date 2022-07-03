import { HttpService } from '@nestjs/axios';
import { IConfigServerConfiguration } from './config-server.interfaces';
import { Injectable, Logger } from '@nestjs/common';
import { delay, map, retryWhen, scan } from 'rxjs/operators';
import * as yaml from 'yaml';
import { ConfigServerConnectionErrorException } from '../../exceptions/config-server-connection-error.exception';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConfigServerClient {
  private readonly logger: Logger = new Logger(ConfigServerClient.name);

  constructor(
    private readonly httpClient: HttpService,
    private readonly config: IConfigServerConfiguration,
  ) {}

  async fetchConfiguration(): Promise<any> {
    const enabled = await this.config.isEnabled();
    if (!enabled) {
      return {};
    }

    const url = this.config.getConfigurationUrl();

    const retryAttempts = 4;
    const toRetry = (error) => {
      return !!error.errno;
    };

    try {
      const $res = this.httpClient.get(url, { timeout: 3000 }).pipe(
        map((response) => response.data),
        retryWhen((e) =>
          e.pipe(
            scan((errorCount, error: Error) => {
              if (toRetry && !toRetry(error)) {
                throw error;
              }

              this.logger.error(
                `Unable to connect to the config server. Retrying (${
                  errorCount + 1
                })...`,
                // error.stack,
              );
              if (errorCount + 1 >= retryAttempts) {
                throw error;
              }
              return errorCount + 1;
            }, 0),
            delay(1000),
          ),
        ),
      );
      const res = await firstValueFrom($res);
      return yaml.parse(res);
    } catch (err) {
      throw new ConfigServerConnectionErrorException(
        `Couldn't connect to config server at ${url}`,
        err,
      );
    }
  }
}
