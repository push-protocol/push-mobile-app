"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleServicesVersion = exports.googleServicesPlugin = exports.googleServicesClassPath = exports.DEFAULT_TARGET_PATH = void 0;
const appPackageJson = require('@react-native-firebase/app/package.json');
exports.DEFAULT_TARGET_PATH = 'app/google-services.json';
exports.googleServicesClassPath = 'com.google.gms:google-services';
exports.googleServicesPlugin = 'com.google.gms.google-services';
exports.googleServicesVersion = appPackageJson.sdkVersions.android.gmsGoogleServicesGradle;
