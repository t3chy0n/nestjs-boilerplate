import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ISeeder } from '../interfaces/seeder.interface';

/***
 * Base class exposing interface for creating seeds
 */
@Injectable()
export class BaseSeed<T> implements ISeeder {
  protected repository: Repository<T>;

  factory: (defaultOptions?: Record<string, any>, ...args: any[]) => T;

  async createMany<T>(
    amount: number,
    defaultOptions?: Record<string, any>,
  ): Promise<T[]> {
    if (typeof this.factory != 'function') return;

    const items = new Array(amount)
      .fill('')
      .map(() => this.createOne(defaultOptions).catch());

    return Promise.all(items);
  }

  async createOne(defaultOptions: Record<string, any> = {}): Promise<any> {
    return await this.repository.save(this.factory(defaultOptions) as any);
  }
}
