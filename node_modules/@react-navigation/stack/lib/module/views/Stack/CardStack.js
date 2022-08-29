function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Background, getDefaultHeaderHeight, SafeAreaProviderCompat } from '@react-navigation/elements';
import Color from 'color';
import * as React from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { forModalPresentationIOS, forNoAnimation as forNoAnimationCard } from '../../TransitionConfigs/CardStyleInterpolators';
import { DefaultTransition, ModalFadeTransition, ModalTransition } from '../../TransitionConfigs/TransitionPresets';
import getDistanceForDirection from '../../utils/getDistanceForDirection';
import { MaybeScreen, MaybeScreenContainer } from '../Screens';
import { getIsModalPresentation } from './Card';
import CardContainer from './CardContainer';
const EPSILON = 0.01;
const STATE_INACTIVE = 0;
const STATE_TRANSITIONING_OR_BELOW_TOP = 1;
const STATE_ON_TOP = 2;
const FALLBACK_DESCRIPTOR = Object.freeze({
  options: {}
});

const getInterpolationIndex = (scenes, index) => {
  const {
    cardStyleInterpolator
  } = scenes[index].descriptor.options; // Start from current card and count backwards the number of cards with same interpolation

  let interpolationIndex = 0;

  for (let i = index - 1; i >= 0; i--) {
    var _scenes$i;

    const cardStyleInterpolatorCurrent = (_scenes$i = scenes[i]) === null || _scenes$i === void 0 ? void 0 : _scenes$i.descriptor.options.cardStyleInterpolator;

    if (cardStyleInterpolatorCurrent !== cardStyleInterpolator) {
      break;
    }

    interpolationIndex++;
  }

  return interpolationIndex;
};

const getIsModal = (scene, interpolationIndex, isParentModal) => {
  if (isParentModal) {
    return true;
  }

  const {
    cardStyleInterpolator
  } = scene.descriptor.options;
  const isModalPresentation = getIsModalPresentation(cardStyleInterpolator);
  const isModal = isModalPresentation && interpolationIndex !== 0;
  return isModal;
};

const getHeaderHeights = (scenes, insets, isParentHeaderShown, isParentModal, layout, previous) => {
  return scenes.reduce((acc, curr, index) => {
    const {
      headerStatusBarHeight = isParentHeaderShown ? 0 : insets.top,
      headerStyle
    } = curr.descriptor.options;
    const style = StyleSheet.flatten(headerStyle || {});
    const height = 'height' in style && typeof style.height === 'number' ? style.height : previous[curr.route.key];
    const interpolationIndex = getInterpolationIndex(scenes, index);
    const isModal = getIsModal(curr, interpolationIndex, isParentModal);
    acc[curr.route.key] = typeof height === 'number' ? height : getDefaultHeaderHeight(layout, isModal, headerStatusBarHeight);
    return acc;
  }, {});
};

const getDistanceFromOptions = (layout, descriptor) => {
  const {
    presentation,
    gestureDirection = presentation === 'modal' ? ModalTransition.gestureDirection : DefaultTransition.gestureDirection
  } = (descriptor === null || descriptor === void 0 ? void 0 : descriptor.options) || {};
  return getDistanceForDirection(layout, gestureDirection);
};

const getProgressFromGesture = (gesture, layout, descriptor) => {
  const distance = getDistanceFromOptions({
    // Make sure that we have a non-zero distance, otherwise there will be incorrect progress
    // This causes blank screen on web if it was previously inside container with display: none
    width: Math.max(1, layout.width),
    height: Math.max(1, layout.height)
  }, descriptor);

  if (distance > 0) {
    return gesture.interpolate({
      inputRange: [0, distance],
      outputRange: [1, 0]
    });
  }

  return gesture.interpolate({
    inputRange: [distance, 0],
    outputRange: [0, 1]
  });
};

