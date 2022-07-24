import { Channel, ConfirmChannel, Connection, Options } from 'amqplib';
import { Observable, from, map } from 'rxjs';
import RxChannel from './RxChannel';
// import RxConfirmChannel from './RxConfirmChannel';

/**
 * Connection to AMQP server.
 */
export class RxConnection {
  /**
   * Class constructor
   *
   * @param connection
   */
  constructor(private connection: Connection) {}

  /**
   * Opens a channel. May fail if there are no more channels available.
   *
   * @returns {any}
   */
  public createChannel(): Observable<RxChannel> {
    return from(this.connection.createChannel()).pipe(
      map((channel: Channel) => new RxChannel(channel)),
    );
  }

  // public createConfirmChannel(): Observable<RxConfirmChannel> {
  //   return from(this.connection.createConfirmChannel()).pipe(
  //     map((channel: ConfirmChannel) => new RxConfirmChannel(channel)),
  //   );
  // }

  /**
   * Close the connection cleanly. Will immediately invalidate any unresolved operations, so it's best to make sure
   * you've done everything you need to before calling this. Will be resolved once the connection, and underlying
   * socket, are closed.
   *
   * @returns Rx.Observable<void>
   */
  public close(): Observable<any> {
    return from(this.connection.close());
  }
}

export default RxConnection;
