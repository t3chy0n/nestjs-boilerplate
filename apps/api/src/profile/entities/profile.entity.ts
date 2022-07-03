import { BaseEntity } from '@db/common/base.entity';

import { EntityId } from '@libs/types';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Contract } from '@app/contract/entities/contract.entity';
import { ProfileType } from '@app/profile/consts';

@Entity()
export class Profile extends BaseEntity {
  /***
   * Profile unique identifier
   */
  @PrimaryGeneratedColumn('uuid')
  id: EntityId;

  /***
   * Profiles first name
   */
  @Column({
    nullable: false,
  })
  firstName: string;

  /***
   * Profiles last name
   */
  @Column({
    nullable: false,
  })
  lastName: string;

  /***
   * Profiles profession
   */
  @Column({
    nullable: false,
  })
  profession: string;

  /***
   * Profiles balance
   */
  @Column('decimal', {
    nullable: false,
    default: 0,
    precision: 12,
    scale: 2,
  })
  balance: number;

  /***
   * Profiles type
   */
  @Column({
    nullable: false,
    enum: ProfileType,
  })
  type: ProfileType;

  @OneToMany(() => Contract, (contract) => contract.client, {
    onDelete: 'CASCADE',
  })
  contracts: Contract[];

  @OneToMany(() => Contract, (contract) => contract.contractor, {
    onDelete: 'CASCADE',
  })
  assigned: Contract[];

  constructor(params: Partial<Profile> = {}) {
    super();
    Object.assign(this, params);
  }
}
