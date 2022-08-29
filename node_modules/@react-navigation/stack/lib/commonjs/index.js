"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CardAnimationContext", {
  enumerable: true,
  get: function () {
    return _CardAnimationContext.default;
  }
});
exports.CardStyleInterpolators = void 0;
Object.defineProperty(exports, "GestureHandlerRefContext", {
  enumerable: true,
  get: function () {
    return _GestureHandlerRefContext.default;
  }
});
Object.defineProperty(exports, "Header", {
  enumerable: true,
  get: function () {
    return _Header.default;
  }
});
exports.HeaderStyleInterpolators = void 0;
Object.defineProperty(exports, "StackView", {
  enumerable: true,
  get: function () {
    return _StackView.default;
  }
});
exports.TransitionSpecs = exports.TransitionPresets = void 0;
Object.defineProperty(exports, "createStackNavigator", {
  enumerable: true,
  get: function () {
    return _createStackNavigator.default;
  }
});
Object.defineProperty(exports, "useCardAnimation", {
  enumerable: true,
  get: function () {
    return _useCardAnimation.default;
  }
});
Object.defineProperty(exports, "useGestureHandlerRef", {
  enumerable: true,
  get: function () {
    return _useGestureHandlerRef.default;
  }
});

var CardStyleInterpolators = _interopRequireWildcard(require("./TransitionConfigs/CardStyleInterpolators"));

exports.CardStyleInterpolators = CardStyleInterpolators;

var HeaderStyleInterpolators = _interopRequireWildcard(require("./TransitionConfigs/HeaderStyleInterpolators"));

exports.HeaderStyleInterpolators = HeaderStyleInterpolators;

var TransitionPresets = _interopRequireWildcard(require("./TransitionConfigs/TransitionPresets"));

exports.TransitionPresets = TransitionPresets;

var TransitionSpecs = _interopRequireWildcard(require("./TransitionConfigs/TransitionSpecs"));

exports.TransitionSpecs = TransitionSpecs;

var _createStackNavigator = _interopRequireDefault(require("./navigators/createStackNavigator"));

var _Header = _interopRequireDefault(require("./views/Header/Header"));

var _StackView = _interopRequireDefault(require("./views/Stack/StackView"));

var _CardAnimationContext = _interopRequireDefault(require("./utils/CardAnimationContext"));

var _GestureHandlerRefContext = _interopRequireDefault(require("./utils/GestureHandlerRefContext"));

var _useCardAnimation = _interopRequireDefault(require("./utils/useCardAnimation"));

var _useGestureHandlerRef = _interopRequireDefault(require("./utils/useGestureHandlerRef"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//# sourceMappingURL=index.js.map