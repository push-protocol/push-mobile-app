//
//  NotificationService.m
//  NotifeeNotificationService
//
//  Created by Prodigy on 18/09/22.
//

#import "NotificationService.h"
#import "NotifeeExtensionHelper.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.contentHandler = contentHandler;
//     DISABLING AS PER NOTIFEE
//        self.bestAttemptContent = [request.content mutableCopy];
//
//        // Modify the notification content here...
//        self.bestAttemptContent.title = [NSString stringWithFormat:@"%@ [modified]", self.bestAttemptContent.title];
//
//     DISABLING ENDS

    // ADD NOTIFEE THINGS
    NSMutableDictionary *userInfoDict = [self.bestAttemptContent.userInfo mutableCopy];
    userInfoDict[@"notifee_options"] = [NSMutableDictionary dictionary];
    userInfoDict[@"notifee_options"][@"title"] = @"Modified Title";
  
    self.bestAttemptContent.userInfo = userInfoDict;
  
    [NotifeeExtensionHelper populateNotificationContent:request
                                  withContent: self.bestAttemptContent
                                  withContentHandler:contentHandler];
    // ADD NOTIFEE THINGS ENDS HERE
    
    self.contentHandler(self.bestAttemptContent);
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
