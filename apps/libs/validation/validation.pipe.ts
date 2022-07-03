import { Injectable, ValidationPipe } from '@nestjs/common';
import { IRequestContextService } from '../request-context/interfaces/request-context-service.interface';
import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';
import { ValidationError } from '@nestjs/common/interfaces/external/validation-error.interface';
import { HttpMethods } from '@libs/enums/http-methods.enum';

@Injectable()
export class RequestScopedValidationPipe extends ValidationPipe {
  constructor(private readonly contextService: IRequestContextService) {
    super({
      transform: true,
      always: true,
      validateCustomDecorators: true,
      transformOptions: {
        groups: [
          HttpMethods.GET,
          HttpMethods.POST,
          HttpMethods.DELETE,
          HttpMethods.PUT,
        ],
      },
    });
  }

  async validate(
    object: object,
    validatorOptions?: ValidatorOptions,
  ): Promise<ValidationError[]> {
    const context = this.contextService.getContext();
    const method = context.requestMethod;

    try {
      return await super.validate(object, {
        ...validatorOptions,
        groups: [method],
        always: true,
      });
    } catch (e) {
      console.error(e);
    }
  }
}
