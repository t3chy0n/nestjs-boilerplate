import { BaseEntity } from '@db/common/base.entity';

import { EntityId } from '@libs/types';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Job } from '@app/job/entities/job.entity';
import { ContractStatus } from '@app/contract/consts';
import { Profile } from '@app/profile/entities/profile.entity';

@Entity()
export class Contract extends BaseEntity {
  /***
   * Contract unique identifier
   */
  @PrimaryGeneratedColumn('uuid')
  id: EntityId;

  /***
   * Contract terms
   */
  @Column({
    nullable: false,
  })
  terms: string;

  /***
   * Contract status
   */
  @Column({
    nullable: false,
    enum: ContractStatus,
    default: ContractStatus.NEW,
  })
  status: ContractStatus;

  @ManyToOne(() => Profile, (profile) => profile.contracts, {
    onDelete: 'CASCADE',
  })
  client: Profile;

  @ManyToOne(() => Profile, (profile) => profile.assigned, {
    onDelete: 'CASCADE',
  })
  contractor: Profile;

  @OneToMany(() => Job, (job) => job.contract, {
    onDelete: 'CASCADE',
  })
  jobs: Job[];

  constructor(params: Partial<Contract> = {}) {
    super();
    Object.assign(this, params);
  }
}
