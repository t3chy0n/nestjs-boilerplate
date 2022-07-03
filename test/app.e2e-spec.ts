import { INestApplication } from '@nestjs/common';
import { AppModule } from '../apps/api/src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  testAppFactory,
  testDbFactory,
  testPostgresContainer,
} from './utils/app.factory';
import { ContractsTestHttpClient } from './utils/clients/contracts.client';
import { ContractStatus } from '@app/contract/consts';
import { ProfilesTestHttpClient } from './utils/clients/profiles.client';
import { JobsTestHttpClient } from './utils/clients/jobs.client';
import { ProfileDto } from '@app/profile/dto/profile.dto';
import { ProfileType } from '@app/profile/consts';
import { ContractDto } from '@app/contract/dto/contract.dto';
import { JobDto } from '@app/job/dto/job.dto';
import { AdminTestHttpClient } from './utils/clients/admin.client';

const expectContractToBeValid = (entry: ContractDto) => {
  expect(entry.updatedAt).toBeDefined();
  expect(entry.createdAt).toBeDefined();
  expect(Object.values(ContractStatus).includes(entry.status)).toBeTruthy();
  expect(entry.terms).toBeDefined();
  expect(entry.id).toBeDefined();
};

const expectProfileToBeValid = (entry: ProfileDto) => {
  expect(entry.firstName).toBeDefined();
  expect(entry.lastName).toBeDefined();
  expect(entry.profession).toBeDefined();
  expect(entry.balance).toBeDefined();
  expect(entry.createdAt).toBeDefined();
  expect(Object.values(ProfileType).includes(entry.type)).toBeTruthy();
  expect(entry.id).toBeDefined();
};

