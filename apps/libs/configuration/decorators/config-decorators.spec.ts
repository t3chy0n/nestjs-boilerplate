import {
  IBootstrapConfiguration,
  IConfiguration,
} from '@libs/configuration/interfaces/configuration.interface';
import { BootstrapConfig, Config, ConfigProperty } from './config.decorators';
import { ConfigValueWrongTypeException } from '@libs/configuration/exceptions/config-value-wrong-type.exception';
import {
  spyOnDiscoveryModuleAnnotations,
  wireBeanProxy,
} from '@libs/testing/test';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { expect, sharedSandbox } from '@libs/testing/test-utils';
import { assert } from 'chai';

describe('Annotated Configuration class', () => {
  const sandbox = sharedSandbox();

  describe('a decorator', () => {
    let mockConfig: any;
    let target: any;
    let BeforeSpy;
    let AfterSpy;

    beforeEach(() => {
      const { spyBefore, spyAfter } = spyOnDiscoveryModuleAnnotations(sandbox);

      BeforeSpy = spyBefore;
      AfterSpy = spyAfter;

      mockConfig = {
        get: sandbox.stub(),
      };
      target = {
        testProperty: null,
      };
    });

    it('should get config value using config key from decorator', () => {
      mockConfig.get.returns('test');
      @Config('configKey')
      class Test {
        @ConfigProperty()
        testProperty: string;
      }

      const instance = wireBeanProxy(Test, { config: mockConfig });

      expect(instance.testProperty).to.be.equal('test');
      expect(mockConfig.get).to.have.been.calledWith('configKey.testProperty');
    });

    it('should get config value using key from decorator', () => {
      mockConfig.get.returns('test');

      class Test {
        @ConfigProperty('configKey.testProperty')
        testProperty: string;
      }

      const instance = wireBeanProxy(Test, { config: mockConfig });

      expect(instance.testProperty).to.be.equal('test');
      expect(mockConfig.get).to.have.been.calledWith('configKey.testProperty');
    });

    it('should validate primitive type value', () => {
      mockConfig.get.returns(123);

      class Test {
        @ConfigProperty('configKey.testProperty')
        testProperty: string;
      }

      const instance = wireBeanProxy(Test, { config: mockConfig });

      assert.throw(() => {
        instance.testProperty;
      }, 'configKey.testProperty expects to be String type!');

      expect(mockConfig.get).to.have.been.calledWith('configKey.testProperty');
    });

    it('should throw error on invalid object type value', () => {
      mockConfig.get.returns({ test: 123 });

      class TestDto {
        @IsDefined()
        field: string;
      }
      class Test {
        @ConfigProperty('configKey.testProperty')
        testProperty: TestDto;
      }

      const instance = wireBeanProxy(Test, { config: mockConfig });

      assert.throw(() => {
        instance.testProperty;
      }, ConfigValueWrongTypeException);
      expect(mockConfig.get).to.have.been.calledWith('configKey.testProperty');
    });

    it('should pass through when valid object type value', () => {
      mockConfig.get.returns({
        fieldStr: 'ASD',
        fieldInt: 123,
      });

      class TestDto {
        @IsDefined()
        @IsString()
        fieldStr: string;

        @IsNumber()
        @IsDefined()
        fieldInt: number;
      }
      class Test {
        @ConfigProperty('configKey.testProperty')
        testProperty: TestDto;
      }

      const instance = wireBeanProxy(Test, { config: mockConfig });

      assert.doesNotThrow(() => {
        instance.testProperty;
      }, ConfigValueWrongTypeException);

      expect(mockConfig.get).to.have.been.calledWith('configKey.testProperty');
    });

    it('should execute Before and After hooks', () => {
      mockConfig.get.returns('test');

      @Config('root')
      class Test {
        @ConfigProperty('Custom')
        testProperty: string;
      }

      const instance = wireBeanProxy(Test, { config: mockConfig });

      expect(instance.testProperty).to.be.equal('test');
      expect(BeforeSpy.callCount).to.be.equal(1);
      expect(AfterSpy.callCount).to.be.equal(1);
      expect(mockConfig.get).to.have.been.calledWith('root.Custom');
    });
  });

  describe('with example Database Config', () => {
    let config: IConfiguration;
    let bootstrapConfig: IBootstrapConfiguration;

    class DatabaseConfig {
      @ConfigProperty('host')
      host: string;

      @ConfigProperty('port')
      port: number;
    }

    beforeEach(() => {
      config = {
        get: sandbox.stub(),
      } as any;

      bootstrapConfig = {
        get: sandbox.stub(),
      } as any;
    });

    it('should retrieve the configuration value for a primitive type property', () => {
      const expectedResult = 'localhost';
      (config.get as any).returns(expectedResult);

      const dbConfig = wireBeanProxy(DatabaseConfig, { config });

      expect(dbConfig.host).to.be.equal(expectedResult);
      expect(config.get).to.have.been.calledWith('host');
    });

    it('should retrieve the configuration value for an object type property', () => {
      const expectedResult = { host: 'localhost', port: 3306 };
      (config.get as any).withArgs('host').returns(expectedResult.host);
      (config.get as any).withArgs('port').returns(expectedResult.port);

      const dbConfig = wireBeanProxy(DatabaseConfig, { config });

      expect(dbConfig.host).to.be.equal(expectedResult.host);
      expect(dbConfig.port).to.be.equal(expectedResult.port);
      expect(config.get).to.have.been.calledWith('host');
      expect(config.get).to.have.been.calledWith('port');
    });

    it('should validate the configuration value for a primitive type property', () => {
      const expectedResult = 'localhost';
      (config.get as any).returns(expectedResult);

      const dbConfig = wireBeanProxy(DatabaseConfig, { config });
      assert.throw(() => {
        dbConfig.port;
      }, ConfigValueWrongTypeException);
    });

    it('should validate the configuration value for an object type property', () => {
      const expectedResult = { host: 'localhost', port: '3306' };
      (config.get as any).withArgs('host').returns(expectedResult.host);
      (config.get as any).withArgs('port').returns(expectedResult.port);

      const dbConfig = wireBeanProxy(DatabaseConfig, { config });

      assert.doesNotThrow(() => {
        dbConfig.host;
      });
      assert.throw(() => {
        dbConfig.port;
      }, ConfigValueWrongTypeException);
    });

    it('should retrieve the configuration value with the correct key for a nested property', () => {
      const expectedResult = { host: 'localhost', port: '3306' };
      (config.get as any).returns(expectedResult);

      @Config('db')
      class AppConfig {
        @ConfigProperty()
        database: DatabaseConfig;
      }

      const appConfig = wireBeanProxy(AppConfig, { config });
      expect(appConfig.database.host).to.be.equal(expectedResult.host);
      expect(config.get).to.have.been.calledWith('db.database');
    });

    it('should retrieve the configuration value with the correct key for a bootstrapped property', () => {
      const expectedResult = 'dev';
      (bootstrapConfig.get as any).returns(expectedResult);

      @BootstrapConfig()
      class BootstrapConfigClass {
        @ConfigProperty('env')
        env: string;
      }

      const bootstrapConfigClass = wireBeanProxy(BootstrapConfigClass, {
        config: bootstrapConfig,
      });

      expect(bootstrapConfigClass.env).to.be.equal(expectedResult);
      expect(bootstrapConfig.get).to.have.been.calledWith('env');
    });
  });
  describe('ConfigProperty', () => {
    let config: Partial<IConfiguration>;
    let bootstrapConfig: Partial<IConfiguration>;
    beforeEach(() => {
      config = {
        get: sandbox.stub(),
      } as any;

      bootstrapConfig = {
        get: sandbox.stub(),
      } as any;
    });

    it('should get the configuration value with the correct key and type', () => {
      class TestClass {
        @ConfigProperty()
        testProperty: string;
      }
      const target = wireBeanProxy(TestClass, { config });

      const value = 'testValue';
      const configKey = 'testProperty';
      (config.get as any).returns(value);

      const result = target.testProperty;

      expect(config.get).to.have.been.calledWith(configKey);
      expect(result).to.be.equal(value);
    });

    it('should get the configuration value with the specified key and type', () => {
      class TestClass {
        @ConfigProperty('myKey')
        testProperty: number;
      }

      const target = wireBeanProxy(TestClass, { config });
      const value = 42;
      const configKey = 'myKey';
      (config.get as any).returns(value);

      const result = target.testProperty;

      expect(config.get).to.have.been.calledWith(configKey);
      expect(result).to.be.equal(value);
    });

    it('should throw an error if the configuration value is of the wrong type', () => {
      class TestClass {
        @ConfigProperty()
        testProperty: number;
      }

      const target = wireBeanProxy(TestClass, { config });

      const key = 'testKey';
      const value = 'not a number';
      const configKey = 'testProperty';
      (config.get as any).returns(value);

      assert.throw(() => target.testProperty, ConfigValueWrongTypeException);
      expect(config.get).to.have.been.calledWith(configKey);
    });

    it('should throw an error if the configuration object fails validation', () => {
      class TestNested {
        @IsString()
        name: string;
      }

      class TestClass {
        @ConfigProperty()
        testProperty: TestNested;
      }

      const target = wireBeanProxy(TestClass, { config });

      const key = 'testKey';
      const value = { name: 123 }; // should be a string
      const configKey = 'testProperty';
      (config.get as any).returns(value);

      assert.throw(() => target.testProperty, ConfigValueWrongTypeException);
      expect(config.get).to.have.been.calledWith(configKey);
    });
  });
});
