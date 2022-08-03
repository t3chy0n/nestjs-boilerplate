import {
  Observable,
  defer,
  mergeMap,
  of,
  throwError,
  merge,
  using,
  Subscription,
  tap,
} from 'rxjs';
import { RxChannel } from '@libs/messaging/drivers/event-emitter/rx/channel.rx';

/**
 * Factory for RxEventEmitterLib.
 */
export class RxEventEmitterLib {
  /**
   * Create a new instance of RxChannel, which wraps the event-emitter obj.
   *
   */
  public static newConnection(): Observable<RxChannel> {
    const $res = defer(() =>
      of(
        new RxChannel({
          wildcard: true,
          newListener: true,
          removeListener: true,
          maxListeners: 15,
          verboseMemoryLeak: true,
        }),
      ),
    );

    return $res.pipe(
      mergeMap((channel: RxChannel) => {
        // New RxConnection stream
        const sourceConnection = of(channel);

        const connectionDisposer = new Subscription(async () => {
          console.log('disposing event emitter connection');
        });

        // Stream of Errors from error connection event
        const errorEvents = channel.error().pipe(
          tap((err) => console.log('Error', err)),

          mergeMap((error: any) => throwError(error)),
        );

        // Stream of open connections, that will emit RxConnection until a close event
        const connection$ = merge(sourceConnection, errorEvents).pipe(
          tap((e) => console.log('Connection event', e)),
        );

        // Return the disposable connection resource
        return using(
          () => connectionDisposer,
          () => connection$,
        );
      }),
    );
  }
}

export default RxEventEmitterLib;
