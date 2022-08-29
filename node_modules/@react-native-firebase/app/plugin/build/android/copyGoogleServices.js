"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCopyAndroidGoogleServices = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const constants_1 = require("./constants");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Copy `google-services.json`
 */
const withCopyAndroidGoogleServices = config => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'android',
        async (config) => {
            var _a;
            if (!((_a = config.android) === null || _a === void 0 ? void 0 : _a.googleServicesFile)) {
                throw new Error('Path to google-services.json is not defined. Please specify the `expo.android.googleServicesFile` field in app.json.');
            }
            const srcPath = path_1.default.resolve(config.modRequest.projectRoot, config.android.googleServicesFile);
            const destPath = path_1.default.resolve(config.modRequest.platformProjectRoot, constants_1.DEFAULT_TARGET_PATH);
            try {
                await fs_1.default.promises.copyFile(srcPath, destPath);
            }
            catch (e) {
                throw new Error(`Cannot copy google-services.json, because the file ${srcPath} doesn't exist. Please provide a valid path in \`app.json\`.`);
            }
            return config;
        },
    ]);
};
exports.withCopyAndroidGoogleServices = withCopyAndroidGoogleServices;
