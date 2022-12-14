"use strict";

exports.__esModule = true;
exports.setDefaultOptions = exports.getDefaultOptions = exports.default = void 0;

var _utils = require("./utils");

var _notToMatch = _interopRequireDefault(require("./matchers/notToMatch"));

var _notToMatchElement = _interopRequireDefault(require("./matchers/notToMatchElement"));

var _toClick = _interopRequireDefault(require("./matchers/toClick"));

var _toDisplayDialog = _interopRequireDefault(require("./matchers/toDisplayDialog"));

var _toFill = _interopRequireDefault(require("./matchers/toFill"));

var _toFillForm = _interopRequireDefault(require("./matchers/toFillForm"));

var _toMatch = _interopRequireDefault(require("./matchers/toMatch"));

var _toMatchElement = _interopRequireDefault(require("./matchers/toMatchElement"));

var _toSelect = _interopRequireDefault(require("./matchers/toSelect"));

var _toUploadFile = _interopRequireDefault(require("./matchers/toUploadFile"));

var _options = require("./options");

exports.setDefaultOptions = _options.setDefaultOptions;
exports.getDefaultOptions = _options.getDefaultOptions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-use-before-define, no-restricted-syntax, no-await-in-loop */
const pageMatchers = {
  toClick: _toClick.default,
  toDisplayDialog: _toDisplayDialog.default,
  toFill: _toFill.default,
  toFillForm: _toFillForm.default,
  toMatch: _toMatch.default,
  toMatchElement: _toMatchElement.default,
  toSelect: _toSelect.default,
  toUploadFile: _toUploadFile.default,
  not: {
    toMatch: _notToMatch.default,
    toMatchElement: _notToMatchElement.default
  }
};
const elementHandleMatchers = {
  toClick: _toClick.default,
  toFill: _toFill.default,
  toFillForm: _toFillForm.default,
  toMatch: _toMatch.default,
  toMatchElement: _toMatchElement.default,
  toSelect: _toSelect.default,
  toUploadFile: _toUploadFile.default,
  not: {
    toMatch: _notToMatch.default,
    toMatchElement: _notToMatchElement.default
  }
};

function createMatcher(matcher, page) {
  return async function throwingMatcher(...args) {
    if (typeof global.expect !== 'undefined') {
      global.expect.getState().assertionCalls += 1;
    }

    try {
      return await matcher(page, ...args);
    } catch (error) {
      Error.captureStackTrace(error, throwingMatcher);
      throw error;
    }
  };
}

function internalExpect(type, matchers) {
  const expectation = {
    not: {}
  };
  Object.keys(matchers).forEach(key => {
    if (key === 'not') return;
    expectation[key] = createMatcher(matchers[key], type);
  });
  Object.keys(matchers.not).forEach(key => {
    expectation.not[key] = createMatcher(matchers.not[key], type);
  });
  return expectation;
}

function expectPuppeteer(actual) {
  const type = (0, _utils.getPuppeteerType)(actual);

  switch (type) {
    case 'Page':
    case 'Frame':
      return internalExpect(actual, pageMatchers);

    case 'ElementHandle':
      return internalExpect(actual, elementHandleMatchers);

    default:
      throw new Error(`${actual} is not supported`);
  }
}

if (typeof global.expect !== 'undefined') {
  const originalExpect = global.expect;

  global.expect = (actual, ...args) => {
    const type = (0, _utils.getPuppeteerType)(actual);

    if (type) {
      const matchers = expectPuppeteer(actual);
      const jestMatchers = originalExpect(actual, ...args);
      return { ...jestMatchers,
        ...matchers,
        not: { ...jestMatchers.not,
          ...matchers.not
        }
      };
    }

    return originalExpect(actual, ...args);
  };

  Object.keys(originalExpect).forEach(prop => {
    global.expect[prop] = originalExpect[prop];
  });
}

var _default = expectPuppeteer;
exports.default = _default;