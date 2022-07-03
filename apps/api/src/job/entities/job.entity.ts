import { BaseEntity } from '@db/common/base.entity';

import { EntityId } from '@libs/types';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Contract } from '@app/contract/entities/contract.entity';

@Entity()
export class Job extends BaseEntity {
  /***
   * Job unique identifier
   */
  @PrimaryGeneratedColumn('uuid')
  id: EntityId;

  /***
   * Job description
   */
  @Column({
    nullable: false,
  })
  description: string;

  /***
   * Job price
   */
  @Column({
    nullable: false,
  })
  price: number;

  /***
   * Flag remarking whether job was paid
   */
  @Column({
    nullable: false,
    default: false,
  })
  paid: boolean;

  /***
   * Job payment date
   */
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  paymentDate: Date;

  @ManyToOne(() => Contract, (contract) => contract.jobs, {
    onDelete: 'CASCADE',
  })
  contract: Contract;

  constructor(params: Partial<Job> = {}) {
    super();
    Object.assign(this, params);
  }
}
