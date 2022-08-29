"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ModalStatusBarManager;

var _native = require("@react-navigation/native");

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ModalStatusBarManager(_ref) {
  var _flattenedStyle$trans, _flattenedStyle$trans2;

  let {
    dark,
    layout,
    insets,
    style
  } = _ref;
  const {
    dark: darkTheme
  } = (0, _native.useTheme)();
  const [overlapping, setOverlapping] = React.useState(true);
  const scale = 1 - 20 / layout.width;
  const offset = (insets.top - 34) * scale;

  const flattenedStyle = _reactNative.StyleSheet.flatten(style);

  const translateY = flattenedStyle === null || flattenedStyle === void 0 ? void 0 : (_flattenedStyle$trans = flattenedStyle.transform) === null || _flattenedStyle$trans === void 0 ? void 0 : (_flattenedStyle$trans2 = _flattenedStyle$trans.find(s => s.translateY !== undefined)) === null || _flattenedStyle$trans2 === void 0 ? void 0 : _flattenedStyle$trans2.translateY;
  React.useEffect(() => {
    const listener = _ref2 => {
      let {
        value
      } = _ref2;
      setOverlapping(value < offset);
    };

    const sub = translateY === null || translateY === void 0 ? void 0 : translateY.addListener(listener);
    return () => translateY === null || translateY === void 0 ? void 0 : translateY.removeListener(sub);
  }, [offset, translateY]);
  const darkContent = dark !== null && dark !== void 0 ? dark : !darkTheme;
  return /*#__PURE__*/React.createElement(_reactNative.StatusBar, {
    animated: true,
    barStyle: overlapping && darkContent ? 'dark-content' : 'light-content'
  });
}
//# sourceMappingURL=ModalStatusBarManager.js.map