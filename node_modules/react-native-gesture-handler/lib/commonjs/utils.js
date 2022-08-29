"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArray = toArray;
exports.withPrevAndCurrent = withPrevAndCurrent;
exports.hasProperty = hasProperty;
exports.isJestEnv = isJestEnv;
exports.tagMessage = tagMessage;
exports.isFabric = isFabric;
exports.shouldUseCodegenNativeComponent = shouldUseCodegenNativeComponent;
exports.isRemoteDebuggingEnabled = isRemoteDebuggingEnabled;

var _package = _interopRequireDefault(require("react-native/package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rnVersion = _package.default.version;

function toArray(object) {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}

function withPrevAndCurrent(array, mapFn) {
  const previousArr = [null];
  const currentArr = [...array];
  const transformedArr = [];
  currentArr.forEach((current, i) => {
    const previous = previousArr[i];
    const transformed = mapFn(previous, current);
    previousArr.push(transformed);
    transformedArr.push(transformed);
  });
  return transformedArr;
} // eslint-disable-next-line @typescript-eslint/ban-types


function hasProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isJestEnv() {
  // @ts-ignore Do not use `@types/node` because it will prioritise Node types over RN types which breaks the types (ex. setTimeout) in React Native projects.
  return hasProperty(global, 'process') && !!process.env.JEST_WORKER_ID;
}

function tagMessage(msg) {
  return `[react-native-gesture-handler] ${msg}`;
} // helper method to check whether Fabric is enabled, however global.nativeFabricUIManager
// may not be initialized before the first render


function isFabric() {
  var _global;

  // @ts-expect-error nativeFabricUIManager is not yet included in the RN types
  return !!((_global = global) !== null && _global !== void 0 && _global.nativeFabricUIManager);
}

function shouldUseCodegenNativeComponent() {
  const [majorStr, minorStr] = rnVersion.split('.');
  const major = Number.parseInt(majorStr);
  const minor = Number.parseInt(minorStr); // use codegenNativeComponent starting with RN 0.68

  return minor >= 68 || major > 0;
}

function isRemoteDebuggingEnabled() {
  // react-native-reanimated checks if in remote debugging in the same way
  // @ts-ignore global is available but node types are not included
  return !global.nativeCallSyncHook || global.__REMOTEDEV__;
}
//# sourceMappingURL=utils.js.map