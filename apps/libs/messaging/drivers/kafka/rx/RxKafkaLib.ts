import {
  Observable,
  defer,
  mergeMap,
  of,
  throwError,
  merge,
  takeUntil,
  using,
  Subscription,
  tap,
} from 'rxjs';
import RxConnection from './RxConnection';
import { ConsumerConfig, Kafka, KafkaConfig, ProducerConfig } from 'kafkajs';

/**
 * Factory for RxKafkaLib.
 */
export class RxKafkaLib {
  /**
   * Create a new instance of RxConnection, which wraps the amqplib Connection obj.
   *
   * @returns {RxConnection}
   * @param kafkaConfig
   * @param consumerConfig
   * @param produerConfig
   */
  public static newConnection(
    kafkaConfig: KafkaConfig,
    consumerConfig: ConsumerConfig,
    produerConfig: ProducerConfig,
  ): Observable<RxConnection> {
    const $res = defer(() => of(new Kafka(kafkaConfig)));

    return $res.pipe(
      mergeMap((kafka: Kafka) => {
        const connection = new RxConnection(
          kafka,
          consumerConfig,
          produerConfig,
        );

        const { consumer, producer } = connection;

        // New RxConnection stream
        const sourceConnection = of(connection);

        const connectionDisposer = new Subscription(async () => {
          console.log('disposing kafka connection');
          try {
            await consumer.disconnect();
            await producer.disconnect();
          } catch (error: any) {
            console.log('already closed');
          }
        });

        const closeEvents$ = merge(
          consumer.closeEvents$,
          producer.closeEvents$,
        );
        const errorEvents$ = merge(
          producer.errorEvents$,
          producer.errorEvents$,
        );

        // Stream of close events from connection
        const closeEvents = closeEvents$.pipe(
          tap((err) => console.log('Closing', err)),

          mergeMap((error: any) => throwError(error)),
        );

        // Stream of Errors from error connection event
        const errorEvents = errorEvents$.pipe(
          tap((err) => console.log('Error', err)),

          mergeMap((error: any) => throwError(error)),
        );

        // Stream of open connections, that will emit RxConnection until a close event
        const connection$ = merge(sourceConnection, errorEvents).pipe(
          tap((e) => console.log('Connection ev', e)),
          takeUntil(closeEvents),
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

export default RxKafkaLib;
