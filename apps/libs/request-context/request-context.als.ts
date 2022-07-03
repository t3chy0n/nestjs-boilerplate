import { AsyncLocalStorage } from 'async_hooks';
import { RequestContextDto } from './request-context.dto';
import { Injectable } from '@nestjs/common';

/***
 * Class extends Async Local storage, its a class for storing request context data;
 */
@Injectable()
export class RequestContextAsyncLocalStorage extends AsyncLocalStorage<RequestContextDto> {}

/***
 * Request Context Async Local Storage Stub class for tests
 */
export class RequestContextAsyncLocalStorageStub
  implements AsyncLocalStorage<RequestContextDto>
{
  disable(): void {
    return;
  }

  enterWith(store: RequestContextDto): void {}

  exit<R, TArgs extends any[]>(
    callback: (...args: TArgs) => R,
    ...args: TArgs
  ): R {
    return {} as R;
  }

  getStore(): RequestContextDto | undefined {
    return new RequestContextDto();
  }

  run<R, TArgs extends any[]>(
    store: RequestContextDto,
    callback: (...args: TArgs) => R,
    ...args: TArgs
  ): R {
    callback(...args);
    return {} as R;
  }
}
