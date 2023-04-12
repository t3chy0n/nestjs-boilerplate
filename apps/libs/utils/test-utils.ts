import * as chai from 'chai';
import * as sinon from 'sinon';
import * as chaiSinon from 'sinon-chai';

export const sharedSandbox = () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  return sandbox;
};

chai.use(chaiSinon);
export const expect = chai.expect;
