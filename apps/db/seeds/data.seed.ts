import { Injectable } from '@nestjs/common';
import { BaseSeed } from './base.seed';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { omitEmpty } from '@libs/utils/transformers';
import { faker } from '@faker-js/faker';
import { Job } from '@app/job/entities/job.entity';
import { Contract } from '@app/contract/entities/contract.entity';
import { Profile } from '@app/profile/entities/profile.entity';
import { ContractStatus } from '@app/contract/consts';
import { ProfileType } from '@app/profile/consts';

export const JobsFactory = (data: Partial<Job> = {}): Job => {
  const result = new Job({
    id: faker.datatype.uuid(),

    description: faker.lorem.text(),

    price: faker.datatype.number({ min: 100, max: 1000 }),

    paid: Math.random() < 0.5,

    paymentDate: faker.date.past(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
  Object.assign(result, omitEmpty(data));
  return result;
};

export const ContractsFactory = (data: Partial<Contract> = {}): Contract => {
  const status = faker.helpers.arrayElement(Object.values(ContractStatus));

  const result = new Contract({
    id: faker.datatype.uuid(),
    status,

    terms: faker.lorem.text(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
  Object.assign(result, omitEmpty(data));
  return result;
};

export const ProfilesFactory = (data: Partial<Profile> = {}): Profile => {
  const type = faker.helpers.arrayElement(Object.values(ProfileType));

  const result = new Profile({
    id: faker.datatype.uuid(),
    type,

    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    profession: faker.name.jobType(),
    balance: faker.datatype.number({ min: 100, max: 1000 }),

    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
  Object.assign(result, omitEmpty(data));
  return result;
};

function* generate(factory, amount = 10) {
  while (amount--) {
    yield factory();
  }
}

@Injectable()
export class DataSeed extends BaseSeed<Job> {
  constructor(
    @InjectRepository(Job) protected jobRepository: Repository<Job>,
    @InjectRepository(Contract)
    protected contractRepository: Repository<Contract>,
    @InjectRepository(Profile) protected profileRepository: Repository<Profile>,
  ) {
    super();
    this.factory = (defaultOptions?: Record<string, any>, ...args: any[]) => {
      return new Job();
    };
  }

  async createMany<Order>(amount: number): Promise<Order[]> {
    const contracts = [...generate(ContractsFactory, amount)];

    for (const contract of contracts) {
      const client = [...generate(ProfilesFactory, 1)];
      client[0].type = ProfileType.CLIENT;

      const contractor = [...generate(ProfilesFactory, 1)];
      contractor[0].type = ProfileType.CONTRACTOR;

      const jobs = [...generate(JobsFactory, 3)];

      contract.jobs = jobs;

      await this.profileRepository.save(client[0]);
      const newClient = await this.profileRepository.save(client[0]);
      const newContractor = await this.profileRepository.save(contractor[0]);

      contract.client = newClient;
      contract.contractor = newContractor;

      await this.contractRepository.save(contract);

      const savingJobs = jobs.map(async (j) => {
        j.contract = contract;
        return await this.jobRepository.save(j);
      });

      await Promise.all(jobs);
    }

    return await Promise.all(contracts);
  }
}
