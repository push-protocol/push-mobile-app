function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Color from 'color';
import * as React from 'react';
import { Animated, InteractionManager, Platform, StyleSheet, View } from 'react-native';
import { forModalPresentationIOS } from '../../TransitionConfigs/CardStyleInterpolators';
import CardAnimationContext from '../../utils/CardAnimationContext';
import getDistanceForDirection from '../../utils/getDistanceForDirection';
import getInvertedMultiplier from '../../utils/getInvertedMultiplier';
import memoize from '../../utils/memoize';
import { GestureState, PanGestureHandler } from '../GestureHandler';
import ModalStatusBarManager from '../ModalStatusBarManager';
import CardSheet from './CardSheet';
const GESTURE_VELOCITY_IMPACT = 0.3;
const TRUE = 1;
const FALSE = 0;
/**
 * The distance of touch start from the edge of the screen where the gesture will be recognized
 */

const GESTURE_RESPONSE_DISTANCE_HORIZONTAL = 50;
const GESTURE_RESPONSE_DISTANCE_VERTICAL = 135;
const useNativeDriver = Platform.OS !== 'web';

const hasOpacityStyle = style => {
  if (style) {
    const flattenedStyle = StyleSheet.flatten(style);
    return flattenedStyle.opacity != null;
  }

  return false;
};

