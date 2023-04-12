const { moduleAutoMatch } = require('@libs/discovery/utils');
const sinon = require('sinon');

before(() => {
  moduleAutoMatch();
});
beforeEach(function () {
  this.sinnon = sinon.createSandbox();
});

afterEach(function () {
  this.sinnon.restore();
});
