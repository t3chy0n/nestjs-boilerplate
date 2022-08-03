import { Observable, Subject, Observer, from } from 'rxjs';
import { Consumer, ConsumerSubscribeTopics } from 'kafkajs';
import RxMessage from '@libs/messaging/drivers/kafka/rx/message.rx';
import RxConnection from '@libs/messaging/drivers/kafka/rx/connection.rx';
import { catchError, map } from 'rxjs/operators';
import { EmptyReply } from '@libs/messaging/drivers/kafka/rx/reply/EmptyReply';

/**
 * Reactive kafka consumer
 */
export class RxConsumer {
  public readonly closeEvents$ = new Subject<any>();
  public readonly errorEvents$ = new Subject<any>();

  /**
   * Class constructor
   *
   * @param consumer
   * @param connection
   */
  constructor(
    private consumer: Consumer,
    private readonly connection: RxConnection,
  ) {
    consumer.on('consumer.crash', (event) => this.errorEvents$.next(event));
    consumer.on('consumer.stop', (event) => this.closeEvents$.next(event));
    consumer.on('consumer.disconnect', (event) =>
      this.closeEvents$.next(event),
    );
  }

  connect(): Observable<EmptyReply> {
    return from(this.consumer.connect()).pipe(
      map(() => new EmptyReply(this.connection)),
    );
  }

  disconnect(): Observable<EmptyReply> {
    return from(this.consumer.disconnect()).pipe(
      map(() => new EmptyReply(this.connection)),
    );
  }

  subscribe(subscription: ConsumerSubscribeTopics): Observable<RxConnection> {
    return from(this.consumer.subscribe(subscription)).pipe(
      map(() => this.connection),
    );
  }

  consume(): Observable<RxMessage> {
    return new Observable((observer: Observer<any>) => {
      const closeSub = this.closeEvents$.subscribe((ev) => observer.complete());

      this.consumer.run({
        eachMessage: async (entry) => {
          const { topic, partition, message } = entry;
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
          console.log(`- ${prefix} ${message.key}#${message.value}`);
          observer.next(new RxMessage(entry, this));
        },
      });

      return async () => {
        closeSub.unsubscribe();
        try {
          await this.consumer.disconnect();
        } catch (e) {
          // TODO:
          console.error('Caught channel cancel error', e);
        } // This prevents a race condition
      };
    });
  }
}

export default RxConsumer;
