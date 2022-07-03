import { EventEmitter2 } from '@nestjs/event-emitter';

export function waitForEvent<T>(emitter: EventEmitter2, event): Promise<T> {
  return new Promise((resolve, reject) => {
    emitter.once(event, resolve);
    emitter.once('error', reject);
  });
}

export function waitFor<T>(time): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}
