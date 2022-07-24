import { Injectable } from '@nestjs/common';
import { MessagingConfig, MessagingDriver } from '@libs/messaging/consts';
import { IConfiguration } from '@libs/configuration/interfaces/configuration.interface';
import { Options } from 'amqplib';

@Injectable()
export class MessagingConfiguration {
  constructor(private config: IConfiguration) {}
  getDriversConfigurations<T>() {
    return this.config.get<T>(`${MessagingConfig.CONNECTIONS}`);
  }
  getConnectionsConfigurations<T>(driver: MessagingDriver) {
    return this.config.get<T>(`${MessagingConfig.CONNECTIONS}.${driver}`);
  }
  getOutgoingEventConfiguration(event: string) {
    return this.config.get(`${MessagingConfig.OUTGOING}.${event}`);
  }
  getIncomingEventConfiguration(event: string) {
    return this.config.get(`${MessagingConfig.INCOMING}.${event}`);
  }
}
