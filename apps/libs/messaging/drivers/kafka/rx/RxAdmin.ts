import {
  Admin,
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
 * Reactive kafka admin.
 */
export class RxAdmin {
  public readonly closeEvents$ = new Subject<any>();
  public readonly errorEvents$ = new Subject<any>();

  /**
   * Class constructor
   *
   * @param admin
   * @param connection
   */
  constructor(
    private admin: Admin,
    private readonly connection: RxConnection,
  ) {}

  connect(): Observable<EmptyReply> {
    return from(this.admin.connect()).pipe(
      map(() => new EmptyReply(this.connection)),
    );
  }

  disconnect(): Observable<EmptyReply> {
    return from(this.admin.disconnect()).pipe(
      map(() => new EmptyReply(this.connection)),
      catchError((err, caught) => {
        console.error(`${err.message}`);
        console.error(`${err.stack}`);

        return throwError(err);
      }),
    );
  }
}
