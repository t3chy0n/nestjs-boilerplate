import { HttpException } from './http.exception';
import { HttpStatus } from '@nestjs/common';
import { expect } from '@libs/testing/test-utils';

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

    expect(exception.getTranslationKey()).to.be.equal('test.SOME_KEY');
    expect(exception.getParams()).to.have.length(2);
    expect(exception.getParams()[0]).to.be.equal(1);
    expect(exception.getParams()[1]).to.be.equal(2);
    expect(exception.getCause()).to.be.equal(cause);
    expect(exception).to.be.instanceof(HttpException);
  });
  it('should create exception with default translation key', () => {
    const exception = new TestTranslatedException().setCause(cause);
    expect(exception.getTranslationKey()).to.be.equal('error.DEFAULT');
    expect(exception.getParams()).to.have.length(0);
    expect(exception.getCause()).to.be.equal(cause);
    expect(exception).to.be.instanceof(TestTranslatedException);
  });
  it('should create exception with overriden status', () => {
    const exception = new TestTranslatedException(HttpStatus.CONFLICT).setCause(
      cause,
    );
    expect(exception.getTranslationKey()).to.be.equal('error.DEFAULT');
    expect(exception.getParams()).to.have.length(0);
    expect(exception.getCause()).to.be.equal(cause);
    expect(exception.getStatus()).to.be.equal(HttpStatus.CONFLICT);
    expect(exception).to.be.instanceof(TestTranslatedException);
  });
});