export default class Card extends React.Component {
  constructor() {
    super(...arguments);

    _defineProperty(this, "isCurrentlyMounted", false);

    _defineProperty(this, "isClosing", new Animated.Value(FALSE));

    _defineProperty(this, "inverted", new Animated.Value(getInvertedMultiplier(this.props.gestureDirection)));

    _defineProperty(this, "layout", {
      width: new Animated.Value(this.props.layout.width),
      height: new Animated.Value(this.props.layout.height)
    });

    _defineProperty(this, "isSwiping", new Animated.Value(FALSE));

    _defineProperty(this, "interactionHandle", void 0);

    _defineProperty(this, "pendingGestureCallback", void 0);

    _defineProperty(this, "lastToValue", void 0);

    _defineProperty(this, "animate", _ref => {
      let {
        closing,
        velocity
      } = _ref;
      const {
        gesture,
        transitionSpec,
        onOpen,
        onClose,
        onTransition
      } = this.props;
      const toValue = this.getAnimateToValue({ ...this.props,
        closing
      });
      this.lastToValue = toValue;
      this.isClosing.setValue(closing ? TRUE : FALSE);
      const spec = closing ? transitionSpec.close : transitionSpec.open;
      const animation = spec.animation === 'spring' ? Animated.spring : Animated.timing;
      this.setPointerEventsEnabled(!closing);
      this.handleStartInteraction();
      clearTimeout(this.pendingGestureCallback);
      onTransition === null || onTransition === void 0 ? void 0 : onTransition({
        closing,
        gesture: velocity !== undefined
      });
      animation(gesture, { ...spec.config,
        velocity,
        toValue,
        useNativeDriver,
        isInteraction: false
      }).start(_ref2 => {
        let {
          finished
        } = _ref2;
        this.handleEndInteraction();
        clearTimeout(this.pendingGestureCallback);

        if (finished) {
          if (closing) {
            onClose();
          } else {
            onOpen();
          }

          if (this.isCurrentlyMounted) {
            // Make sure to re-open screen if it wasn't removed
            this.forceUpdate();
          }
        }
      });
    });

    _defineProperty(this, "getAnimateToValue", _ref3 => {
      let {
        closing,
        layout,
        gestureDirection
      } = _ref3;

      if (!closing) {
        return 0;
      }

      return getDistanceForDirection(layout, gestureDirection);
    });

    _defineProperty(this, "setPointerEventsEnabled", enabled => {
      var _this$contentRef$curr;

      const pointerEvents = enabled ? 'box-none' : 'none';
      (_this$contentRef$curr = this.contentRef.current) === null || _this$contentRef$curr === void 0 ? void 0 : _this$contentRef$curr.setNativeProps({
        pointerEvents
      });
    });

    _defineProperty(this, "handleStartInteraction", () => {
      if (this.interactionHandle === undefined) {
        this.interactionHandle = InteractionManager.createInteractionHandle();
      }
    });

    _defineProperty(this, "handleEndInteraction", () => {
      if (this.interactionHandle !== undefined) {
        InteractionManager.clearInteractionHandle(this.interactionHandle);
        this.interactionHandle = undefined;
      }
    });

    _defineProperty(this, "handleGestureStateChange", _ref4 => {
      let {
        nativeEvent
      } = _ref4;
      const {
        layout,
        onClose,
        onGestureBegin,
        onGestureCanceled,
        onGestureEnd,
        gestureDirection,
        gestureVelocityImpact
      } = this.props;

      switch (nativeEvent.state) {
        case GestureState.ACTIVE:
          this.isSwiping.setValue(TRUE);
          this.handleStartInteraction();
          onGestureBegin === null || onGestureBegin === void 0 ? void 0 : onGestureBegin();
          break;

        case GestureState.CANCELLED:
          {
            this.isSwiping.setValue(FALSE);
            this.handleEndInteraction();
            const velocity = gestureDirection === 'vertical' || gestureDirection === 'vertical-inverted' ? nativeEvent.velocityY : nativeEvent.velocityX;
            this.animate({
              closing: this.props.closing,
              velocity
            });
            onGestureCanceled === null || onGestureCanceled === void 0 ? void 0 : onGestureCanceled();
            break;
          }

        case GestureState.END:
          {
            this.isSwiping.setValue(FALSE);
            let distance;
            let translation;
            let velocity;

            if (gestureDirection === 'vertical' || gestureDirection === 'vertical-inverted') {
              distance = layout.height;
              translation = nativeEvent.translationY;
              velocity = nativeEvent.velocityY;
            } else {
              distance = layout.width;
              translation = nativeEvent.translationX;
              velocity = nativeEvent.velocityX;
            }

            const closing = (translation + velocity * gestureVelocityImpact) * getInvertedMultiplier(gestureDirection) > distance / 2 ? velocity !== 0 || translation !== 0 : this.props.closing;
            this.animate({
              closing,
              velocity
            });

            if (closing) {
              // We call onClose with a delay to make sure that the animation has already started
              // This will make sure that the state update caused by this doesn't affect start of animation
              this.pendingGestureCallback = setTimeout(() => {
                onClose(); // Trigger an update after we dispatch the action to remove the screen
                // This will make sure that we check if the screen didn't get removed so we can cancel the animation

                this.forceUpdate();
              }, 32);
            }

            onGestureEnd === null || onGestureEnd === void 0 ? void 0 : onGestureEnd();
            break;
          }
      }
    });

    _defineProperty(this, "getInterpolatedStyle", memoize((styleInterpolator, animation) => styleInterpolator(animation)));

    _defineProperty(this, "getCardAnimation", memoize((interpolationIndex, current, next, layout, insetTop, insetRight, insetBottom, insetLeft) => ({
      index: interpolationIndex,
      current: {
        progress: current
      },
      next: next && {
        progress: next
      },
      closing: this.isClosing,
      swiping: this.isSwiping,
      inverted: this.inverted,
      layouts: {
        screen: layout
      },
      insets: {
        top: insetTop,
        right: insetRight,
        bottom: insetBottom,
        left: insetLeft
      }
    })));

    _defineProperty(this, "contentRef", /*#__PURE__*/React.createRef());
  }

  componentDidMount() {
    this.animate({
      closing: this.props.closing
    });
    this.isCurrentlyMounted = true;
  }

