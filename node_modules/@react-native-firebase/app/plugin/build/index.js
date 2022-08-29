"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const android_1 = require("./android");
const ios_1 = require("./ios");
/**
 * A config plugin for configuring `@react-native-firebase/app`
 */
const withRnFirebaseApp = config => {
    return (0, config_plugins_1.withPlugins)(config, [
        // iOS
        ios_1.withFirebaseAppDelegate,
        ios_1.withIosGoogleServicesFile,
        // Android
        android_1.withBuildscriptDependency,
        android_1.withApplyGoogleServicesPlugin,
        android_1.withCopyAndroidGoogleServices,
    ]);
};
const pak = require('@react-native-firebase/app/package.json');
exports.default = (0, config_plugins_1.createRunOncePlugin)(withRnFirebaseApp, pak.name, pak.version);
