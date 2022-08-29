"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _native = require("@react-navigation/native");

var React = _interopRequireWildcard(require("react"));

var _warnOnce = _interopRequireDefault(require("warn-once"));

var _StackView = _interopRequireDefault(require("../views/Stack/StackView"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function StackNavigator(_ref) {
  let {
    id,
    initialRouteName,
    children,
    screenListeners,
    screenOptions,
    ...rest
  } = _ref;
  // @ts-expect-error: mode is deprecated
  const mode = rest.mode;
  (0, _warnOnce.default)(mode != null, `Stack Navigator: 'mode="${mode}"' is deprecated. Use 'presentation: "${mode}"' in 'screenOptions' instead.\n\nSee https://reactnavigation.org/docs/stack-navigator#presentation for more details.`); // @ts-expect-error: headerMode='none' is deprecated

  const headerMode = rest.headerMode;
  (0, _warnOnce.default)(headerMode === 'none', `Stack Navigator: 'headerMode="none"' is deprecated. Use 'headerShown: false' in 'screenOptions' instead.\n\nSee https://reactnavigation.org/docs/stack-navigator/#headershown for more details.`);
  (0, _warnOnce.default)(headerMode != null && headerMode !== 'none', `Stack Navigator: 'headerMode' is moved to 'options'. Moved it to 'screenOptions' to keep current behavior.\n\nSee https://reactnavigation.org/docs/stack-navigator/#headermode for more details.`); // @ts-expect-error: headerMode='none' is deprecated

  const keyboardHandlingEnabled = rest.keyboardHandlingEnabled;
  (0, _warnOnce.default)(keyboardHandlingEnabled !== undefined, `Stack Navigator: 'keyboardHandlingEnabled' is moved to 'options'. Moved it to 'screenOptions' to keep current behavior.\n\nSee https://reactnavigation.org/docs/stack-navigator/#keyboardhandlingenabled for more details.`);
  const defaultScreenOptions = {
    presentation: mode,
    headerShown: headerMode ? headerMode !== 'none' : true,
    headerMode: headerMode && headerMode !== 'none' ? headerMode : undefined,
    keyboardHandlingEnabled
  };
  const {
    state,
    descriptors,
    navigation,
    NavigationContent
  } = (0, _native.useNavigationBuilder)(_native.StackRouter, {
    id,
    initialRouteName,
    children,
    screenListeners,
    screenOptions,
    defaultScreenOptions
  });
  React.useEffect(() => {
    var _navigation$addListen;

    return (// @ts-expect-error: there may not be a tab navigator in parent
      (_navigation$addListen = navigation.addListener) === null || _navigation$addListen === void 0 ? void 0 : _navigation$addListen.call(navigation, 'tabPress', e => {
        const isFocused = navigation.isFocused(); // Run the operation in the next frame so we're sure all listeners have been run
        // This is necessary to know if preventDefault() has been called

        requestAnimationFrame(() => {
          if (state.index > 0 && isFocused && !e.defaultPrevented) {
            // When user taps on already focused tab and we're inside the tab,
            // reset the stack to replicate native behaviour
            navigation.dispatch({ ..._native.StackActions.popToTop(),
              target: state.key
            });
          }
        });
      })
    );
  }, [navigation, state.index, state.key]);
  return /*#__PURE__*/React.createElement(NavigationContent, null, /*#__PURE__*/React.createElement(_StackView.default, _extends({}, rest, {
    state: state,
    descriptors: descriptors,
    navigation: navigation
  })));
}

var _default = (0, _native.createNavigatorFactory)(StackNavigator);

exports.default = _default;
//# sourceMappingURL=createStackNavigator.js.map