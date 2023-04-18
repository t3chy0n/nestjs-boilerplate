import { Channel, Options, Replies } from 'amqplib';
import { Message } from 'amqplib/properties';
import {
  from,
  map,
  Observable,
  Observer,
  filter,
  fromEvent,
  Subject,
  mergeMap,
} from 'rxjs';
import AssertExchangeReply from './reply/AssertExchangeReply';
import AssertQueueReply from './reply/AssertQueueReply';
import DeleteQueueReply from './reply/DeleteQueueReply';
import EmptyReply from './reply/EmptyReply';
import PurgeQueueReply from './reply/PurgeQueueReply';
import RxMessage from './RxMessage';
import { NonInjectable } from '@libs/discovery';
import { Traced } from '@libs/telemetry/decorators/traced.decorator';

/**
 * AMQP Rx Channel
 */

@NonInjectable()
@Traced
export class RxChannel {
  /**
   * Class constructor.
   *
   * @param channel
   */
  constructor(private channel: Channel) {}

  /**
   * Close a channel.
   *
   * @returns Observable<any>
   */
  public close(): Observable<any> {
    return from(this.channel.close());
  }

  /**
   * Assert a queue into existence.
   *
   * This operation is idempotent given identical arguments; however, it will bork the channel if the queue already
   * exists but has different properties.
   *
   * @param queue
   * @param options
   * @returns Observable<AssertQueueReply>
   */
  public assertQueue(
    queue: string,
    options: Options.AssertQueue,
  ): Observable<AssertQueueReply> {
    return from(this.channel.assertQueue(queue, options)).pipe(
      map((reply) => new AssertQueueReply(this, reply)),
    );
  }

  /**
   * Check whether a queue exists. This will bork the channel if the named queue doesn't exist; if it does exist,
   * you go through to the next round!
   *
   * @param queue
   * @returns Observable<AssertQueueReply>
   */
  public checkQueue(queue: string): Observable<AssertQueueReply> {
    return from(this.channel.checkQueue(queue)).pipe(
      map((reply) => new AssertQueueReply(this, reply)),
    );
  }

  /**
   * Delete the queue named. Naming a queue that doesn't exist will result in the server closing the channel, to teach
   * you a lesson (except in RabbitMQ version 3.2.0 and after1). The options here are:
   *
   * - `ifUnused` (boolean): if true and the queue has consumers, it will not be deleted and the channel will be
   *    closed. Defaults to false.
   * - `ifEmpty` (boolean): if true and the queue contains messages, the queue will not be deleted and the channel
   *    will be closed. Defaults to false.
   *
   * @param queue
   * @param options
   * @returns Observable<DeleteQueueReply>
   */
  public deleteQueue(
    queue: string,
    options?: Options.DeleteQueue,
  ): Observable<DeleteQueueReply> {
    return from(this.channel.deleteQueue(queue, options)).pipe(
      map((reply) => new DeleteQueueReply(this, reply)),
    );
  }

  /**
   * Remove all undelivered messages from the queue named. Note that this won't remove messages that have been
   * delivered but not yet acknowledged; they will remain, and may be requeued under some circumstances (e.g., if the
   * channel to which they were delivered closes without acknowledging them).
   *
   * @param queue
   * @returns Observable<PurgeQueueReply>
   */
  public purgeQueue(queue: string): Observable<PurgeQueueReply> {
    return from(this.channel.purgeQueue(queue)).pipe(
      map((reply) => new PurgeQueueReply(this, reply)),
    );
  }

  /**
   * Assert a routing path from an exchange to a queue. The exchanged named by `source` will relay messages to the
   * `queue` name, according to the type of the exchange and the `pattern` given.
   *
   * @param queue
   * @param source
   * @param pattern
   * @param args
   * @returns Observable<EmptyReply>
   */
  public bindQueue(
    queue: string,
    source: string,
    pattern: string,
    args?: any,
  ): Observable<EmptyReply> {
    return from(this.channel.bindQueue(queue, source, pattern, args)).pipe(
      map(() => new EmptyReply(this)),
    );
  }

