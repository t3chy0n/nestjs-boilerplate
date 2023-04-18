import { AbstractMessageDto } from '@libs/messaging/dto/abstract-message.dto';
import { DiscoveredMethodWithMeta } from '@golevelup/nestjs-discovery/lib/discovery.interfaces';
import { Subject } from 'rxjs';
import { NonInjectable } from '@libs/discovery';
import { Traced } from '@libs/telemetry/decorators/traced.decorator';

enum ChannelDirection {
  IN = 'in',
  OUT = 'out',
}

@NonInjectable()
@Traced
export class ChannelConfigurationDto {
  public routingKeys: string[] = [];
  public topic: string;
  public event: string;
  public queue: string;
  public exchange: string;
  public exchangeType: string;
  public routingKey: string;
  public queueDurable = false;
  public acknowledgements = true;
  public direction: ChannelDirection;

  public callback = (...args: any[]) => {};

  public publicator$: Subject<any> = new Subject<any>();

  constructor(params: Partial<ChannelConfigurationDto> = {}) {
    const mapped = this.toDto(params);
    Object.assign(this, mapped);
  }

  toDto(config: any) {
    return {
      queue: config.queue?.name,
      exchange: config.exchange?.name,
      exchangeType: config.exchange?.type,
      routingKeys: config.routingKeys ?? [],
      routingKey: config.routingKey,
      topic: config.topic,
      event: config.event,
      queueDurable: config.queueDurable,
      acknowledgements: config.acknowledgements,
    };
  }
}