export default class CardStack extends React.Component {
  static getDerivedStateFromProps(props, state) {
    if (props.routes === state.routes && props.descriptors === state.descriptors) {
      return null;
    }

    const gestures = props.routes.reduce((acc, curr) => {
      const descriptor = props.descriptors[curr.key];
      const {
        animationEnabled
      } = (descriptor === null || descriptor === void 0 ? void 0 : descriptor.options) || {};
      acc[curr.key] = state.gestures[curr.key] || new Animated.Value(props.openingRouteKeys.includes(curr.key) && animationEnabled !== false ? getDistanceFromOptions(state.layout, descriptor) : 0);
      return acc;
    }, {});
    const scenes = props.routes.map((route, index, self) => {
      var _descriptor$options$h;

      const previousRoute = self[index - 1];
      const nextRoute = self[index + 1];
      const oldScene = state.scenes[index];
      const currentGesture = gestures[route.key];
      const previousGesture = previousRoute ? gestures[previousRoute.key] : undefined;
      const nextGesture = nextRoute ? gestures[nextRoute.key] : undefined;
      const descriptor = props.descriptors[route.key] || state.descriptors[route.key] || (oldScene ? oldScene.descriptor : FALLBACK_DESCRIPTOR);
      const nextDescriptor = props.descriptors[nextRoute === null || nextRoute === void 0 ? void 0 : nextRoute.key] || state.descriptors[nextRoute === null || nextRoute === void 0 ? void 0 : nextRoute.key];
      const previousDescriptor = props.descriptors[previousRoute === null || previousRoute === void 0 ? void 0 : previousRoute.key] || state.descriptors[previousRoute === null || previousRoute === void 0 ? void 0 : previousRoute.key]; // When a screen is not the last, it should use next screen's transition config
      // Many transitions also animate the previous screen, so using 2 different transitions doesn't look right
      // For example combining a slide and a modal transition would look wrong otherwise
      // With this approach, combining different transition styles in the same navigator mostly looks right
      // This will still be broken when 2 transitions have different idle state (e.g. modal presentation),
      // but majority of the transitions look alright

      const optionsForTransitionConfig = index !== self.length - 1 && nextDescriptor && nextDescriptor.options.presentation !== 'transparentModal' ? nextDescriptor.options : descriptor.options;
      let defaultTransitionPreset = optionsForTransitionConfig.presentation === 'modal' ? ModalTransition : optionsForTransitionConfig.presentation === 'transparentModal' ? ModalFadeTransition : DefaultTransition;
      const {
        animationEnabled = Platform.OS !== 'web' && Platform.OS !== 'windows' && Platform.OS !== 'macos',
        gestureEnabled = Platform.OS === 'ios' && animationEnabled,
        gestureDirection = defaultTransitionPreset.gestureDirection,
        transitionSpec = defaultTransitionPreset.transitionSpec,
        cardStyleInterpolator = animationEnabled === false ? forNoAnimationCard : defaultTransitionPreset.cardStyleInterpolator,
        headerStyleInterpolator = defaultTransitionPreset.headerStyleInterpolator,
        cardOverlayEnabled = Platform.OS !== 'ios' && optionsForTransitionConfig.presentation !== 'transparentModal' || getIsModalPresentation(cardStyleInterpolator)
      } = optionsForTransitionConfig;
      const headerMode = (_descriptor$options$h = descriptor.options.headerMode) !== null && _descriptor$options$h !== void 0 ? _descriptor$options$h : !(optionsForTransitionConfig.presentation === 'modal' || optionsForTransitionConfig.presentation === 'transparentModal' || (nextDescriptor === null || nextDescriptor === void 0 ? void 0 : nextDescriptor.options.presentation) === 'modal' || (nextDescriptor === null || nextDescriptor === void 0 ? void 0 : nextDescriptor.options.presentation) === 'transparentModal' || getIsModalPresentation(cardStyleInterpolator)) && Platform.OS === 'ios' && descriptor.options.header === undefined ? 'float' : 'screen';
      const scene = {
        route,
        descriptor: { ...descriptor,
          options: { ...descriptor.options,
            animationEnabled,
            cardOverlayEnabled,
            cardStyleInterpolator,
            gestureDirection,
            gestureEnabled,
            headerStyleInterpolator,
            transitionSpec,
            headerMode
          }
        },
        progress: {
          current: getProgressFromGesture(currentGesture, state.layout, descriptor),
          next: nextGesture && (nextDescriptor === null || nextDescriptor === void 0 ? void 0 : nextDescriptor.options.presentation) !== 'transparentModal' ? getProgressFromGesture(nextGesture, state.layout, nextDescriptor) : undefined,
          previous: previousGesture ? getProgressFromGesture(previousGesture, state.layout, previousDescriptor) : undefined
        },
        __memo: [state.layout, descriptor, nextDescriptor, previousDescriptor, currentGesture, nextGesture, previousGesture]
      };

      if (oldScene && scene.__memo.every((it, i) => {
        // @ts-expect-error: we haven't added __memo to the annotation to prevent usage elsewhere
        return oldScene.__memo[i] === it;
      })) {
        return oldScene;
      }

      return scene;
    });
    return {
      routes: props.routes,
      scenes,
      gestures,
      descriptors: props.descriptors,
      headerHeights: getHeaderHeights(scenes, props.insets, props.isParentHeaderShown, props.isParentModal, state.layout, state.headerHeights)
    };
  }

