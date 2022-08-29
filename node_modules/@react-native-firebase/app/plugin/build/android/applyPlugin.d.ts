import { ConfigPlugin } from '@expo/config-plugins';
/**
 * Update `app/build.gradle` by applying google-services plugin
 */
export declare const withApplyGoogleServicesPlugin: ConfigPlugin;
export declare function applyPlugin(appBuildGradle: string): string;
