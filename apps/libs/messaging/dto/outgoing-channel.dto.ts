import { Subject } from 'rxjs';
import { DiscoveredMethodWithMeta } from '@golevelup/nestjs-discovery/lib/discovery.interfaces';

export class OutgoingChannelDto {
  public publicator$: Subject<any> = new Subject<any>();
  public topic: string;
  public event: string;
  public exchange: string;
  public exchangeType = 'topic';
  public routingKey: string;

  constructor(params: Partial<OutgoingChannelDto> = {}) {
    Object.assign(this, params);
  }

  static toDto(discoveredMethod: DiscoveredMethodWithMeta<any>, config: any) {
    const { meta } = discoveredMethod;

    return new OutgoingChannelDto({
      topic: config.topic,
      event: config.event,
      exchange: config.exchange,
      routingKey: config.routingKey,
    });
  }
}