  constructor(_props) {
    super(_props);

    _defineProperty(this, "handleLayout", e => {
      const {
        height,
        width
      } = e.nativeEvent.layout;
      const layout = {
        width,
        height
      };
      this.setState((state, props) => {
        if (height === state.layout.height && width === state.layout.width) {
          return null;
        }

        return {
          layout,
          headerHeights: getHeaderHeights(state.scenes, props.insets, props.isParentHeaderShown, props.isParentModal, layout, state.headerHeights)
        };
      });
    });

    _defineProperty(this, "handleHeaderLayout", _ref => {
      let {
        route,
        height
      } = _ref;
      this.setState(_ref2 => {
        let {
          headerHeights
        } = _ref2;
        const previousHeight = headerHeights[route.key];

        if (previousHeight === height) {
          return null;
        }

        return {
          headerHeights: { ...headerHeights,
            [route.key]: height
          }
        };
      });
    });

    _defineProperty(this, "getFocusedRoute", () => {
      const {
        state
      } = this.props;
      return state.routes[state.index];
    });

    _defineProperty(this, "getPreviousScene", _ref3 => {
      let {
        route
      } = _ref3;
      const {
        getPreviousRoute
      } = this.props;
      const {
        scenes
      } = this.state;
      const previousRoute = getPreviousRoute({
        route
      });

      if (previousRoute) {
        const previousScene = scenes.find(scene => scene.descriptor.route.key === previousRoute.key);
        return previousScene;
      }

      return undefined;
    });

    this.state = {
      routes: [],
      scenes: [],
      gestures: {},
      layout: SafeAreaProviderCompat.initialMetrics.frame,
      descriptors: this.props.descriptors,
      // Used when card's header is null and mode is float to make transition
      // between screens with headers and those without headers smooth.
      // This is not a great heuristic here. We don't know synchronously
      // on mount what the header height is so we have just used the most
      // common cases here.
      headerHeights: {}
    };
  }