  componentDidUpdate(prevProps) {
    const {
      layout,
      gestureDirection,
      closing
    } = this.props;
    const {
      width,
      height
    } = layout;

    if (width !== prevProps.layout.width) {
      this.layout.width.setValue(width);
    }

    if (height !== prevProps.layout.height) {
      this.layout.height.setValue(height);
    }

    if (gestureDirection !== prevProps.gestureDirection) {
      this.inverted.setValue(getInvertedMultiplier(gestureDirection));
    }

    const toValue = this.getAnimateToValue(this.props);

    if (this.getAnimateToValue(prevProps) !== toValue || this.lastToValue !== toValue) {
      // We need to trigger the animation when route was closed
      // Thr route might have been closed by a `POP` action or by a gesture
      // When route was closed due to a gesture, the animation would've happened already
      // It's still important to trigger the animation so that `onClose` is called
      // If `onClose` is not called, cleanup step won't be performed for gestures
      this.animate({
        closing
      });
    }
  }

  componentWillUnmount() {
    this.props.gesture.stopAnimation();
    this.isCurrentlyMounted = false;
    this.handleEndInteraction();
  }

  gestureActivationCriteria() {
    const {
      layout,
      gestureDirection,
      gestureResponseDistance
    } = this.props;
    const enableTrackpadTwoFingerGesture = true;
    const distance = gestureResponseDistance !== undefined ? gestureResponseDistance : gestureDirection === 'vertical' || gestureDirection === 'vertical-inverted' ? GESTURE_RESPONSE_DISTANCE_VERTICAL : GESTURE_RESPONSE_DISTANCE_HORIZONTAL;

    if (gestureDirection === 'vertical') {
      return {
        maxDeltaX: 15,
        minOffsetY: 5,
        hitSlop: {
          bottom: -layout.height + distance
        },
        enableTrackpadTwoFingerGesture
      };
    } else if (gestureDirection === 'vertical-inverted') {
      return {
        maxDeltaX: 15,
        minOffsetY: -5,
        hitSlop: {
          top: -layout.height + distance
        },
        enableTrackpadTwoFingerGesture
      };
    } else {
      const hitSlop = -layout.width + distance;
      const invertedMultiplier = getInvertedMultiplier(gestureDirection);

      if (invertedMultiplier === 1) {
        return {
          minOffsetX: 5,
          maxDeltaY: 20,
          hitSlop: {
            right: hitSlop
          },
          enableTrackpadTwoFingerGesture
        };
      } else {
        return {
          minOffsetX: -5,
          maxDeltaY: 20,
          hitSlop: {
            left: hitSlop
          },
          enableTrackpadTwoFingerGesture
        };
      }
    }
  }

