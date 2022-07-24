import { IMessagingConnection } from '@libs/messaging/interfaces/messaging-connection.interface';
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
import RxConnection from '@libs/messaging/drivers/kafka/rx/RxConnection';
import { MessagingConfiguration } from '@libs/messaging/messaging.configuration';
import { ILogger } from '@libs/logger/logger.interface';
import RxKafkaLib from '@libs/messaging/drivers/kafka/rx/RxKafkaLib';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';

const RETRY_AFTER = 20000;

@Injectable()
export class KafkaConnection implements IMessagingConnection {
  public readonly driver: MessagingDriver = MessagingDriver.KAFKA;
  public readonly name: string;

  private incoming: IncomingChannelDto[] = [];
  private outgoing: OutgoingChannelDto[] = [];

  private connection$: Observable<RxConnection>;
  private consumerSubscription: Subscription;
  private publisherSubscription: Subscription;

  constructor(
    private readonly configData: any,
    private readonly config: MessagingConfiguration,
    private readonly logger: ILogger,
  ) {
    this.connection$ = RxKafkaLib.newConnection(
      configData,
      configData.consumer,
      configData.producer,
    ).pipe(
      mergeMap((connection) => connection.producer.connect()),
      mergeMap((reply) => reply.connection.consumer.connect()),
      mergeMap((reply) => of(reply.connection)),
      tap(() => this.logger.log('Kafka connection created')),
      shareReplay(),
    );

    this.name = configData.name;
  }

  addIncoming(dto: IncomingChannelDto) {
    this.incoming.push(dto);
  }

  addOutgoing(dto: OutgoingChannelDto) {
    this.outgoing.push(dto);
  }

  initialize() {
    this.publisherSubscription = this.connection$
      .pipe(
        /***
         * Map all outgoing channels to handle messages within same shared connection
         */
        connect((shared$) =>
          merge(
            ...this.outgoing.map((outgoing) => {
              return shared$.pipe(
                switchMap((connetion) => {
                  return of(
                    outgoing.publicator$.asObservable(),
                    of(connetion),
                  ).pipe(
                    combineLatestAll(),
                    switchMap(([buffer, { producer }]: [any, RxConnection]) => {
                      this.logger.log(
                        'Publishing to kafka topic',
                        outgoing.topic,
                      );

                      return of(buffer).pipe(
                        mergeMap((value: any) => {
                          return of(JSON.stringify(value));
                        }),
                        mergeMap((payload: string) => {
                          // acks?: number
                          // timeout?: number
                          // compression?: CompressionTypes
                          const res = producer.send({
                            topic: outgoing.topic,
                            messages: [{ value: payload }],
                          });

                          return of(res);
                        }),
                      );
                    }),
                  );
                }),
              );
            }),
          ),
        ),
        catchError((err, caught) => {
          this.logger.error(`Caught kafka error ${err.message}`);
          this.logger.error(`${err.stack}`);

          return throwError(err);
        }),
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

    this.consumerSubscription = this.connection$
      .pipe(
        mergeMap(({ consumer }) => {
          const topics = this.incoming.map((incoming) => incoming.topic);
          return consumer.subscribe({ topics, fromBeginning: false });
        }),
        switchMap((connection) => connection.consumer.consume()),

        connect((shared$) =>
          merge(
            /***
             * Map all incoming channels to handle messages within same shared connection
             */
            ...this.incoming.map((incoming) =>
              shared$.pipe(
                filter((message) => message.topic === incoming.topic),
                tap((message) => {
                  if (!incoming.callback) {
                    return;
                  }
                  incoming.callback(new IncomingChannelDto(), {
                    content: message.message.value.toString(),
                  });
                }),
              ),
            ),
          ),
        ),

        catchError((err, caught) => {
          this.logger.error(`Caught kafka consumer error: ${err.message}`);
          this.logger.error(`${err.stack}`);

          return throwError(err);
        }),
        repeat({ delay: RETRY_AFTER }),
        retry({
          delay: RETRY_AFTER,
        }),
      )
      .subscribe({
        next: (message) => this.logger.error(`subs message ${message}`),
        error: (error) => this.logger.error(`pubc subs error ${error}`),
        complete: () => this.logger.error('pubs complete'),
      });

    this.logger.log('Initialized Kafka connection');
  }
}
