/**
 *
 * Concatenates the remote dependencies into a comma separated string.
 * this string will then be passed as an argument to the "importScripts" function
 *
 * @param {Array.<String>}} deps array of string
 * @returns {String} a string composed by the concatenation of the array
 * elements "deps" and "importScripts".
 *
 * @example
 * remoteDepsParser(['http://js.com/1.js', 'http://js.com/2.js']) // importScripts('http://js.com/1.js', 'http://js.com/2.js')
 */
declare const remoteDepsParser: (deps: string[]) => string;
export default remoteDepsParser;
