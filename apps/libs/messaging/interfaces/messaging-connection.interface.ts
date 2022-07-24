import { IncomingChannelDto } from '@libs/messaging/dto/incomming-channel.dto';
import { OutgoingChannelDto } from '@libs/messaging/dto/outgoing-channel.dto';

export abstract class IMessagingConnection {
  public readonly name: string;
  public readonly driver: string;

  abstract initialize();
  abstract addIncoming(dto: IncomingChannelDto);

  abstract addOutgoing(dto: OutgoingChannelDto);
}
