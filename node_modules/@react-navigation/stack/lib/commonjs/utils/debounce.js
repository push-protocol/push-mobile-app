"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = debounce;

function debounce(func, duration) {
  let timeout;
  return function () {
    if (!timeout) {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // eslint-disable-next-line babel/no-invalid-this
      func.apply(this, args);
      timeout = setTimeout(() => {
        timeout = undefined;
      }, duration);
    }
  };
}
//# sourceMappingURL=debounce.js.map