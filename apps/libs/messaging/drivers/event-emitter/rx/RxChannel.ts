import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent, mergeMap, Observable } from 'rxjs';
import RxMessage from '@libs/messaging/drivers/event-emitter/rx/RxMessage';
import { map } from 'rxjs/operators';

export class RxChannel {
  private readonly emitter: EventEmitter2;

  private readonly error$: Observable<any>;

  constructor(options: any) {
    this.emitter = new EventEmitter2(options);
    this.error$ = fromEvent(this.emitter, 'error');
  }

  subscribe(event: string): Observable<RxMessage> {
    return fromEvent(this.emitter, event).pipe(
      map((message) => new RxMessage(message, event)),
    );
  }

  send(event: string, payload: any): void {
    this.emitter.emit(event, payload);
  }

  error(): Observable<any> {
    return this.error$;
  }
}
