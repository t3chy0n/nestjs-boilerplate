export abstract class IExceptionMapper {
  abstract map(err: Error): void;
}
