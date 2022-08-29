function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { createNavigatorFactory, StackActions, StackRouter, useNavigationBuilder } from '@react-navigation/native';
import * as React from 'react';
import warnOnce from 'warn-once';
import StackView from '../views/Stack/StackView';

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
  warnOnce(mode != null, `Stack Navigator: 'mode="${mode}"' is deprecated. Use 'presentation: "${mode}"' in 'screenOptions' instead.\n\nSee https://reactnavigation.org/docs/stack-navigator#presentation for more details.`); // @ts-expect-error: headerMode='none' is deprecated

  const headerMode = rest.headerMode;
  warnOnce(headerMode === 'none', `Stack Navigator: 'headerMode="none"' is deprecated. Use 'headerShown: false' in 'screenOptions' instead.\n\nSee https://reactnavigation.org/docs/stack-navigator/#headershown for more details.`);
  warnOnce(headerMode != null && headerMode !== 'none', `Stack Navigator: 'headerMode' is moved to 'options'. Moved it to 'screenOptions' to keep current behavior.\n\nSee https://reactnavigation.org/docs/stack-navigator/#headermode for more details.`); // @ts-expect-error: headerMode='none' is deprecated

  const keyboardHandlingEnabled = rest.keyboardHandlingEnabled;
  warnOnce(keyboardHandlingEnabled !== undefined, `Stack Navigator: 'keyboardHandlingEnabled' is moved to 'options'. Moved it to 'screenOptions' to keep current behavior.\n\nSee https://reactnavigation.org/docs/stack-navigator/#keyboardhandlingenabled for more details.`);
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
  } = useNavigationBuilder(StackRouter, {
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
            navigation.dispatch({ ...StackActions.popToTop(),
              target: state.key
            });
          }
        });
      })
    );
  }, [navigation, state.index, state.key]);
  return /*#__PURE__*/React.createElement(NavigationContent, null, /*#__PURE__*/React.createElement(StackView, _extends({}, rest, {
    state: state,
    descriptors: descriptors,
    navigation: navigation
  })));
}

export default createNavigatorFactory(StackNavigator);
//# sourceMappingURL=createStackNavigator.js.map