  render() {
    const {
      styleInterpolator,
      interpolationIndex,
      current,
      gesture,
      next,
      layout,
      insets,
      overlay,
      overlayEnabled,
      shadowEnabled,
      gestureEnabled,
      gestureDirection,
      pageOverflowEnabled,
      headerDarkContent,
      children,
      containerStyle: customContainerStyle,
      contentStyle,
      ...rest
    } = this.props;
    const interpolationProps = this.getCardAnimation(interpolationIndex, current, next, layout, insets.top, insets.right, insets.bottom, insets.left);
    const interpolatedStyle = this.getInterpolatedStyle(styleInterpolator, interpolationProps);
    const {
      containerStyle,
      cardStyle,
      overlayStyle,
      shadowStyle
    } = interpolatedStyle;
    const handleGestureEvent = gestureEnabled ? Animated.event([{
      nativeEvent: gestureDirection === 'vertical' || gestureDirection === 'vertical-inverted' ? {
        translationY: gesture
      } : {
        translationX: gesture
      }
    }], {
      useNativeDriver
    }) : undefined;
    const {
      backgroundColor
    } = StyleSheet.flatten(contentStyle || {});
    const isTransparent = typeof backgroundColor === 'string' ? Color(backgroundColor).alpha() === 0 : false;
    return /*#__PURE__*/React.createElement(CardAnimationContext.Provider, {
      value: interpolationProps
    }, // StatusBar messes with translucent status bar on Android
    // So we should only enable it on iOS
    Platform.OS === 'ios' && overlayEnabled && next && getIsModalPresentation(styleInterpolator) ? /*#__PURE__*/React.createElement(ModalStatusBarManager, {
      dark: headerDarkContent,
      layout: layout,
      insets: insets,
      style: cardStyle
    }) : null, /*#__PURE__*/React.createElement(Animated.View, {
      style: {
        // This is a dummy style that doesn't actually change anything visually.
        // Animated needs the animated value to be used somewhere, otherwise things don't update properly.
        // If we disable animations and hide header, it could end up making the value unused.
        // So we have this dummy style that will always be used regardless of what else changed.
        opacity: current
      } // Make sure that this view isn't removed. If this view is removed, our style with animated value won't apply
      ,
      collapsable: false
    }), /*#__PURE__*/React.createElement(View, _extends({
      pointerEvents: "box-none"
    }, rest), overlayEnabled ? /*#__PURE__*/React.createElement(View, {
      pointerEvents: "box-none",
      style: StyleSheet.absoluteFill
    }, overlay({
      style: overlayStyle
    })) : null, /*#__PURE__*/React.createElement(Animated.View, {
      style: [styles.container, containerStyle, customContainerStyle],
      pointerEvents: "box-none"
    }, /*#__PURE__*/React.createElement(PanGestureHandler, _extends({
      enabled: layout.width !== 0 && gestureEnabled,
      onGestureEvent: handleGestureEvent,
      onHandlerStateChange: this.handleGestureStateChange
    }, this.gestureActivationCriteria()), /*#__PURE__*/React.createElement(Animated.View, {
      needsOffscreenAlphaCompositing: hasOpacityStyle(cardStyle),
      style: [styles.container, cardStyle]
    }, shadowEnabled && shadowStyle && !isTransparent ? /*#__PURE__*/React.createElement(Animated.View, {
      style: [styles.shadow, gestureDirection === 'horizontal' ? [styles.shadowHorizontal, styles.shadowLeft] : gestureDirection === 'horizontal-inverted' ? [styles.shadowHorizontal, styles.shadowRight] : gestureDirection === 'vertical' ? [styles.shadowVertical, styles.shadowTop] : [styles.shadowVertical, styles.shadowBottom], {
        backgroundColor
      }, shadowStyle],
      pointerEvents: "none"
    }) : null, /*#__PURE__*/React.createElement(CardSheet, {
      ref: this.contentRef,
      enabled: pageOverflowEnabled,
      layout: layout,
      style: contentStyle
    }, children))))));
  }

}

_defineProperty(Card, "defaultProps", {
  shadowEnabled: false,
  gestureEnabled: true,
  gestureVelocityImpact: GESTURE_VELOCITY_IMPACT,
  overlay: _ref5 => {
    let {
      style
    } = _ref5;
    return style ? /*#__PURE__*/React.createElement(Animated.View, {
      pointerEvents: "none",
      style: [styles.overlay, style]
    }) : null;
  }
});

export const getIsModalPresentation = cardStyleInterpolator => {
  return cardStyleInterpolator === forModalPresentationIOS || // Handle custom modal presentation interpolators as well
  cardStyleInterpolator.name === 'forModalPresentationIOS';
};
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  overlay: {
    flex: 1,
    backgroundColor: '#000'
  },
  shadow: {
    position: 'absolute',
    shadowRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3
  },
  shadowHorizontal: {
    top: 0,
    bottom: 0,
    width: 3,
    shadowOffset: {
      width: -1,
      height: 1
    }
  },
  shadowLeft: {
    left: 0
  },
  shadowRight: {
    right: 0
  },
  shadowVertical: {
    left: 0,
    right: 0,
    height: 3,
    shadowOffset: {
      width: 1,
      height: -1
    }
  },
  shadowTop: {
    top: 0
  },
  shadowBottom: {
    bottom: 0
  }
});
//# sourceMappingURL=Card.js.map