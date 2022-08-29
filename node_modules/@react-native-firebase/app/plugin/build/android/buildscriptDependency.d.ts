import { ConfigPlugin } from '@expo/config-plugins';
/**
 * Update `<project>/build.gradle` by adding google-services dependency to buildscript
 */
export declare const withBuildscriptDependency: ConfigPlugin;
export declare function setBuildscriptDependency(buildGradle: string): string;
