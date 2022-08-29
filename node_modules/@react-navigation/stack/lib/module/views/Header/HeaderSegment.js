function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { getDefaultHeaderHeight, Header, HeaderBackButton, HeaderTitle } from '@react-navigation/elements';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import memoize from '../../utils/memoize';
export default function HeaderSegment(props) {
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

  const getInterpolatedStyle = memoize((styleInterpolator, layout, current, next, titleLayout, leftLabelLayout, headerHeight) => styleInterpolator({
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
    headerLeft: left = onGoBack ? props => /*#__PURE__*/React.createElement(HeaderBackButton, props) : undefined,
    headerRight: right,
    headerBackImage,
    headerBackTitle,
    headerBackTitleVisible = Platform.OS === 'ios',
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
  const defaultHeight = getDefaultHeaderHeight(layout, modal, headerStatusBarHeight);
  const {
    height = defaultHeight
  } = StyleSheet.flatten(customHeaderStyle || {});
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
  const headerTitle = typeof title !== 'function' ? props => /*#__PURE__*/React.createElement(HeaderTitle, _extends({}, props, {
    onLayout: handleTitleLayout
  })) : props => title({ ...props,
    onLayout: handleTitleLayout
  });
  return /*#__PURE__*/React.createElement(Header, _extends({
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