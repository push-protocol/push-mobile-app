import { getHeaderTitle, HeaderBackContext, HeaderHeightContext, HeaderShownContext } from '@react-navigation/elements';
import { useTheme } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import ModalPresentationContext from '../../utils/ModalPresentationContext';
import useKeyboardManager from '../../utils/useKeyboardManager';
import Card from './Card';
const EPSILON = 0.1;

function CardContainer(_ref) {
  let {
    interpolationIndex,
    index,
    active,
    closing,
    gesture,
    focused,
    modal,
    getPreviousScene,
    getFocusedRoute,
    headerDarkContent,
    hasAbsoluteFloatHeader,
    headerHeight,
    onHeaderHeightChange,
    isParentHeaderShown,
    isNextScreenTransparent,
    detachCurrentScreen,
    layout,
    onCloseRoute,
    onOpenRoute,
    onGestureCancel,
    onGestureEnd,
    onGestureStart,
    onTransitionEnd,
    onTransitionStart,
    renderHeader,
    renderScene,
    safeAreaInsetBottom,
    safeAreaInsetLeft,
    safeAreaInsetRight,
    safeAreaInsetTop,
    scene
  } = _ref;
  const parentHeaderHeight = React.useContext(HeaderHeightContext);
  const {
    onPageChangeStart,
    onPageChangeCancel,
    onPageChangeConfirm
  } = useKeyboardManager(React.useCallback(() => {
    const {
      options,
      navigation
    } = scene.descriptor;
    return navigation.isFocused() && options.keyboardHandlingEnabled !== false;
  }, [scene.descriptor]));

  const handleOpen = () => {
    const {
      route
    } = scene.descriptor;
    onTransitionEnd({
      route
    }, false);
    onOpenRoute({
      route
    });
  };

  const handleClose = () => {
    const {
      route
    } = scene.descriptor;
    onTransitionEnd({
      route
    }, true);
    onCloseRoute({
      route
    });
  };

  const handleGestureBegin = () => {
    const {
      route
    } = scene.descriptor;
    onPageChangeStart();
    onGestureStart({
      route
    });
  };

  const handleGestureCanceled = () => {
    const {
      route
    } = scene.descriptor;
    onPageChangeCancel();
    onGestureCancel({
      route
    });
  };

  const handleGestureEnd = () => {
    const {
      route
    } = scene.descriptor;
    onGestureEnd({
      route
    });
  };

  const handleTransition = _ref2 => {
    let {
      closing,
      gesture
    } = _ref2;
    const {
      route
    } = scene.descriptor;

    if (!gesture) {
      onPageChangeConfirm === null || onPageChangeConfirm === void 0 ? void 0 : onPageChangeConfirm(true);
    } else if (active && closing) {
      onPageChangeConfirm === null || onPageChangeConfirm === void 0 ? void 0 : onPageChangeConfirm(false);
    } else {
      onPageChangeCancel === null || onPageChangeCancel === void 0 ? void 0 : onPageChangeCancel();
    }

    onTransitionStart === null || onTransitionStart === void 0 ? void 0 : onTransitionStart({
      route
    }, closing);
  };

  const insets = {
    top: safeAreaInsetTop,
    right: safeAreaInsetRight,
    bottom: safeAreaInsetBottom,
    left: safeAreaInsetLeft
  };
  const {
    colors
  } = useTheme();
  const [pointerEvents, setPointerEvents] = React.useState('box-none');
  React.useEffect(() => {
    var _scene$progress$next, _scene$progress$next$;

    const listener = (_scene$progress$next = scene.progress.next) === null || _scene$progress$next === void 0 ? void 0 : (_scene$progress$next$ = _scene$progress$next.addListener) === null || _scene$progress$next$ === void 0 ? void 0 : _scene$progress$next$.call(_scene$progress$next, _ref3 => {
      let {
        value
      } = _ref3;
      setPointerEvents(value <= EPSILON ? 'box-none' : 'none');
    });
    return () => {
      if (listener) {
        var _scene$progress$next2, _scene$progress$next3;

        (_scene$progress$next2 = scene.progress.next) === null || _scene$progress$next2 === void 0 ? void 0 : (_scene$progress$next3 = _scene$progress$next2.removeListener) === null || _scene$progress$next3 === void 0 ? void 0 : _scene$progress$next3.call(_scene$progress$next2, listener);
      }
    };
  }, [pointerEvents, scene.progress.next]);
  const {
    presentation,
    animationEnabled,
    cardOverlay,
    cardOverlayEnabled,
    cardShadowEnabled,
    cardStyle,
    cardStyleInterpolator,
    gestureDirection,
    gestureEnabled,
    gestureResponseDistance,
    gestureVelocityImpact,
    headerMode,
    headerShown,
    transitionSpec
  } = scene.descriptor.options;
  const previousScene = getPreviousScene({
    route: scene.descriptor.route
  });
  let backTitle;

  if (previousScene) {
    const {
      options,
      route
    } = previousScene.descriptor;
    backTitle = getHeaderTitle(options, route.name);
  }

  const headerBack = React.useMemo(() => backTitle !== undefined ? {
    title: backTitle
  } : undefined, [backTitle]);
  return /*#__PURE__*/React.createElement(Card, {
    interpolationIndex: interpolationIndex,
    gestureDirection: gestureDirection,
    layout: layout,
    insets: insets,
    gesture: gesture,
    current: scene.progress.current,
    next: scene.progress.next,
    closing: closing,
    onOpen: handleOpen,
    onClose: handleClose,
    overlay: cardOverlay,
    overlayEnabled: cardOverlayEnabled,
    shadowEnabled: cardShadowEnabled,
    onTransition: handleTransition,
    onGestureBegin: handleGestureBegin,
    onGestureCanceled: handleGestureCanceled,
    onGestureEnd: handleGestureEnd,
    gestureEnabled: index === 0 ? false : gestureEnabled,
    gestureResponseDistance: gestureResponseDistance,
    gestureVelocityImpact: gestureVelocityImpact,
    transitionSpec: transitionSpec,
    styleInterpolator: cardStyleInterpolator,
    accessibilityElementsHidden: !focused,
    importantForAccessibility: focused ? 'auto' : 'no-hide-descendants',
    pointerEvents: active ? 'box-none' : pointerEvents,
    pageOverflowEnabled: headerMode !== 'float' && presentation !== 'modal',
    headerDarkContent: headerDarkContent,
    containerStyle: hasAbsoluteFloatHeader && headerMode !== 'screen' ? {
      marginTop: headerHeight
    } : null,
    contentStyle: [{
      backgroundColor: presentation === 'transparentModal' ? 'transparent' : colors.background
    }, cardStyle],
    style: [{
      // This is necessary to avoid unfocused larger pages increasing scroll area
      // The issue can be seen on the web when a smaller screen is pushed over a larger one
      overflow: active ? undefined : 'hidden',
      display: // Hide unfocused screens when animation isn't enabled
      // This is also necessary for a11y on web
      animationEnabled === false && isNextScreenTransparent === false && detachCurrentScreen !== false && !focused ? 'none' : 'flex'
    }, StyleSheet.absoluteFill]
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(ModalPresentationContext.Provider, {
    value: modal
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.scene
  }, /*#__PURE__*/React.createElement(HeaderBackContext.Provider, {
    value: headerBack
  }, /*#__PURE__*/React.createElement(HeaderShownContext.Provider, {
    value: isParentHeaderShown || headerShown !== false
  }, /*#__PURE__*/React.createElement(HeaderHeightContext.Provider, {
    value: headerShown ? headerHeight : parentHeaderHeight !== null && parentHeaderHeight !== void 0 ? parentHeaderHeight : 0
  }, renderScene({
    route: scene.descriptor.route
  }))))), headerMode !== 'float' ? renderHeader({
    mode: 'screen',
    layout,
    scenes: [previousScene, scene],
    getPreviousScene,
    getFocusedRoute,
    onContentHeightChange: onHeaderHeightChange
  }) : null)));
}

export default /*#__PURE__*/React.memo(CardContainer);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse'
  },
  scene: {
    flex: 1
  }
});
//# sourceMappingURL=CardContainer.js.map