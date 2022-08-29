"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useKeyboardManager;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function useKeyboardManager(isEnabled) {
  // Numeric id of the previously focused text input
  // When a gesture didn't change the tab, we can restore the focused input with this
  const previouslyFocusedTextInputRef = React.useRef(undefined);
  const startTimestampRef = React.useRef(0);
  const keyboardTimeoutRef = React.useRef();
  const clearKeyboardTimeout = React.useCallback(() => {
    if (keyboardTimeoutRef.current !== undefined) {
      clearTimeout(keyboardTimeoutRef.current);
      keyboardTimeoutRef.current = undefined;
    }
  }, []);
  const onPageChangeStart = React.useCallback(() => {
    if (!isEnabled()) {
      return;
    }

    clearKeyboardTimeout();

    const input = _reactNative.TextInput.State.currentlyFocusedInput(); // When a page change begins, blur the currently focused input


    input === null || input === void 0 ? void 0 : input.blur(); // Store the id of this input so we can refocus it if change was cancelled

    previouslyFocusedTextInputRef.current = input; // Store timestamp for touch start

    startTimestampRef.current = Date.now();
  }, [clearKeyboardTimeout, isEnabled]);
  const onPageChangeConfirm = React.useCallback(force => {
    if (!isEnabled()) {
      return;
    }

    clearKeyboardTimeout();

    if (force) {
      // Always dismiss input, even if we don't have a ref to it
      // We might not have the ref if onPageChangeStart was never called
      // This can happen if page change was not from a gesture
      _reactNative.Keyboard.dismiss();
    } else {
      const input = previouslyFocusedTextInputRef.current; // Dismiss the keyboard only if an input was a focused before
      // This makes sure we don't dismiss input on going back and focusing an input

      input === null || input === void 0 ? void 0 : input.blur();
    } // Cleanup the ID on successful page change


    previouslyFocusedTextInputRef.current = undefined;
  }, [clearKeyboardTimeout, isEnabled]);
  const onPageChangeCancel = React.useCallback(() => {
    if (!isEnabled()) {
      return;
    }

    clearKeyboardTimeout(); // The page didn't change, we should restore the focus of text input

    const input = previouslyFocusedTextInputRef.current;

    if (input) {
      // If the interaction was super short we should make sure keyboard won't hide again.
      // Too fast input refocus will result only in keyboard flashing on screen and hiding right away.
      // During first ~100ms keyboard will be dismissed no matter what,
      // so we have to make sure it won't interrupt input refocus logic.
      // That's why when the interaction is shorter than 100ms we add delay so it won't hide once again.
      // Subtracting timestamps makes us sure the delay is executed only when needed.
      if (Date.now() - startTimestampRef.current < 100) {
        keyboardTimeoutRef.current = setTimeout(() => {
          input === null || input === void 0 ? void 0 : input.focus();
          previouslyFocusedTextInputRef.current = undefined;
        }, 100);
      } else {
        input === null || input === void 0 ? void 0 : input.focus();
        previouslyFocusedTextInputRef.current = undefined;
      }
    }
  }, [clearKeyboardTimeout, isEnabled]);
  React.useEffect(() => {
    return () => clearKeyboardTimeout();
  }, [clearKeyboardTimeout]);
  return {
    onPageChangeStart,
    onPageChangeConfirm,
    onPageChangeCancel
  };
}
//# sourceMappingURL=useKeyboardManager.js.map