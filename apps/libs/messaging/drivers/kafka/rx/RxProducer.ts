import {
  Producer,
  ProducerBatch,
  ProducerRecord,
  RecordMetadata,
} from 'kafkajs';
import { from, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import RxConnection from '@libs/messaging/drivers/kafka/rx/RxConnection';
import { EmptyReply } from '@libs/messaging/drivers/kafka/rx/reply/EmptyReply';
// import RxConfirmChannel from './RxConfirmChannel';

/**
 * Reactive kafka producer.
 */
export class RxProducer {
  public readonly closeEvents$ = new Subject<any>();
  public readonly errorEvents$ = new Subject<any>();

  /**
   * Class constructor
   *
   * @param producer
   * @param connection
   */
  constructor(
    private producer: Producer,
    private readonly connection: RxConnection,
  ) {
    producer.on('producer.network.request_timeout', (event) =>
      this.errorEvents$.next(event),
    );
    producer.on('producer.disconnect', (event) =>
      this.closeEvents$.next(event),
    );
  }

  connect(): Observable<EmptyReply> {
    return from(this.producer.connect()).pipe(
      map(() => new EmptyReply(this.connection)),
    );
  }

  disconnect(): Observable<EmptyReply> {
    return from(this.producer.disconnect()).pipe(
      map(() => new EmptyReply(this.connection)),
      catchError((err, caught) => {
        console.error(`${err.message}`);
        console.error(`${err.stack}`);

        return throwError(err);
      }),
    );
  }

  send(record: ProducerRecord): Observable<RecordMetadata[]> {
    return from(this.producer.send(record));
  }

  sendBatch(batch: ProducerBatch): Observable<RecordMetadata[]> {
    return from(this.producer.sendBatch(batch));
  }
}

export default RxProducer;
