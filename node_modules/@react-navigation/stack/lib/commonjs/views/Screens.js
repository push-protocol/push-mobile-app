"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MaybeScreenContainer = exports.MaybeScreen = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

let Screens;

try {
  Screens = require('react-native-screens');
} catch (e) {// Ignore
}

const MaybeScreenContainer = _ref => {
  let {
    enabled,
    ...rest
  } = _ref;

  if (Screens != null) {
    return /*#__PURE__*/React.createElement(Screens.ScreenContainer, _extends({
      enabled: enabled
    }, rest));
  }

  return /*#__PURE__*/React.createElement(_reactNative.View, rest);
};

exports.MaybeScreenContainer = MaybeScreenContainer;

const MaybeScreen = _ref2 => {
  let {
    enabled,
    active,
    ...rest
  } = _ref2;

  if (Screens != null) {
    return /*#__PURE__*/React.createElement(Screens.Screen, _extends({
      enabled: enabled,
      activityState: active
    }, rest));
  }

  return /*#__PURE__*/React.createElement(_reactNative.View, rest);
};

exports.MaybeScreen = MaybeScreen;
//# sourceMappingURL=Screens.js.map