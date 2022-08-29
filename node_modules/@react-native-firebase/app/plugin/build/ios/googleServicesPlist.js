"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGoogleServicesFile = exports.withIosGoogleServicesFile = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const withIosGoogleServicesFile = config => {
    return (0, config_plugins_1.withXcodeProject)(config, config => {
        var _a;
        if (!((_a = config.ios) === null || _a === void 0 ? void 0 : _a.googleServicesFile)) {
            throw new Error('Path to GoogleService-Info.plist is not defined. Please specify the `expo.ios.googleServicesFile` field in app.json.');
        }
        config.modResults = setGoogleServicesFile({
            projectRoot: config.modRequest.projectRoot,
            project: config.modResults,
            googleServicesFileRelativePath: config.ios.googleServicesFile,
        });
        return config;
    });
};
exports.withIosGoogleServicesFile = withIosGoogleServicesFile;
function setGoogleServicesFile({ projectRoot, project, googleServicesFileRelativePath, }) {
    const googleServiceFilePath = path_1.default.resolve(projectRoot, googleServicesFileRelativePath);
    if (!fs_1.default.existsSync(googleServiceFilePath)) {
        throw new Error(`GoogleService-Info.plist doesn't exist in ${googleServiceFilePath}. Place it there or configure the path in app.json`);
    }
    fs_1.default.copyFileSync(googleServiceFilePath, path_1.default.join(config_plugins_1.IOSConfig.Paths.getSourceRoot(projectRoot), 'GoogleService-Info.plist'));
    const projectName = config_plugins_1.IOSConfig.XcodeUtils.getProjectName(projectRoot);
    const plistFilePath = `${projectName}/GoogleService-Info.plist`;
    if (!project.hasFile(plistFilePath)) {
        project = config_plugins_1.IOSConfig.XcodeUtils.addResourceFileToGroup({
            filepath: plistFilePath,
            groupName: projectName,
            project,
            isBuildFile: true,
        });
    }
    return project;
}
exports.setGoogleServicesFile = setGoogleServicesFile;
