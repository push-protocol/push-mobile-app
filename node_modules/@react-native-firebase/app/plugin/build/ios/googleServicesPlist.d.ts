import { ConfigPlugin, XcodeProject } from '@expo/config-plugins';
export declare const withIosGoogleServicesFile: ConfigPlugin;
export declare function setGoogleServicesFile({ projectRoot, project, googleServicesFileRelativePath, }: {
    project: XcodeProject;
    projectRoot: string;
    googleServicesFileRelativePath: string;
}): XcodeProject;
