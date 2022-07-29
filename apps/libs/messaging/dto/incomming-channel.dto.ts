import { AbstractMessageDto } from '@libs/messaging/dto/abstract-message.dto';
import { DiscoveredMethodWithMeta } from '@golevelup/nestjs-discovery/lib/discovery.interfaces';

export class IncomingChannelDto {
  public routingKeys: string[] = [];
  public topic: string;
  public event: string;
  public queue: string;
  public exchange: string;
  public exchangeType: string;
  public routingKey: string;
  public queueDurable = false;
  public acknowledgements = true;
  public callback = (...args: any[]) => {};

  constructor(params: Partial<IncomingChannelDto> = {}) {
    Object.assign(this, params);
  }

  static toDto(discoveredMethod: DiscoveredMethodWithMeta<any>, config: any) {
    const { meta } = discoveredMethod;

    return new IncomingChannelDto({
      queue: config.queue?.name,
      exchange: config.exchange?.name,
      exchangeType: config.exchange?.type,
      routingKeys: config.routingKeys ?? [],
      routingKey: config.routingKey,
      topic: config.topic,
      event: config.event,
      queueDurable: config.queueDurable,
      acknowledgements: config.acknowledgements,
    });
  }
}