  /**
   * Remove a routing path between the queue named and the exchange named as source with the pattern and arguments
   * given. Omitting args is equivalent to supplying an empty object (no arguments). Beware: attempting to unbind
   * when there is no such binding may result in a punitive error.
   *
   * @param queue
   * @param source
   * @param pattern
   * @param args
   * @returns Observable<EmptyRole>
   */
  public unbindQueue(
    queue: string,
    source: string,
    pattern: string,
    args?: any,
  ): Observable<EmptyReply> {
    return from(this.channel.unbindQueue(queue, source, pattern, args)).pipe(
      map(() => new EmptyReply(this)),
    );
  }

  /**
   * Assert an exchange into existence.
   *
   * @param exchange
   * @param type
   * @param options
   * @returns {Observable<AssertExchangeReply>}
   */
  public assertExchange(
    exchange: string,
    type: string,
    options?: Options.AssertExchange,
  ): Observable<AssertExchangeReply> {
    return from(this.channel.assertExchange(exchange, type, options)).pipe(
      map((reply) => new AssertExchangeReply(this, reply)),
    );
  }

  /**
   * Check that an exchange exists. If it doesn't exist, the channel will be closed with an error. If it does exist,
   * happy days.
   *
   * @param exchange
   * @returns Observable<EmptyReply>
   */
  public checkExchange(exchange: string): Observable<EmptyReply> {
    return from(this.channel.checkExchange(exchange)).pipe(
      map((reply) => new EmptyReply(this)),
    );
  }

  /**
   * Delete an exchange. The only meaningful field in options is:
   *
   * - `ifUnused` (boolean): if true and the exchange has bindings, it will not be deleted and the channel will be
   *    closed.
   *
   * If the exchange does not exist, a channel error is raised (RabbitMQ version 3.2.0 and after will not raise an
   * error).
   *
   * @param exchange
   * @param options
   * @returns Observable<EmptyReply>
   */
  public deleteExchange(
    exchange: string,
    options?: Options.DeleteExchange,
  ): Observable<EmptyReply> {
    return from(this.channel.deleteExchange(exchange, options)).pipe(
      map((reply) => new EmptyReply(this)),
    );
  }

  /**
   * Bind an exchange to another exchange. The exchange named by destination will receive messages from the exchange
   * named by source, according to the type of the source and the pattern given. For example, a direct exchange will
   * relay messages that have a routing key equal to the pattern.
   *
   * @param destination
   * @param source
   * @param pattern
   * @param args
   * @returns Observable<EmptyReply>
   */
  public bindExchange(
    destination: string,
    source: string,
    pattern: string,
    args?: any,
  ): Observable<EmptyReply> {
    return from(
      this.channel.bindExchange(destination, source, pattern, args),
    ).pipe(map((reply) => new EmptyReply(this)));
  }

  /**
   * Remove a binding from an exchange to another exchange. A binding with the exact source exchange, destination
   * exchange, routing key pattern, and extension args will be removed. If no such binding exists, it's – you guessed
   * it – a channel error
   *
   * @param destination
   * @param source
   * @param pattern
   * @param args
   * @returns Observable<EmtpyReply>
   */
  public unbindExchange(
    destination: string,
    source: string,
    pattern: string,
    args?: any,
  ): Observable<EmptyReply> {
    return from(
      this.channel.unbindExchange(destination, source, pattern, args),
    ).pipe(map((reply) => new EmptyReply(this)));
  }

