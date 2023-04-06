import { Test, TestingModule } from '@nestjs/testing';
import { Config, ConfigProperty } from './decorators';

class MyClass {
  constructor(private readonly message: string) {}

  @Config('myConfigKey')
  configValue: string;

  @ConfigProperty('myConfigKey')
  getConfigValue: () => string;
}

describe('MyClass', () => {
  let myClass: MyClass;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MyClass,
          useValue: new MyClass('test message'),
        },
      ],
    }).compile();

    myClass = module.get<MyClass>(MyClass);
  });

  it('should have a config value', () => {
    expect(myClass.configValue).toBeDefined();
  });

  it('should have the correct config value', () => {
    expect(myClass.configValue).toBe('');
  });

  it('should have a getConfigValue method', () => {
    expect(myClass.getConfigValue).toBeDefined();
  });

  it('should return the correct config value from getConfigValue', () => {
    expect(myClass.getConfigValue()).toBe('');
  });
});
