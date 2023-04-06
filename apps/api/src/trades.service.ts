import {
  egressMessageBuilder,
  kafkaEgressMessage,
  messageBuilder,
  StateFun,
} from 'apache-flink-statefun';
import { firstValueFrom } from 'rxjs';
import {
  Context,
  FlinkHandler,
  Message,
  Storage,
} from '@libs/flink/flink.decorators';

import {Injectable} from "@libs/discovery/decorators/injectable.decorator";

export class TradeDto {
  symbol: string;
  openPrice: number;
  closePrice: number;
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
        type: StateFun.floatType(),
      },
      {
        name: 'pnl',
        type: StateFun.floatType(),
      },
      {
        name: 'equity',
        type: StateFun.floatType(),
      },
      {
        name: 'monitored',
        type: StateFun.booleanType(),
      },
    ],
  })
  test(@Message() message, @Storage() storage, @Context() ctx) {
    if (message.is(TradeType)) {
      const trade: TradeDto = message.as(TradeType);
      if (!storage.pnl) {
        storage.pnl = 0;
      }
      storage.pnl = storage.pnl + trade.closePrice - trade.openPrice;
    }
    if (message.is(UserType)) {
      const user: any = message.as(UserType);
      if (!storage.user) {
        storage.user = user;
      }
      storage.balance = user.balance;
      storage.equity = user.equity;

      if (user.balance < storage.user.balance) {
        console.log('User dropped below initial balance');
      }
    }

    if (storage.pnl) {
      if (storage.pnl < -10) {
        console.log('Failing challenges', storage.user);
      }
      if (storage.pnl < 0) {
        // console.log('User has low pnl');
      }
      if (storage.pnl > 10) {
        // console.log('User has high pnl');
      }
    }
    // const visits = context.storage.visits;
    // console.log('test function', JSON.stringify(context), message, something);
    // console.log('storage', context.storage, context.storage.visits);

    // if (!context.storage.visits) {
    // context.storage.balance = 1;
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