  /**
   * Publish a single message to an exchange.
   *
   * @param exchange
   * @param routingKey
   * @param content
   * @param options
   * @returns boolean
   */
  public publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options?: Options.Publish,
  ): boolean {
    return this.channel.publish(exchange, routingKey, content, options);
  }

  /**
   * Send a single message with the content given as a buffer to the specific queue named, bypassing routing.
   *
   * @param queue
   * @param message
   * @param options
   * @returns boolean
   */
  public sendToQueue(
    queue: string,
    message: Buffer,
    options?: Options.Publish,
  ): boolean {
    return this.channel.sendToQueue(queue, message, options);
  }

  /**
   * Set up a consumer where each message will emit an observable of `RxMessage`
   *
   * @param queue
   * @param options
   * @returns {Observable<RxMessage>}
   */
  public consume(
    queue: string,
    options?: Options.Consume,
  ): Observable<RxMessage> {
    return new Observable((observer: Observer<any>) => {
      let tag: string;
      const close$ = fromEvent(this.channel, 'close');
      const closeSub = close$.subscribe(() => observer.complete());

      this.channel
        .consume(
          queue,
          (msg: Message) => {
            observer.next(new RxMessage(msg, this));
          },
          options,
        )
        .then((r) => (tag = r.consumerTag));

      return async () => {
        closeSub.unsubscribe();
        try {
          await this.channel.cancel(tag);
        } catch (e) {
          // TODO:
          console.error('Caught channel cancel error', e);
        } // This prevents a race condition
      };
    });
  }

  /**
   * This instructs the server to stop sending messages to the consumer identified by consumerTag. Messages may arrive
   * between sending this and getting its reply; once the reply has resolved, however, there will be no more messages
   * for the consumer, i.e., the message callback will no longer be invoked.
   *
   * @param consumerTag
   * @returns Observable<EmptyReply>
   */
  public cancel(consumerTag: string): Observable<EmptyReply> {
    return from(this.channel.cancel(consumerTag)).pipe(
      map((reply) => new EmptyReply(this)),
    );
  }

  /**
   * Ask a queue for a message, as an RPC. This will be resolved with either false, if there is no message to be had
   * (the queue has no messages ready), or a message in the same shape as detailed in #consume.
   *
   * Options:
   * - noAck (boolean): if true, the message will be assumed by the server to be acknowledged (i.e., dequeued) as soon
   *    as it's been sent over the wire. Default is false, that is, you will be expected to acknowledge the message.
   *
   * @TODO: Review this comment
   * @param queue
   * @param options
   * @returns Observable<RxMessage>
   */
  public get(queue: string, options?: Options.Get): Observable<RxMessage> {
    return from(this.channel.get(queue, options)).pipe(
      filter((message) => message !== false),
      filter((message) => typeof message !== 'boolean'),
      map((message) => new RxMessage(message as Message, this)),
    );
  }

  /**
   * Acknowledge the given message, or all messages up to and including the given message.
   *
   * @param message
   * @param allUpTo
   * @returns void
   */
  public ack(message: RxMessage, allUpTo?: boolean): void {
    return this.channel.ack(message.toRaw(), allUpTo);
  }

  /**
   * Acknowledge all outstanding messages on the channel. This is a "safe" operation, in that it won't result in an
   * error even if there are no such messages.
   */
  public ackAll(): void {
    return this.channel.ackAll();
  }

  /**
   * Reject a message. This instructs the server to either requeue the message or throw it away (which may result in
   * it being dead-lettered).
   *
   * If allUpTo is truthy, all outstanding messages prior to and including the given message are rejected
   * If requeue is truthy, the server will try to put the message or messages back on the queue or queues from which
   * they came.
   *
   * @param message
   * @param allUpTo
   * @param requeue
   */
  public nack(message: RxMessage, allUpTo?: boolean, requeue?: boolean): void {
    return this.channel.nack(message.toRaw(), allUpTo, requeue);
  }

  /**
   * Reject all messages outstanding on this channel. If requeue is truthy, or omitted, the server will try to
   * re-enqueue the messages.
   *
   * @param requeue
   */
  public nackAll(requeue?: boolean): void {
    return this.channel.nackAll(requeue);
  }

  /**
   * Reject a message.
   *
   * @param message
   * @param requeue
   */
  public reject(message: RxMessage, requeue?: boolean): void {
    return this.channel.reject(message.toRaw(), requeue);
  }

  /**
   * Set the prefetch count for this channel. The count given is the maximum number of messages sent over the channel
   * that can be awaiting acknowledgement; once there are count messages outstanding, the server will not send more
   * messages on this channel until one or more have been acknowledged. A falsey value for count indicates no such
   * limit.
   *
   * @param count
   * @param global
   * @returns {Observable<EmptyReply>}
   */
  public prefetch(count: number, global?: boolean): Observable<EmptyReply> {
    return from(this.channel.prefetch(count, global)).pipe(
      map((reply) => new EmptyReply(this)),
    );
  }

  /**
   * Requeue unacknowledged messages on this channel.
   *
   * @returns Observabel<EmptyReply>
   */
  public recover(): Observable<EmptyReply> {
    return from(this.channel.recover()).pipe(
      map((reply) => new EmptyReply(this)),
    );
  }
}

export default RxChannel;
