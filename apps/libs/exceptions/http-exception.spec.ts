import { HttpException } from './http.exception';
import { HttpStatus } from '@nestjs/common';

class TestTranslatedException extends HttpException {
  translatedMessage = 'error.DEFAULT';
}

describe('Http Exception', () => {
  const cause = new Error();

  it('should create exception with proper translation key', () => {
    const exception = new HttpException()
      .translation('test.SOME_KEY')
      .params(1, 2)
      .setCause(cause);

    expect(exception.getTranslationKey()).toEqual('test.SOME_KEY');
    expect(exception.getParams()).toHaveLength(2);
    expect(exception.getParams()[0]).toEqual(1);
    expect(exception.getParams()[1]).toEqual(2);
    expect(exception.getCause()).toEqual(cause);
    expect(exception).toBeInstanceOf(HttpException);
  });
  it('should create exception with default translation key', () => {
    const exception = new TestTranslatedException().setCause(cause);
    expect(exception.getTranslationKey()).toEqual('error.DEFAULT');
    expect(exception.getParams()).toHaveLength(0);
    expect(exception.getCause()).toEqual(cause);
    expect(exception).toBeInstanceOf(TestTranslatedException);
  });
  it('should create exception with overriden status', () => {
    const exception = new TestTranslatedException(HttpStatus.CONFLICT).setCause(
      cause,
    );
    expect(exception.getTranslationKey()).toEqual('error.DEFAULT');
    expect(exception.getParams()).toHaveLength(0);
    expect(exception.getCause()).toEqual(cause);
    expect(exception.getStatus()).toEqual(HttpStatus.CONFLICT);
    expect(exception).toBeInstanceOf(TestTranslatedException);
  });
});
