import { ConfigPlugin } from '@expo/config-plugins';
import { AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
export declare function modifyObjcAppDelegate(contents: string): string;
export declare function modifyAppDelegateAsync(appDelegateFileInfo: AppDelegateProjectFile): Promise<void>;
export declare const withFirebaseAppDelegate: ConfigPlugin;
