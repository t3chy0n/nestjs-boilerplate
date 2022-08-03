import { MessagingDriver } from '@libs/messaging/consts';
import { IncomingChannelDto } from '@libs/messaging/dto/incomming-channel.dto';
import { OutgoingChannelDto } from '@libs/messaging/dto/outgoing-channel.dto';
import {
  combineLatestAll,
  connect,
  filter,
  merge,
  mergeMap,
  Observable,
  of,
  repeat,
  retry,
  shareReplay,
  Subscription,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { ILogger } from '@libs/logger/logger.interface';
import { catchError } from 'rxjs/operators';
import RxEventEmitterLib from '@libs/messaging/drivers/event-emitter/rx/event-emitter-lib.rx';
import { RxChannel } from '@libs/messaging/drivers/event-emitter/rx/channel.rx';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { Injectable } from '@nestjs/common';

const RETRY_AFTER = 2000;

@Injectable()
export class EventEmitterConnection implements IMessagingConnection {
  public readonly driver: MessagingDriver = MessagingDriver.MEMORY;
  public readonly name: string;

  private incoming: IncomingChannelDto[] = [];
  private outgoing: OutgoingChannelDto[] = [];

  private channel$: Observable<RxChannel>;
  private channelSubscription: Subscription;

  constructor(
    private readonly config: MessagingConfiguration,
    private readonly logger: ILogger,
  ) {
    this.channel$ = RxEventEmitterLib.newConnection().pipe(
      tap(() => this.logger.log('Event Emitter connection created')),
      shareReplay(),
    );
  }

  addIncoming(dto: IncomingChannelDto) {
    this.incoming.push(dto);
  }

  addOutgoing(dto: OutgoingChannelDto) {
    this.outgoing.push(dto);
  }

  handleError() {
    return catchError((err, caught) => {
      this.logger.error(`Caught event emitter error`);
      this.logger.error(`${err}`);
      this.logger.error(`${err.message}`);
      this.logger.error(`${err.stack}`);

      return throwError(err);
    });
  }

  handleOutgoingMessages(
    out$: Observable<RxChannel>,
    outgoing: OutgoingChannelDto,
  ) {
    return out$.pipe(
      switchMap((channel) => {
        return of(outgoing.publicator$.asObservable(), of(channel)).pipe(
          combineLatestAll(),
          switchMap(([buffer, channel]: [any, RxChannel]) => {
            this.logger.log(
              'Publishing to event emitter topic',
              outgoing.event,
            );

            return of(buffer).pipe(
              tap((payload: any) => {
                channel.send(outgoing.event, payload);
              }),
            );
          }),
        );
      }),
    );
  }

  handleIncomingMessages(
    con$: Observable<RxChannel>,
    incoming: IncomingChannelDto,
  ) {
    return con$.pipe(
      mergeMap((channel) => channel.subscribe(incoming.event)),
      filter((message) => message.event === incoming.event),
      tap((rxMessage) => {
        if (!incoming.callback) {
          return;
        }
        incoming.callback(
          new IncomingChannelDto(),
          rxMessage,
          rxMessage.message,
        );
      }),
    );
  }

  initialize() {
    this.channelSubscription = this.channel$
      .pipe(
        /***
         * Map all outgoing channels to handle messages within same shared connection
         */
        connect((shared$) =>
          merge(
            ...this.outgoing.map((outgoing) =>
              this.handleOutgoingMessages(shared$, outgoing),
            ),
            /***
             * Map all incoming channels to handle messages within same shared connection
             */
            ...this.incoming.map((incoming) =>
              this.handleIncomingMessages(shared$, incoming),
            ),
          ),
        ),
        this.handleError(),
        repeat({ delay: RETRY_AFTER }),
        retry({
          delay: RETRY_AFTER,
        }),
      )
      .subscribe({
        next: (message) => this.logger.error(`subs message ${message}`),
        error: (error) => this.logger.error(`subs error ${error}`),
        complete: () => this.logger.error('pubs omplete'),
      });

    this.logger.log('Initialized in memory connection');
  }
}
