const { TestEnvironment } = require('jest-environment-jsdom');

// jsdom, plus the web APIs that Node has but jsdom lacks. React Router uses them when navigating.
module.exports = class JsdomWithNodeApis extends TestEnvironment {
  constructor(...args) {
    super(...args);
    Object.assign(this.global, { Request, Response, Headers, TextEncoder });
  }
};
