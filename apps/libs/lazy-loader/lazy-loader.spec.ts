import { Test, TestingModule } from '@nestjs/testing';
import { ILazyLoaderService } from './lazy-loader-service.interface';
import { LazyLoaderModule } from './lazy-loader.module';
import { Inject, Injectable } from '@nestjs/common';
import { Lazy } from './lazy';
import { LoggerModule } from '../logger/logger.module';
import { ConfigurationModule } from '../configuration/configuration.module';
import * as sinon from 'sinon';
import { expect } from '@utils/test-utils';

@Injectable()
class SubjectDependency {
  test(p: number) {}
  test2(p: number) {}
}

@Injectable()
class SubjectClass {
  constructor(private readonly dep: SubjectDependency) {}
  foo(p: number): string {
    this.dep.test(p);
    return 'Stub1';
  }
  foo2(p: number): string {
    this.dep.test2(p);
    return 'Stub2';
  }
}

describe('LazyLoader', () => {
  let service: ILazyLoaderService;
  let dependency: any;
  let moduleFixture: TestingModule;

  describe('Simple injection', () => {
    let fooSpy;
    let fooSpy2;
    beforeEach(async () => {
      fooSpy = sinon.spy(SubjectClass.prototype, 'foo');
      fooSpy2 = sinon.spy(SubjectClass.prototype, 'foo2');

      //Test entire module agains RabbitMQ driver
      moduleFixture = await Test.createTestingModule({
        imports: [LazyLoaderModule, LoggerModule, ConfigurationModule],
        providers: [SubjectDependency],
      }).compile();

      dependency = moduleFixture.get<SubjectDependency>(SubjectDependency);
      sinon.spy(dependency, 'test');

      service = moduleFixture.get<ILazyLoaderService>(ILazyLoaderService);
    });

    afterEach(() => {
      fooSpy.restore();
      fooSpy2.restore();
    })

    it('should lazily instantiate working proxy to object', async () => {
      const instance = await service.lazyCreate(SubjectClass);

      instance.foo(1);
      expect(dependency.test).to.not.have.been.called;

      await moduleFixture.init();
      // const newinstance: SubjectClass = new SubjectClass(dependency);
      // (instance as unknown as Lazy<SubjectClass>).instantiate(newinstance);

      instance.foo(1);
      expect(dependency.test).to.have.been.calledWith(1);
    });

    it('should instantiate object and find its dependencies', async () => {
      const instance = await service.create(SubjectClass);

      instance.foo(1);
      expect(dependency.test).to.have.been.calledWith(1);
      await moduleFixture.init();

      instance.foo(2);
      expect(dependency.test).to.have.been.calledWith(2);
    });
  });

  @Injectable()
  class SubjectDependency2 {
    test(p: number) {}
    test2(p: number) {}
  }

  @Injectable()
  class SubjectClass2 {
    constructor(
      @Inject('TEST_TOKEN') private readonly dep: SubjectDependency2,
    ) {}
    foo(p: number): string {
      this.dep.test(p);
      return 'Stub1';
    }
    foo2(p: number): string {
      this.dep.test2(p);
      return 'Stub2';
    }
  }

  describe('Token injection', () => {
    let fooSpy;
    let fooSpy2;
    beforeEach(async () => {
      fooSpy = sinon.spy(SubjectClass2.prototype, 'foo');
      fooSpy2 = sinon.spy(SubjectClass2.prototype, 'foo2');
      //Test entire module agains RabbitMQ driver
      moduleFixture = await Test.createTestingModule({
        imports: [LazyLoaderModule, LoggerModule, ConfigurationModule],
        providers: [
          {
            provide: 'TEST_TOKEN',
            useClass: SubjectDependency2,
          },
          SubjectClass2,
        ],
      }).compile();

      dependency = moduleFixture.get<SubjectDependency2>('TEST_TOKEN');
      sinon.spy(dependency, 'test');

      service = moduleFixture.get<ILazyLoaderService>(ILazyLoaderService);
    });

    afterEach(() => {
      fooSpy.restore();
      fooSpy2.restore();
    });

    it('should lazily instantiate working proxy to object when dependency decorated and set with token metadata', async () => {
      const instance = await service.lazyCreate(SubjectClass2);

      instance.foo(1);
      expect(dependency.test).to.not.have.been.called;

      await moduleFixture.init();
      const newinstance: SubjectClass2 = new SubjectClass2(dependency);
      (instance as unknown as Lazy<SubjectClass2>).instantiate(newinstance);

      instance.foo(1);
      expect(dependency.test).to.have.been.calledWith(1);
    });

    it('should instantiate object and find its dependencies when depedency decorated and set with token metadata', async () => {
      const instance = await service.create(SubjectClass2);

      instance.foo(1);
      expect(dependency.test).to.have.been.calledWith(1);
      await moduleFixture.init();

      instance.foo(2);
      expect(dependency.test).to.have.been.calledWith(2);
    });
  });

  @Injectable()
  class SubjectDependency3 {
    test(p: string) {}
    test2(p: number) {}
  }

  @Injectable()
  class SubjectClass3 {
    constructor(
      private readonly name: string,
      private readonly port: number,
      private readonly dep: SubjectDependency3,
    ) {}
    getName(p: number): string {
      this.dep.test(this.name);
      return this.name;
    }
    getPort(p: number): number {
      this.dep.test2(this.port);
      return this.port;
    }
  }

  describe('Assisted injection', () => {
    let getNameSpy;
    let getPortSpy;
    beforeEach(async () => {
      getNameSpy = sinon.spy(SubjectClass3.prototype, 'getName');
      getPortSpy = sinon.spy(SubjectClass3.prototype, 'getPort');
      //Test entire module agains RabbitMQ driver
      moduleFixture = await Test.createTestingModule({
        imports: [LazyLoaderModule, LoggerModule, ConfigurationModule],
        providers: [SubjectDependency3],
      }).compile();

      dependency = moduleFixture.get<SubjectDependency3>(SubjectDependency3);
      sinon.spy(dependency, 'test');
      sinon.spy(dependency, 'test2');

      service = moduleFixture.get<ILazyLoaderService>(ILazyLoaderService);
    });

    afterEach(() => {
      getNameSpy.restore();
      getPortSpy.restore();
    });

    it('should lazily instantiate working proxy to object and override first n constructor arguments when passed to lazyCreate method', async () => {
      const instance = await service.lazyCreate(
        SubjectClass3,
        'testName',
        5432,
      );

      instance.getName(1);
      expect(dependency.test).not.to.have.been.called;

      await moduleFixture.init();

      expect(instance.getName(1)).to.be.equal('testName');
      expect(instance.getPort(1)).to.be.equal(5432);

      expect(dependency.test2).to.have.been.calledWith(5432);
      expect(dependency.test).to.have.been.calledWith('testName');
    });

    it('should instantiate object and find its dependencies when depedency decorated and set with token metadata', async () => {
      const instance = await service.create(SubjectClass3, 'testName', 5432);

      expect(instance.getName(1)).to.be.equal('testName');
      expect(dependency.test).to.have.been.calledWith('testName');
      await moduleFixture.init();

      expect(instance.getPort(1)).to.be.equal(5432);
      expect(dependency.test2).to.have.been.calledWith(5432);
      expect(dependency.test).to.have.been.calledWith('testName');
    });

    it('should instantiate properly object dependencies, when args array contains undefined values', async () => {
      const args = [undefined, 5432];
      const instance = await service.create(SubjectClass3, ...args);

      expect(instance.getName(1)).to.be.equal(undefined);
      expect(dependency.test).to.have.been.calledWith(undefined);
      await moduleFixture.init();

      expect(instance.getPort(1)).to.be.equal(5432);
      expect(dependency.test2).to.have.been.calledWith(5432);
      expect(dependency.test).to.have.been.calledWith(undefined);
    });
  });
});
