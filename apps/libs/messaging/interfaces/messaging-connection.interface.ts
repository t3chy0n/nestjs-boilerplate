import { ChannelConfigurationDto } from '@libs/messaging/dto/channel-configuration.dto';
import { OutgoingChannelDto } from '@libs/messaging/dto/outgoing-channel.dto';

export abstract class IMessagingConnection {
  public readonly name: string;
  public readonly driver: string;

  abstract initialize();
  abstract addIncoming(dto: ChannelConfigurationDto);

  abstract addOutgoing(dto: OutgoingChannelDto);
}
