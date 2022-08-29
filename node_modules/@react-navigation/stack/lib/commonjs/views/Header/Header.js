"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _elements = require("@react-navigation/elements");

var _native = require("@react-navigation/native");

var React = _interopRequireWildcard(require("react"));

var _reactNativeSafeAreaContext = require("react-native-safe-area-context");

var _debounce = _interopRequireDefault(require("../../utils/debounce"));

var _ModalPresentationContext = _interopRequireDefault(require("../../utils/ModalPresentationContext"));

var _HeaderSegment = _interopRequireDefault(require("./HeaderSegment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var _default = /*#__PURE__*/React.memo(function Header(_ref) {
  let {
    back,
    layout,
    progress,
    options,
    route,
    navigation,
    styleInterpolator
  } = _ref;
  const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
  let previousTitle; // The label for the left back button shows the title of the previous screen
  // If a custom label is specified, we use it, otherwise use previous screen's title

  if (options.headerBackTitle !== undefined) {
    previousTitle = options.headerBackTitle;
  } else if (back) {
    previousTitle = back.title;
  } // eslint-disable-next-line react-hooks/exhaustive-deps


  const goBack = React.useCallback((0, _debounce.default)(() => {
    if (navigation.isFocused() && navigation.canGoBack()) {
      navigation.dispatch({ ..._native.StackActions.pop(),
        source: route.key
      });
    }
  }, 50), [navigation, route.key]);
  const isModal = React.useContext(_ModalPresentationContext.default);
  const isParentHeaderShown = React.useContext(_elements.HeaderShownContext);
  const statusBarHeight = options.headerStatusBarHeight !== undefined ? options.headerStatusBarHeight : isModal || isParentHeaderShown ? 0 : insets.top;
  return /*#__PURE__*/React.createElement(_HeaderSegment.default, _extends({}, options, {
    title: (0, _elements.getHeaderTitle)(options, route.name),
    progress: progress,
    layout: layout,
    modal: isModal,
    headerBackTitle: options.headerBackTitle !== undefined ? options.headerBackTitle : previousTitle,
    headerStatusBarHeight: statusBarHeight,
    onGoBack: back ? goBack : undefined,
    styleInterpolator: styleInterpolator
  }));
});

exports.default = _default;
//# sourceMappingURL=Header.js.map