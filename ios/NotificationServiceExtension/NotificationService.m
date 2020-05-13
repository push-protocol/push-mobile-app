//
//  NotificationService.m
//  NotificationServiceExtension
//
//  Created by Prodigy on 5/12/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "NotificationService.h"
#import <Firebase.h>

@interface NotificationService () <NSURLSessionDelegate>
@property(nonatomic) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property(nonatomic) UNMutableNotificationContent *bestAttemptContent;
@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];

    // Modify the notification content here as you wish
    self.bestAttemptContent.title = [NSString stringWithFormat:@"%@",
    self.bestAttemptContent.title];

  // Call FIRMessaging extension helper API.
  [[FIRMessaging extensionHelper] populateNotificationContent:self.bestAttemptContent
                                            withContentHandler:contentHandler];

//  self.contentHandler(self.bestAttemptContent);
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
