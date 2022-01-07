/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>
#import <React/RCTBridgeDelegate.h>

// CUSTOM CODE
#import <UIKit/UIKit.h>
#import <FirebaseMessaging.h>
// ----

#import <UMCore/UMAppDelegateWrapper.h>

#import <EXUpdates/EXUpdatesAppController.h>

//@import UserNotifications;

// EXPO CODE COMMENTED OUT
// @interface AppDelegate : UMAppDelegateWrapper <RCTBridgeDelegate, EXUpdatesAppControllerDelegate>
// REAL CODE LOOKED LIKE THIS
// @interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

// CUSTOM CODE OG
// @interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate, FIRMessagingDelegate>

// NCURRENTLY USED CUSTOM CODE
// @interface AppDelegate : UMAppDelegateWrapper <RCTBridgeDelegate, EXUpdatesAppControllerDelegate, UNUserNotificationCenterDelegate, FIRMessagingDelegate>
// ----

// CUSTOM CODE MODIFIED
@interface AppDelegate : UMAppDelegateWrapper <RCTBridgeDelegate, EXUpdatesAppControllerDelegate>
// ----

@property (nonatomic, strong) UMModuleRegistryAdapter *moduleRegistryAdapter;
@property (nonatomic, strong) UIWindow *window;

@end
