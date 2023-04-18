import { ConsoleLogger, Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { ILogger } from './logger.interface';
import { LogLevel } from '@nestjs/common/services/logger.service';
import { IConfiguration } from '../configuration/interfaces/configuration.interface';
import { Config } from '../configuration/config.map';
import safeStringify from 'fast-safe-stringify';

enum Severity {
  LOG = 'log',
  ERROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@Injectable()
export class LoggerService implements ILogger {
  severities: string[];
  private source: string;
  constructor(
    @Inject(INQUIRER) source: string | object,
    @Inject('LOGGER_DRIVERS') private readonly drivers: ILogger[],
    private readonly config: IConfiguration,
  ) {
    this.source =
      typeof source === 'string' ? source : source?.constructor?.name ?? "Logger";
    const defaultSeverities = Object.values(Severity);
    this.severities = this.config.get<Severity[]>(
      Config.Logger.Severities,
      defaultSeverities,
    );
    //Sets context for each driver, it will display class name, for corresponding log messages
    drivers.forEach((driver: ConsoleLogger) => driver?.setContext(this.source));
  }

  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]): any {
    if (!this.severities.includes(Severity.LOG)) {
      return;
    }
    this.drivers.forEach((d: ConsoleLogger) =>
      d.log(message, ...this.stringify(optionalParams), this.source ),
    );
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]): any {
    if (!this.severities.includes(Severity.ERROR)) {
      return;
    }
    this.drivers.forEach((d: ILogger) =>
      d.error(message, ...this.stringify(optionalParams), this.source),
    );
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]): any {
    if (!this.severities.includes(Severity.WARN)) {
      return;
    }
    this.drivers.forEach((d: ILogger) =>
      d.warn(message, ...this.stringify(optionalParams), this.source),
    );
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]): any {
    if (!this.severities.includes(Severity.DEBUG)) {
      return;
    }
    this.drivers.forEach((d: ILogger) =>
      d?.debug(message, ...this.stringify(optionalParams), this.source),
    );
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]): any {
    if (!this.severities.includes(Severity.VERBOSE)) {
      return;
    }
    this.drivers.forEach((d: ILogger) =>
      d?.verbose(message, ...this.stringify(optionalParams), this.source),
    );
  }

  /**
   * Set log levels.
   * @param levels log levels
   */
  setLogLevels?(levels: LogLevel[]): any {
    this.drivers.forEach((d: ILogger) => d?.setLogLevels(levels));
  }

  private stringify(params: any[]) {
    return params.map((p) => (typeof p === 'object' ? safeStringify(p) : p));
  }
}
