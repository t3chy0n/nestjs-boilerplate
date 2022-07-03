import { ITypeormExceptionMapper } from './typeorm-exception-mapper.interface';

export class TypeormExceptionMapper implements ITypeormExceptionMapper {
  map(error: Error): void {
    throw error;
  }
}
