import { HttpService } from '@nestjs/axios';
import { IConfigServerConfiguration } from './config-server.interfaces';
import { Injectable, Logger } from '@nestjs/common';
import { combineLatestAll, delay, map, retryWhen, scan } from 'rxjs/operators';
import { ConfigServerConnectionErrorException } from '../../exceptions/config-server-connection-error.exception';
import { combineLatest, firstValueFrom, lastValueFrom, of } from 'rxjs';
import * as _ from 'lodash';
import * as yaml from 'yaml';

@Injectable()
export class ConfigServerClient {
  private readonly logger: Logger = new Logger(ConfigServerClient.name);

  constructor(
    private readonly httpClient: HttpService,
    private readonly config: IConfigServerConfiguration,
  ) {}

  retry() {
    const retryAttempts = 4;
    const toRetry = (error) => {
      return !!error.errno;
    };

    return retryWhen((e) =>
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
    );
  }
  async fetchConfiguration(): Promise<any> {
    const enabled = await this.config.isEnabled();
    if (!enabled) {
      return {};
    }

    const urls = this.config.getConfigurationUrl();

    try {
      const res$ = of(
        ...urls.map((url) =>
          this.httpClient.get(url, { timeout: 3000 }).pipe(
            map((response) => yaml.parse(response.data)),
            this.retry(),
          ),
        ),
      ).pipe(
        combineLatestAll(),
        map((configResponses) => {
          return _.merge({}, ...configResponses);
        }),
      );
      return await lastValueFrom(res$);
    } catch (err) {
      throw new ConfigServerConnectionErrorException(
        `Couldn't connect to config server...`,
        err,
      );
    }
  }
}