  render() {
    const {
      insets,
      state,
      routes,
      closingRouteKeys,
      onOpenRoute,
      onCloseRoute,
      renderHeader,
      renderScene,
      isParentHeaderShown,
      isParentModal,
      onTransitionStart,
      onTransitionEnd,
      onGestureStart,
      onGestureEnd,
      onGestureCancel,
      detachInactiveScreens = Platform.OS === 'web' || Platform.OS === 'android' || Platform.OS === 'ios'
    } = this.props;
    const {
      scenes,
      layout,
      gestures,
      headerHeights
    } = this.state;
    const focusedRoute = state.routes[state.index];
    const focusedHeaderHeight = headerHeights[focusedRoute.key];
    const isFloatHeaderAbsolute = this.state.scenes.slice(-2).some(scene => {
      var _scene$descriptor$opt;

      const options = (_scene$descriptor$opt = scene.descriptor.options) !== null && _scene$descriptor$opt !== void 0 ? _scene$descriptor$opt : {};
      const {
        headerMode,
        headerTransparent,
        headerShown = true
      } = options;

      if (headerTransparent || headerShown === false || headerMode === 'screen') {
        return true;
      }

      return false;
    });
    let activeScreensLimit = 1;

    for (let i = scenes.length - 1; i >= 0; i--) {
      const {
        options
      } = scenes[i].descriptor;
      const {
        // By default, we don't want to detach the previous screen of the active one for modals
        detachPreviousScreen = options.presentation === 'transparentModal' ? false : getIsModalPresentation(options.cardStyleInterpolator) ? i !== scenes.map(scene => scene.descriptor.options.cardStyleInterpolator).lastIndexOf(forModalPresentationIOS) : true
      } = options;

      if (detachPreviousScreen === false) {
        activeScreensLimit++;
      } else {
        // Check at least last 2 screens before stopping
        // This will make sure that screen isn't detached when another screen is animating on top of the transparent one
        // For example, (Opaque -> Transparent -> Opaque)
        if (i <= scenes.length - 2) {
          break;
        }
      }
    }

    const floatingHeader = /*#__PURE__*/React.createElement(React.Fragment, {
      key: "header"
    }, renderHeader({
      mode: 'float',
      layout,
      scenes,
      getPreviousScene: this.getPreviousScene,
      getFocusedRoute: this.getFocusedRoute,
      onContentHeightChange: this.handleHeaderLayout,
      style: [styles.floating, isFloatHeaderAbsolute && [// Without this, the header buttons won't be touchable on Android when headerTransparent: true
      {
        height: focusedHeaderHeight
      }, styles.absolute]]
    }));
    return /*#__PURE__*/React.createElement(Background, null, isFloatHeaderAbsolute ? null : floatingHeader, /*#__PURE__*/React.createElement(MaybeScreenContainer, {
      enabled: detachInactiveScreens,
      style: styles.container,
      onLayout: this.handleLayout
    }, routes.map((route, index, self) => {
      var _scenes, _scenes2;

      const focused = focusedRoute.key === route.key;
      const gesture = gestures[route.key];
      const scene = scenes[index]; // For the screens that shouldn't be active, the value is 0
      // For those that should be active, but are not the top screen, the value is 1
      // For those on top of the stack and with interaction enabled, the value is 2
      // For the old implementation, it stays the same it was

      let isScreenActive = 1;

      if (index < self.length - activeScreensLimit - 1) {
        // screen should be inactive because it is too deep in the stack
        isScreenActive = STATE_INACTIVE;
      } else {
        const sceneForActivity = scenes[self.length - 1];
        const outputValue = index === self.length - 1 ? STATE_ON_TOP // the screen is on top after the transition
        : index >= self.length - activeScreensLimit ? STATE_TRANSITIONING_OR_BELOW_TOP // the screen should stay active after the transition, it is not on top but is in activeLimit
        : STATE_INACTIVE; // the screen should be active only during the transition, it is at the edge of activeLimit

        isScreenActive = sceneForActivity ? sceneForActivity.progress.current.interpolate({
          inputRange: [0, 1 - EPSILON, 1],
          outputRange: [1, 1, outputValue],
          extrapolate: 'clamp'
        }) : STATE_TRANSITIONING_OR_BELOW_TOP;
      }

      const {
        headerShown = true,
        headerTransparent,
        headerStyle,
        headerTintColor
      } = scene.descriptor.options;
      const safeAreaInsetTop = insets.top;
      const safeAreaInsetRight = insets.right;
      const safeAreaInsetBottom = insets.bottom;
      const safeAreaInsetLeft = insets.left;
      const headerHeight = headerShown !== false ? headerHeights[route.key] : 0;
      let headerDarkContent;

      if (headerShown) {
        if (typeof headerTintColor === 'string') {
          headerDarkContent = Color(headerTintColor).isDark();
        } else {
          const flattenedHeaderStyle = StyleSheet.flatten(headerStyle);

          if (flattenedHeaderStyle && 'backgroundColor' in flattenedHeaderStyle && typeof flattenedHeaderStyle.backgroundColor === 'string') {
            headerDarkContent = !Color(flattenedHeaderStyle.backgroundColor).isDark();
          }
        }
      } // Start from current card and count backwards the number of cards with same interpolation


      const interpolationIndex = getInterpolationIndex(scenes, index);
      const isModal = getIsModal(scene, interpolationIndex, isParentModal);
      const isNextScreenTransparent = ((_scenes = scenes[index + 1]) === null || _scenes === void 0 ? void 0 : _scenes.descriptor.options.presentation) === 'transparentModal';
      const detachCurrentScreen = ((_scenes2 = scenes[index + 1]) === null || _scenes2 === void 0 ? void 0 : _scenes2.descriptor.options.detachPreviousScreen) !== false;
      return /*#__PURE__*/React.createElement(MaybeScreen, {
        key: route.key,
        style: StyleSheet.absoluteFill,
        enabled: detachInactiveScreens,
        active: isScreenActive,
        pointerEvents: "box-none"
      }, /*#__PURE__*/React.createElement(CardContainer, {
        index: index,
        interpolationIndex: interpolationIndex,
        modal: isModal,
        active: index === self.length - 1,
        focused: focused,
        closing: closingRouteKeys.includes(route.key),
        layout: layout,
        gesture: gesture,
        scene: scene,
        safeAreaInsetTop: safeAreaInsetTop,
        safeAreaInsetRight: safeAreaInsetRight,
        safeAreaInsetBottom: safeAreaInsetBottom,
        safeAreaInsetLeft: safeAreaInsetLeft,
        onGestureStart: onGestureStart,
        onGestureCancel: onGestureCancel,
        onGestureEnd: onGestureEnd,
        headerHeight: headerHeight,
        isParentHeaderShown: isParentHeaderShown,
        onHeaderHeightChange: this.handleHeaderLayout,
        getPreviousScene: this.getPreviousScene,
        getFocusedRoute: this.getFocusedRoute,
        headerDarkContent: headerDarkContent,
        hasAbsoluteFloatHeader: isFloatHeaderAbsolute && !headerTransparent,
        renderHeader: renderHeader,
        renderScene: renderScene,
        onOpenRoute: onOpenRoute,
        onCloseRoute: onCloseRoute,
        onTransitionStart: onTransitionStart,
        onTransitionEnd: onTransitionEnd,
        isNextScreenTransparent: isNextScreenTransparent,
        detachCurrentScreen: detachCurrentScreen
      }));
    })), isFloatHeaderAbsolute ? floatingHeader : null);
  }

}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  floating: {
    zIndex: 1
  }
});
//# sourceMappingURL=CardStack.js.map