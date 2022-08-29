function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { getHeaderTitle, HeaderShownContext } from '@react-navigation/elements';
import { StackActions } from '@react-navigation/native';
import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import debounce from '../../utils/debounce';
import ModalPresentationContext from '../../utils/ModalPresentationContext';
import HeaderSegment from './HeaderSegment';
export default /*#__PURE__*/React.memo(function Header(_ref) {
  let {
    back,
    layout,
    progress,
    options,
    route,
    navigation,
    styleInterpolator
  } = _ref;
  const insets = useSafeAreaInsets();
  let previousTitle; // The label for the left back button shows the title of the previous screen
  // If a custom label is specified, we use it, otherwise use previous screen's title

  if (options.headerBackTitle !== undefined) {
    previousTitle = options.headerBackTitle;
  } else if (back) {
    previousTitle = back.title;
  } // eslint-disable-next-line react-hooks/exhaustive-deps


  const goBack = React.useCallback(debounce(() => {
    if (navigation.isFocused() && navigation.canGoBack()) {
      navigation.dispatch({ ...StackActions.pop(),
        source: route.key
      });
    }
  }, 50), [navigation, route.key]);
  const isModal = React.useContext(ModalPresentationContext);
  const isParentHeaderShown = React.useContext(HeaderShownContext);
  const statusBarHeight = options.headerStatusBarHeight !== undefined ? options.headerStatusBarHeight : isModal || isParentHeaderShown ? 0 : insets.top;
  return /*#__PURE__*/React.createElement(HeaderSegment, _extends({}, options, {
    title: getHeaderTitle(options, route.name),
    progress: progress,
    layout: layout,
    modal: isModal,
    headerBackTitle: options.headerBackTitle !== undefined ? options.headerBackTitle : previousTitle,
    headerStatusBarHeight: statusBarHeight,
    onGoBack: back ? goBack : undefined,
    styleInterpolator: styleInterpolator
  }));
});
//# sourceMappingURL=Header.js.map