import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  AssertQueueReply,
  RxAmqpLib,
} from '@libs/messaging/drivers/rabbitmq/rx';
import {
  mergeMap,
  switchMap,
  connect,
  merge,
  retry,
  repeat,
  Subject,
  tap,
  combineLatestAll,
  of,
  from,
  catchError,
  throwError,
} from 'rxjs';

const config = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  username: 'user',
  password: 'bitnami',
  type: 'topic',
  exchange: 'exchange.a',
  queue: 'test_queue',
  queue2: 'test_queue2',
  queue3: 'test_queue3',
  host: 'amqp://localhost',
};

// const connection$ = RxAmqpLib.newConnection(config.host, config).pipe(
//   mergeMap((connection) => {
//     console.log('creating channel');
//     return connection.createChannel();
//   }),
//   retry(),
// );
//
// const publisher$ = RxAmqpLib.newConnection(config.host, config).pipe(
//   mergeMap((connection) => {
//     console.log('creating channel');
//     return connection.createChannel();
//   }),
//   retry(),
// );

// const publicator$ = new Subject<Buffer>();
//
// connection$
//   .pipe(
//     connect((shared$) =>
//       merge(
//         shared$.pipe(
//           mergeMap((channel) =>
//             channel.assertQueue(config.queue3, { durable: false }),
//           ),
//
//           switchMap((reply) => {
//             return reply.channel.consume(config.queue3, { noAck: true });
//           }),
//         ),
//         shared$.pipe(
//           mergeMap((channel) =>
//             channel.assertQueue(config.queue3, { durable: false }),
//           ),
//           switchMap((reply) => {
//             return of(publicator$.asObservable(), of(reply)).pipe(
//               combineLatestAll(),
//               switchMap(([buffer, reply]: [Buffer, AssertQueueReply]) => {
//                 console.log('Publishing to channel');
//                 const res = reply.channel.sendToQueue(
//                   config.queue3,
//                   buffer as Buffer,
//                 );
//                 return of(res);
//               }),
//               tap((v) => {
//                 console.log(v);
//               }),
//             );
//           }),
//         ),
//       ),
//     ),
//
//     repeat(),
//     retry(),
//   )
//   .subscribe({
//     next: (message) => console.log(message),
//     error: (error) => console.log(error),
//     complete: () => console.log('complete'),
//   });

const test = async () => {
  return;
};
const test2 = async () => {
  return;
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /***
   * Health check endpoint
   */
  @Get()
  getHealth() {
    return this.appService.getHello();
  }
}
