import {
  combineLatestAll,
  connect,
  merge,
  mergeMap,
  Observable,
  of,
  throwError,
  repeat,
  retry,
  Subscription,
  switchMap,
  tap,
  delay,
} from 'rxjs';
import {
  AssertExchangeReply,
  RxAmqpLib,
  RxChannel,
} from '@libs/messaging/drivers/rabbitmq/rx';
import { MessagingDriver } from '@libs/messaging/consts';
import { IncomingChannelDto } from '@libs/messaging/dto/incomming-channel.dto';
import { OutgoingChannelDto } from '@libs/messaging/dto/outgoing-channel.dto';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { ILogger } from '@libs/logger/logger.interface';
import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitmqConnection implements IMessagingConnection {
  public readonly driver: MessagingDriver = MessagingDriver.RABBITMQ;
  public readonly name: string;

  private incoming: IncomingChannelDto[] = [];
  private outgoing: OutgoingChannelDto[] = [];

  private connection$: Observable<RxChannel>;
  private subscription: Subscription;

  constructor(
    private readonly configData: any,
    private readonly socketOptions: any,
    private readonly config: MessagingConfiguration,
    private readonly logger: ILogger,
  ) {
    this.connection$ = RxAmqpLib.newConnection(configData, socketOptions).pipe(
      mergeMap((connection) => {
        return connection.createChannel();
      }),
      tap(() => this.logger.log('Rabbitmq connection created.')),
    );

    this.name = configData.name;
  }

  addIncoming(dto: IncomingChannelDto) {
    this.incoming.push(dto);
  }

  addOutgoing(dto: OutgoingChannelDto) {
    this.outgoing.push(dto);
  }

  handleIncomingMessages(
    channel$: Observable<RxChannel>,
    incoming: IncomingChannelDto,
  ) {
    return channel$.pipe(
      mergeMap((channel) =>
        channel.assertExchange(incoming.exchange, incoming.exchangeType),
      ),
      mergeMap((reply) =>
        reply.channel.assertQueue(incoming.queue, {
          durable: incoming.queueDurable,
        }),
      ),

      tap((reply) =>
        incoming.routingKeys.map((routingKey) =>
          reply.channel.bindQueue(
            incoming.queue,
            incoming.exchange,
            routingKey,
          ),
        ),
      ),

      switchMap((reply) =>
        reply.channel.consume(incoming.queue, {
          noAck: true,
        }),
      ),

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

  handleOutgoingMessages(
    channel$: Observable<RxChannel>,
    outgoing: OutgoingChannelDto,
  ) {
    return channel$.pipe(
      mergeMap((channel) =>
        channel.assertExchange(outgoing.exchange, outgoing.exchangeType),
      ),
      switchMap((reply) => {
        return of(outgoing.publicator$.asObservable(), of(reply)).pipe(
          combineLatestAll(),
          switchMap(([buffer, reply]: [any, AssertExchangeReply]) => {
            this.logger.log('Publishing to exchange', outgoing.exchange);

            return of(buffer).pipe(
              mergeMap((value: any) => {
                return of(JSON.stringify(value));
              }),
              mergeMap((payload: string) => {
                const res = reply.channel.publish(
                  outgoing.exchange,
                  outgoing.routingKey,
                  new Buffer(payload),
                );
                return of(res);
              }),
            );
          }),
        );
      }),
    );
  }

  handleError() {
    return catchError((err, caught) => {
      this.logger.error(`${err}`);
      this.logger.error(`${err.message}`);
      this.logger.error(`${err.stack}`);

      return throwError(err);
    });
  }

  initialize() {
    this.subscription = this.connection$
      .pipe(
        connect((shared$) =>
          merge(
            /***
             * Map all incoming channels to handle messages within same shared connection
             */
            ...this.incoming.map((incoming) =>
              this.handleIncomingMessages(shared$, incoming),
            ),

            /***
             * Map all outgoing channels to handle messages within same shared connection
             */
            ...this.outgoing.map((outgoing) =>
              this.handleOutgoingMessages(shared$, outgoing),
            ),
          ),
        ),
        this.handleError(),
        repeat({ delay: 4000 }),
        retry({
          delay: 4000,
        }),
      )
      .subscribe({
        next: (message) => this.logger.error(`subs message ${message}`),
        error: (error) => this.logger.error(`subs error ${error}`),
        complete: () => this.logger.error('complete'),
      });

    this.logger.log('Initialized Rabbitmq connection');
  }
}
