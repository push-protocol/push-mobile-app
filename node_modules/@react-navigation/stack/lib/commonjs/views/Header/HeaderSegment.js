"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = HeaderSegment;

var _elements = require("@react-navigation/elements");

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _memoize = _interopRequireDefault(require("../../utils/memoize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function HeaderSegment(props) {
  const [leftLabelLayout, setLeftLabelLayout] = React.useState(undefined);
  const [titleLayout, setTitleLayout] = React.useState(undefined);

  const handleTitleLayout = e => {
    const {
      height,
      width
    } = e.nativeEvent.layout;
    setTitleLayout(titleLayout => {
      if (titleLayout && height === titleLayout.height && width === titleLayout.width) {
        return titleLayout;
      }

      return {
        height,
        width
      };
    });
  };

  const handleLeftLabelLayout = e => {
    const {
      height,
      width
    } = e.nativeEvent.layout;

    if (leftLabelLayout && height === leftLabelLayout.height && width === leftLabelLayout.width) {
      return;
    }

    setLeftLabelLayout({
      height,
      width
    });
  };

  const getInterpolatedStyle = (0, _memoize.default)((styleInterpolator, layout, current, next, titleLayout, leftLabelLayout, headerHeight) => styleInterpolator({
    current: {
      progress: current
    },
    next: next && {
      progress: next
    },
    layouts: {
      header: {
        height: headerHeight,
        width: layout.width
      },
      screen: layout,
      title: titleLayout,
      leftLabel: leftLabelLayout
    }
  }));
  const {
    progress,
    layout,
    modal,
    onGoBack,
    headerTitle: title,
    headerLeft: left = onGoBack ? props => /*#__PURE__*/React.createElement(_elements.HeaderBackButton, props) : undefined,
    headerRight: right,
    headerBackImage,
    headerBackTitle,
    headerBackTitleVisible = _reactNative.Platform.OS === 'ios',
    headerTruncatedBackTitle,
    headerBackAccessibilityLabel,
    headerBackTestID,
    headerBackAllowFontScaling,
    headerBackTitleStyle,
    headerTitleContainerStyle,
    headerLeftContainerStyle,
    headerRightContainerStyle,
    headerBackgroundContainerStyle,
    headerStyle: customHeaderStyle,
    headerStatusBarHeight,
    styleInterpolator,
    ...rest
  } = props;
  const defaultHeight = (0, _elements.getDefaultHeaderHeight)(layout, modal, headerStatusBarHeight);

  const {
    height = defaultHeight
  } = _reactNative.StyleSheet.flatten(customHeaderStyle || {});

  const {
    titleStyle,
    leftButtonStyle,
    leftLabelStyle,
    rightButtonStyle,
    backgroundStyle
  } = getInterpolatedStyle(styleInterpolator, layout, progress.current, progress.next, titleLayout, headerBackTitle ? leftLabelLayout : undefined, typeof height === 'number' ? height : defaultHeight);
  const headerLeft = left ? props => left({ ...props,
    backImage: headerBackImage,
    accessibilityLabel: headerBackAccessibilityLabel,
    testID: headerBackTestID,
    allowFontScaling: headerBackAllowFontScaling,
    onPress: onGoBack,
    label: headerBackTitle,
    truncatedLabel: headerTruncatedBackTitle,
    labelStyle: [leftLabelStyle, headerBackTitleStyle],
    onLabelLayout: handleLeftLabelLayout,
    screenLayout: layout,
    titleLayout,
    canGoBack: Boolean(onGoBack)
  }) : undefined;
  const headerRight = right ? props => right({ ...props,
    canGoBack: Boolean(onGoBack)
  }) : undefined;
  const headerTitle = typeof title !== 'function' ? props => /*#__PURE__*/React.createElement(_elements.HeaderTitle, _extends({}, props, {
    onLayout: handleTitleLayout
  })) : props => title({ ...props,
    onLayout: handleTitleLayout
  });
  return /*#__PURE__*/React.createElement(_elements.Header, _extends({
    modal: modal,
    layout: layout,
    headerTitle: headerTitle,
    headerLeft: headerLeft,
    headerLeftLabelVisible: headerBackTitleVisible,
    headerRight: headerRight,
    headerTitleContainerStyle: [titleStyle, headerTitleContainerStyle],
    headerLeftContainerStyle: [leftButtonStyle, headerLeftContainerStyle],
    headerRightContainerStyle: [rightButtonStyle, headerRightContainerStyle],
    headerBackgroundContainerStyle: [backgroundStyle, headerBackgroundContainerStyle],
    headerStyle: customHeaderStyle,
    headerStatusBarHeight: headerStatusBarHeight
  }, rest));
}
//# sourceMappingURL=HeaderSegment.js.map