const expectJobToBeValid = (entry: JobDto) => {
  expect(entry.paid).toBeDefined();
  expect(entry.description).toBeDefined();
  expect(entry.createdAt).toBeDefined();
  expect(entry.id).toBeDefined();
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let postgresContainer;
  let contractsTestHttpClient: ContractsTestHttpClient;
  let profilesTestHttpClient: ProfilesTestHttpClient;
  let jobsTestHttpClient: JobsTestHttpClient;
  let adminTestHttpClient: AdminTestHttpClient;

  beforeAll(async () => {
    postgresContainer = await testPostgresContainer();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await postgresContainer.stop();
  });

  beforeEach(async () => {
    app = await testAppFactory({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => testDbFactory(postgresContainer),
        }),
        AppModule,
      ],
      providers: [],
    });
    contractsTestHttpClient = new ContractsTestHttpClient(app.getHttpServer());
    profilesTestHttpClient = new ProfilesTestHttpClient(app.getHttpServer());
    jobsTestHttpClient = new JobsTestHttpClient(app.getHttpServer());
    adminTestHttpClient = new AdminTestHttpClient(app.getHttpServer());
  });

  describe('Contracts', () => {
    let profile: ProfileDto;
    beforeEach(async () => {
      const profiles = await profilesTestHttpClient.findMany();
      profile = profiles.data[0];
      expectProfileToBeValid(profile);
    });
    describe('Succefully', () => {
      it('/contracts (GET)', async () => {
        const result = await contractsTestHttpClient.findMany({});
        expect(result.data.length).toBeGreaterThan(0);
        for (const contract of result.data) {
          expectContractToBeValid(contract);
        }
      });

      it('/contracts (POST)', async () => {
        const beforeContracts = await contractsTestHttpClient.findMany({});

        const result = await contractsTestHttpClient.create({
          terms: 'Test Terms',
          clientId: profile.id,
          status: ContractStatus.NEW,
        });
        expectContractToBeValid(result);

        const afterContracts = await contractsTestHttpClient.findMany({});
        expect(afterContracts.total).toEqual(beforeContracts.total + 1);
      });

      it('/contracts (PUT)', async () => {
        const beforeContracts = await contractsTestHttpClient.findMany({});
        const { id } = beforeContracts.data[0];
        await contractsTestHttpClient.update(id, { terms: 'test test' });
        await contractsTestHttpClient.update(id, {
          status: ContractStatus.IN_PROGRESS,
        });
        await contractsTestHttpClient.update(id, {
          status: ContractStatus.TERMINATED,
        });
        await contractsTestHttpClient.update(id, {
          clientId: profile.id,
        });

        const updatedContract = await contractsTestHttpClient.findOne(id);

        expect(updatedContract.terms).toEqual('test test');
        expect(updatedContract.status).toBe(ContractStatus.TERMINATED);
        expect(updatedContract.clientId).toBe(profile.id);
      });

      it('/contracts (DELETE)', async () => {
        const beforeContracts = await contractsTestHttpClient.findMany({});

        const result = await contractsTestHttpClient.delete(
          beforeContracts.data[0].id,
        );
        expect(result).toBe(true);

        const afterContracts = await contractsTestHttpClient.findMany({});
        expect(afterContracts.total).toEqual(beforeContracts.total - 1);
      });
    });
    describe('Handles errors', () => {});
  });
  describe('Jobs', () => {
    let contract: ContractDto;
    beforeEach(async () => {
      const contracts = await contractsTestHttpClient.findMany();
      contract = contracts.data[0];
      expectContractToBeValid(contract);
    });

    describe('Succefully', () => {
      it('/jobs (GET)', async () => {
        const result = await jobsTestHttpClient.findMany({});
        expect(result.data.length).toBeGreaterThan(0);
        for (const job of result.data) {
          expectJobToBeValid(job);
        }
      });
      it('/jobs (POST)', async () => {
        const beforeJobs = await jobsTestHttpClient.findMany({});

        const result = await jobsTestHttpClient.create({
          description: 'asd',
          price: 10,
        });
        expectJobToBeValid(result);

        const afterJobs = await jobsTestHttpClient.findMany({});
        expect(afterJobs.total).toEqual(beforeJobs.total + 1);
      });

      it('/jobs (PUT)', async () => {
        const beforeJobs = await jobsTestHttpClient.findMany({});
        const { id } = beforeJobs.data[0];
        await jobsTestHttpClient.update(id, { description: 'test test' });
        await jobsTestHttpClient.update(id, {
          price: 123,
        });
        await jobsTestHttpClient.update(id, {
          contractId: contract.id,
        });

        const updatedJob = await jobsTestHttpClient.findOne(id);

        expect(updatedJob.description).toEqual('test test');
        expect(updatedJob.price).toBe(123);
        expect(updatedJob.contractId).toBe(contract.id);
      });

      it('/jobs (DELETE)', async () => {
        const beforeJobs = await jobsTestHttpClient.findMany({});

        const result = await jobsTestHttpClient.delete(beforeJobs.data[0].id);
        expect(result).toBe(true);

        const afterJobs = await jobsTestHttpClient.findMany({});
        expect(afterJobs.total).toEqual(beforeJobs.total - 1);
      });
    });
    describe('Handles errors', () => {});
  });
  describe('Profiles', () => {
    describe('Succefully', () => {
      it('/profiles (GET)', async () => {
        const result = await profilesTestHttpClient.findMany({});
        expect(result.data.length).toBeGreaterThan(0);
        for (const profile of result.data) {
          expectProfileToBeValid(profile);
        }
      });
      it('/profiles (POST)', async () => {
        const beforeProfiles = await profilesTestHttpClient.findMany({});

        const result = await profilesTestHttpClient.create({
          firstName: 'test1',
          lastName: 'test2',
          profession: 'test3',
          balance: 10,
          type: ProfileType.CLIENT,
        });
        expectProfileToBeValid(result);

        const afterProfiles = await profilesTestHttpClient.findMany({});
        expect(afterProfiles.total).toEqual(beforeProfiles.total + 1);
      });

      it('/profiles (PUT)', async () => {
        const beforeProfiles = await profilesTestHttpClient.findMany({});
        const { id } = beforeProfiles.data[0];
        await profilesTestHttpClient.update(id, { firstName: 'test1' });
        await profilesTestHttpClient.update(id, { lastName: 'test2' });
        await profilesTestHttpClient.update(id, { profession: 'test3' });
        await profilesTestHttpClient.update(id, {
          balance: 123,
        });
        await profilesTestHttpClient.update(id, {
          type: ProfileType.CONTRACTOR,
        });

        await profilesTestHttpClient.update(id, {
          type: ProfileType.CLIENT,
        });

        const updatedProfile = await profilesTestHttpClient.findOne(id);

        expect(updatedProfile.firstName).toEqual('test1');
        expect(updatedProfile.lastName).toEqual('test2');
        expect(updatedProfile.profession).toEqual('test3');
        expect(updatedProfile.balance).toBe(123);
        expect(updatedProfile.type).toBe(ProfileType.CLIENT);
      });

      it('/profiles (DELETE)', async () => {
        const beforeProfiles = await profilesTestHttpClient.findMany({});

        const result = await profilesTestHttpClient.delete(
          beforeProfiles.data[0].id,
        );
        expect(result).toBe(true);

        const afterProfiles = await profilesTestHttpClient.findMany({});
        expect(afterProfiles.total).toEqual(beforeProfiles.total - 1);
      });
    });
    describe('Handles errors', () => {});
  });

  describe('Admin', () => {
    it('/admin/best-clients (GET) with default limit set to 2', async () => {
      const result = await adminTestHttpClient.bestClients({
        start: new Date('1970-01-01'),
        end: new Date(),
      });
      expect(result.data.length).toEqual(2);
    });
    it('/admin/best-profession (GET) with default limit set to 1', async () => {
      const result = await adminTestHttpClient.bestProfession({
        start: new Date('1970-01-01'),
        end: new Date(),
      });
      expect(result.data.length).toEqual(1);
    });

    it('/admin/best-clients (GET)', async () => {
      const result = await adminTestHttpClient.bestClients({
        start: new Date('1970-01-01'),
        end: new Date(),
        limit: 100,
      });
      expect(result.data.length).toBeGreaterThan(2);
    });
    it('/admin/best-profession (GET)', async () => {
      const result = await adminTestHttpClient.bestProfession({
        start: new Date('1970-01-01'),
        end: new Date(),
        limit: 100,
      });
      expect(result.data.length).toBeGreaterThan(1);
    });
  });
});
