"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Reanimated = void 0;

var _utils = require("../../utils");

let Reanimated;
exports.Reanimated = Reanimated;

try {
  exports.Reanimated = Reanimated = require('react-native-reanimated');

  if (!Reanimated.setGestureState) {
    Reanimated.setGestureState = () => {
      'worklet';

      console.warn((0, _utils.tagMessage)('Please use newer version of react-native-reanimated in order to control state of the gestures.'));
    };
  } // When 'react-native-reanimated' is not available we want to
  // quietly continue
  // eslint-disable-next-line no-empty

} catch (e) {}
//# sourceMappingURL=reanimatedWrapper.js.map