"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SlideFromRightIOS = exports.ScaleFromCenterAndroid = exports.RevealFromBottomAndroid = exports.ModalTransition = exports.ModalSlideFromBottomIOS = exports.ModalPresentationIOS = exports.ModalFadeTransition = exports.FadeFromBottomAndroid = exports.DefaultTransition = exports.BottomSheetAndroid = void 0;

var _reactNative = require("react-native");

var _CardStyleInterpolators = require("./CardStyleInterpolators");

var _HeaderStyleInterpolators = require("./HeaderStyleInterpolators");

var _TransitionSpecs = require("./TransitionSpecs");

const ANDROID_VERSION_PIE = 28;
const ANDROID_VERSION_10 = 29;
/**
 * Standard iOS navigation transition.
 */

const SlideFromRightIOS = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: _TransitionSpecs.TransitionIOSSpec,
    close: _TransitionSpecs.TransitionIOSSpec
  },
  cardStyleInterpolator: _CardStyleInterpolators.forHorizontalIOS,
  headerStyleInterpolator: _HeaderStyleInterpolators.forFade
};
/**
 * Standard iOS navigation transition for modals.
 */

exports.SlideFromRightIOS = SlideFromRightIOS;
const ModalSlideFromBottomIOS = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: _TransitionSpecs.TransitionIOSSpec,
    close: _TransitionSpecs.TransitionIOSSpec
  },
  cardStyleInterpolator: _CardStyleInterpolators.forVerticalIOS,
  headerStyleInterpolator: _HeaderStyleInterpolators.forFade
};
/**
 * Standard iOS modal presentation style (introduced in iOS 13).
 */

exports.ModalSlideFromBottomIOS = ModalSlideFromBottomIOS;
const ModalPresentationIOS = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: _TransitionSpecs.TransitionIOSSpec,
    close: _TransitionSpecs.TransitionIOSSpec
  },
  cardStyleInterpolator: _CardStyleInterpolators.forModalPresentationIOS,
  headerStyleInterpolator: _HeaderStyleInterpolators.forFade
};
/**
 * Standard Android navigation transition when opening or closing an Activity on Android < 9 (Oreo).
 */

exports.ModalPresentationIOS = ModalPresentationIOS;
const FadeFromBottomAndroid = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: _TransitionSpecs.FadeInFromBottomAndroidSpec,
    close: _TransitionSpecs.FadeOutToBottomAndroidSpec
  },
  cardStyleInterpolator: _CardStyleInterpolators.forFadeFromBottomAndroid,
  headerStyleInterpolator: _HeaderStyleInterpolators.forFade
};
/**
 * Standard Android navigation transition when opening or closing an Activity on Android 9 (Pie).
 */

exports.FadeFromBottomAndroid = FadeFromBottomAndroid;
const RevealFromBottomAndroid = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: _TransitionSpecs.RevealFromBottomAndroidSpec,
    close: _TransitionSpecs.RevealFromBottomAndroidSpec
  },
  cardStyleInterpolator: _CardStyleInterpolators.forRevealFromBottomAndroid,
  headerStyleInterpolator: _HeaderStyleInterpolators.forFade
};
/**
 * Standard Android navigation transition when opening or closing an Activity on Android 10 (Q).
 */

exports.RevealFromBottomAndroid = RevealFromBottomAndroid;
const ScaleFromCenterAndroid = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: _TransitionSpecs.ScaleFromCenterAndroidSpec,
    close: _TransitionSpecs.ScaleFromCenterAndroidSpec
  },
  cardStyleInterpolator: _CardStyleInterpolators.forScaleFromCenterAndroid,
  headerStyleInterpolator: _HeaderStyleInterpolators.forFade
};
/**
 * Standard bottom sheet slide transition for Android 10.
 */

exports.ScaleFromCenterAndroid = ScaleFromCenterAndroid;
const BottomSheetAndroid = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: _TransitionSpecs.BottomSheetSlideInSpec,
    close: _TransitionSpecs.BottomSheetSlideOutSpec
  },
  cardStyleInterpolator: _CardStyleInterpolators.forBottomSheetAndroid,
  headerStyleInterpolator: _HeaderStyleInterpolators.forFade
};
/**
 * Fade transition for transparent modals.
 */

exports.BottomSheetAndroid = BottomSheetAndroid;
const ModalFadeTransition = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: _TransitionSpecs.BottomSheetSlideInSpec,
    close: _TransitionSpecs.BottomSheetSlideOutSpec
  },
  cardStyleInterpolator: _CardStyleInterpolators.forFadeFromCenter,
  headerStyleInterpolator: _HeaderStyleInterpolators.forFade
};
/**
 * Default navigation transition for the current platform.
 */

exports.ModalFadeTransition = ModalFadeTransition;

const DefaultTransition = _reactNative.Platform.select({
  ios: SlideFromRightIOS,
  android: _reactNative.Platform.Version >= ANDROID_VERSION_10 ? ScaleFromCenterAndroid : _reactNative.Platform.Version >= ANDROID_VERSION_PIE ? RevealFromBottomAndroid : FadeFromBottomAndroid,
  default: ScaleFromCenterAndroid
});
/**
 * Default modal transition for the current platform.
 */


exports.DefaultTransition = DefaultTransition;

const ModalTransition = _reactNative.Platform.select({
  ios: ModalPresentationIOS,
  default: BottomSheetAndroid
});

exports.ModalTransition = ModalTransition;
//# sourceMappingURL=TransitionPresets.js.map