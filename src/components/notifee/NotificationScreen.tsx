import notifee, {AndroidStyle} from '@notifee/react-native';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

const getFormattedString = (msg: string) => msg.replace(/%/g, '\n');

const payload: NotificationPayload = {
  collapseKey: 'io.epns.epnsstaging',
  data: {},
  from: '755180533582',
  messageId: '0:1663247319428902%8419491584194915',
  notification: {
    android: {
      color: '#e20880',
      imageUrl:
        'https://gateway.ipfs.io/ipfs/QmYWc2yNMJaMCfA1s9XwsbfwAk7o8Y4Chi5YaAXauYHLBm',
      smallIcon: '@drawable/ic_stat_name',
    },
    body: 'Hourly Movement: -0.39%Daily Movement: 0.29%Weekly Movement: 4.94%',
    title: 'Abishek',
  },
  sentTime: 1663247319423,
  ttl: 2419200,
};

interface Notification {
  android: {
    color: string;
    imageUrl: string;
    smallIcon: string;
  };
  body: string;
  title: string;
}

interface NotificationPayload {
  collapseKey: String;
  data: any;
  from: string;
  messageId: string;
  sentTime: number;
  ttl: number;
  notification: Notification;
}

const NotifeeDisplayNotification =
  async function () // payload: NotificationPayload,
  {
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: payload.notification.title,
      body: getFormattedString(payload.notification.body),
      android: {
        channelId,
        // largeIcon: payload.notification.android.imageUrl,
        smallIcon: payload.notification.android.smallIcon, // optional, defaults to 'ic_launcher'.
        largeIcon: payload.notification.android.imageUrl,
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
        style: {
          type: AndroidStyle.MESSAGING,
          person: {
            name: payload.notification.title,
            icon: payload.notification.android.imageUrl,
          },
          messages: [
            {
              text: getFormattedString(payload.notification.body),
              timestamp: Date.now() - 600000, // 10 minutes ago
            },
          ],
        },
      },
      ios: {
        categoryId: 'reminders',
        attachments: [
          {
            url: payload.notification.android.imageUrl,
          },
        ],
      },
    });
  };

const NotificationComponent = () => {
  return (
    <View
      style={{
        marginTop: 125,
        backgroundColor: 'blue',
      }}>
      <TouchableOpacity
        onPress={() => {
          NotifeeDisplayNotification();
        }}>
        <Text style={{color: 'white', height: 80}}>Click Me</Text>
      </TouchableOpacity>
    </View>
  );
};

export {NotifeeDisplayNotification, NotificationComponent};
