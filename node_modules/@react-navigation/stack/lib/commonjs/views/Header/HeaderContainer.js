"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = HeaderContainer;

var _elements = require("@react-navigation/elements");

var _native = require("@react-navigation/native");

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _HeaderStyleInterpolators = require("../../TransitionConfigs/HeaderStyleInterpolators");

var _Header = _interopRequireDefault(require("./Header"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function HeaderContainer(_ref) {
  let {
    mode,
    scenes,
    layout,
    getPreviousScene,
    getFocusedRoute,
    onContentHeightChange,
    style
  } = _ref;
  const focusedRoute = getFocusedRoute();
  const parentHeaderBack = React.useContext(_elements.HeaderBackContext);
  return /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
    pointerEvents: "box-none",
    style: style
  }, scenes.slice(-3).map((scene, i, self) => {
    var _self, _self2;

    if (mode === 'screen' && i !== self.length - 1 || !scene) {
      return null;
    }

    const {
      header,
      headerMode,
      headerShown = true,
      headerTransparent,
      headerStyleInterpolator
    } = scene.descriptor.options;

    if (headerMode !== mode || !headerShown) {
      return null;
    }

    const isFocused = focusedRoute.key === scene.descriptor.route.key;
    const previousScene = getPreviousScene({
      route: scene.descriptor.route
    });
    let headerBack = parentHeaderBack;

    if (previousScene) {
      const {
        options,
        route
      } = previousScene.descriptor;
      headerBack = previousScene ? {
        title: (0, _elements.getHeaderTitle)(options, route.name)
      } : parentHeaderBack;
    } // If the screen is next to a headerless screen, we need to make the header appear static
    // This makes the header look like it's moving with the screen


    const previousDescriptor = (_self = self[i - 1]) === null || _self === void 0 ? void 0 : _self.descriptor;
    const nextDescriptor = (_self2 = self[i + 1]) === null || _self2 === void 0 ? void 0 : _self2.descriptor;
    const {
      headerShown: previousHeaderShown = true,
      headerMode: previousHeaderMode
    } = (previousDescriptor === null || previousDescriptor === void 0 ? void 0 : previousDescriptor.options) || {}; // If any of the next screens don't have a header or header is part of the screen
    // Then we need to move this header offscreen so that it doesn't cover it

    const nextHeaderlessScene = self.slice(i + 1).find(scene => {
      const {
        headerShown: currentHeaderShown = true,
        headerMode: currentHeaderMode
      } = (scene === null || scene === void 0 ? void 0 : scene.descriptor.options) || {};
      return currentHeaderShown === false || currentHeaderMode === 'screen';
    });
    const {
      gestureDirection: nextHeaderlessGestureDirection
    } = (nextHeaderlessScene === null || nextHeaderlessScene === void 0 ? void 0 : nextHeaderlessScene.descriptor.options) || {};
    const isHeaderStatic = (previousHeaderShown === false || previousHeaderMode === 'screen') && // We still need to animate when coming back from next scene
    // A hacky way to check this is if the next scene exists
    !nextDescriptor || nextHeaderlessScene;
    const props = {
      layout,
      back: headerBack,
      progress: scene.progress,
      options: scene.descriptor.options,
      route: scene.descriptor.route,
      navigation: scene.descriptor.navigation,
      styleInterpolator: mode === 'float' ? isHeaderStatic ? nextHeaderlessGestureDirection === 'vertical' || nextHeaderlessGestureDirection === 'vertical-inverted' ? _HeaderStyleInterpolators.forSlideUp : nextHeaderlessGestureDirection === 'horizontal-inverted' ? _HeaderStyleInterpolators.forSlideRight : _HeaderStyleInterpolators.forSlideLeft : headerStyleInterpolator : _HeaderStyleInterpolators.forNoAnimation
    };
    return /*#__PURE__*/React.createElement(_native.NavigationContext.Provider, {
      key: scene.descriptor.route.key,
      value: scene.descriptor.navigation
    }, /*#__PURE__*/React.createElement(_native.NavigationRouteContext.Provider, {
      value: scene.descriptor.route
    }, /*#__PURE__*/React.createElement(_reactNative.View, {
      onLayout: onContentHeightChange ? e => {
        const {
          height
        } = e.nativeEvent.layout;
        onContentHeightChange({
          route: scene.descriptor.route,
          height
        });
      } : undefined,
      pointerEvents: isFocused ? 'box-none' : 'none',
      accessibilityElementsHidden: !isFocused,
      importantForAccessibility: isFocused ? 'auto' : 'no-hide-descendants',
      style: // Avoid positioning the focused header absolutely
      // Otherwise accessibility tools don't seem to be able to find it
      mode === 'float' && !isFocused || headerTransparent ? styles.header : null
    }, header !== undefined ? header(props) : /*#__PURE__*/React.createElement(_Header.default, props))));
  }));
}

const styles = _reactNative.StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  }
});
//# sourceMappingURL=HeaderContainer.js.map