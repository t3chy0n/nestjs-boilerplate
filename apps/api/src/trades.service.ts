import { Injectable } from '@nestjs/common';
import {
  egressMessageBuilder,
  kafkaEgressMessage,
  messageBuilder,
  StateFun,
} from 'apache-flink-statefun';
import { firstValueFrom } from 'rxjs';
import { FlinkHandler } from '@libs/flink/flink.decorators';

export class TradeDto {
  SYMBOL: string;
}
export const GreetRequestType = StateFun.jsonType('example/GreetRequest');
export const TradeType = StateFun.jsonType<TradeDto>('example/trade');
export const UserType = StateFun.jsonType<TradeDto>('example/user');

@Injectable()
export class TradesService {
  @FlinkHandler({
    name: 'com.ververica.fn/board-manager',
    specs: [
      {
        name: 'trade',
        type: TradeType,
      },
      {
        name: 'user',
        type: UserType,
      },
      {
        name: 'balance',
        type: StateFun.intType(),
      },
    ],
  })
  test(context: any, message: any, something: any) {
    if (message.is(TradeType)) {
      console.log('Deliverd trade', message);
      const trade: TradeDto = message.as(TradeType);
    }
    if (message.is(UserType)) {
      console.log('Deliverd user', message);
      const user: any = message.as(UserType);
    }

    // const visits = context.storage.visits;
    // console.log('test function', JSON.stringify(context), message, something);
    // console.log('storage', context.storage, context.storage.visits);

    // if (!context.storage.visits) {
    context.storage.balance = 1;
    // }
    // context.storage.visits++;

    // enrich the request with the number of vists.
    // console.log(context, request);
    // next, we will forward a message to a special greeter function,
    // that will compute a super-doper-personalized greeting based on the
    // number of visits that this person has.
    // context.sendAfter(
    //   10000,
    //   messageBuilder({
    //     typename: 'example/move',
    //     id: request.name,
    //     value: {
    //       idle: true,
    //       ...request,
    //     },
    //     valueType: GreetRequestType,
    //   }),
    // );
    // context.send(
    //   kafkaEgressMessage({
    //     typename: 'com.ververica.egress/board-response',
    //     topic: 'board-response',
    //     value: { id: 'test', visits: context.storage.visits },
    //     valueType: MoveType,
    //   }),
    // );
  }

  @FlinkHandler({
    name: 'com.ververica.fn/board-manager2',
    specs: [
      {
        name: 'board',
        type: UserType,
      },
      {
        name: 'balance',
        type: StateFun.intType(),
      },
    ],
  })
  test2(context: any, message: any, something: any) {
    console.log('Deliverd shit2', message);

    console.log('storage', context.storage, context.storage.balance);
  }

  getHello() {
    return 'asd';
  }
}
