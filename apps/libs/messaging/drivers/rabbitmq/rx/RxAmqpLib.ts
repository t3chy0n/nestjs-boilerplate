import * as AmqpLib from 'amqplib';
import { Connection } from 'amqplib';
import {
  Observable,
  defer,
  mergeMap,
  fromEvent,
  of,
  throwError,
  merge,
  takeUntil,
  using,
  Subscription,
  from,
} from 'rxjs';
import RxConnection from './RxConnection';
import { Injectable } from '@libs/discovery';
import { ILazyLoaderService } from '@libs/lazy-loader/lazy-loader-service.interface';

/**
 * Factory for RxAmqpLib.
 */
@Injectable()
export class RxAmqpLib {
  constructor(private readonly lazy: ILazyLoaderService) {}
  /**
   * Create a new instance of RxConnection, which wraps the amqplib Connection obj.
   *
   * @param url URL to AMQP host. eg: amqp://localhost/
   * @param options Custom AMQP options
   * @returns {RxConnection}
   */
  public newConnection(
    options: any,
    socketOptions?: any,
  ): Observable<RxConnection> {
    // Doing it like this to make it a cold observable. When starting with the promise directly, the node application
    // stays open as AmqpLib connects straight away, and not when you subscribe to the stream.

    const $res = defer(() => AmqpLib.connect(options, socketOptions));

    return $res.pipe(
      mergeMap((conn: Connection) => {
        const connectionDisposer = new Subscription(async () => {
          console.log('dispose');
          try {
            await conn.close();
          } catch (error: any) {
            console.log('already closed');
          }
        });
        // New RxConnection stream

        const sourceConnection = of(
          this.lazy.resolveBean(RxConnection, conn),
        );
        // Stream of close events from connection
        const closeEvents = fromEvent(conn, 'close').pipe(
          mergeMap((error: any) => throwError(error)),
        );

        // Stream of Errors from error connection event
        const errorEvents = fromEvent(conn, 'error').pipe(
          mergeMap((error: any) => throwError(error)),
        );

        // Stream of open connections, that will emit RxConnection until a close event
        const connection = merge(sourceConnection, errorEvents).pipe(
          takeUntil(closeEvents),
        );

        // Return the disposable connection resource
        return using(
          () => connectionDisposer,
          () => connection,
        );
      }),
    );
  }
}

export default RxAmqpLib;
