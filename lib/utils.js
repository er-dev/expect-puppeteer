"use strict";

exports.__esModule = true;
exports.getPuppeteerType = exports.getContext = exports.expandSearchExpr = exports.enhanceError = void 0;

const getPuppeteerType = instance => {
  if (instance && instance.constructor && instance.constructor.name && ['Page', 'CDPPage', 'Frame', 'ElementHandle'].includes(instance.constructor.name) && instance.$) {
    return instance.constructor.name === 'CDPPage' ? 'Page' : instance.constructor.name;
  }

  return null;
};

exports.getPuppeteerType = getPuppeteerType;

const getContext = async (instance, pageFunction) => {
  const type = getPuppeteerType(instance);

  switch (type) {
    case 'Page':
    case 'Frame':
      return {
        page: instance,
        handle: await instance.evaluateHandle(pageFunction)
      };

    case 'ElementHandle':
      {
        return {
          page: instance.frame,
          handle: instance
        };
      }

    default:
      throw new Error(`${type} is not implemented`);
  }
};

exports.getContext = getContext;

const enhanceError = (error, message) => {
  error.message = `${message}\n${error.message}`;
  return error;
};

exports.enhanceError = enhanceError;

const isRegExp = input => Object.prototype.toString.call(input) === '[object RegExp]';

const expandSearchExpr = expr => {
  if (isRegExp(expr)) return {
    text: null,
    regexp: expr.toString()
  };
  if (typeof expr === 'string') return {
    text: expr,
    regexp: null
  };
  return {
    text: null,
    regexp: null
  };
};

exports.expandSearchExpr = expandSearchExpr;