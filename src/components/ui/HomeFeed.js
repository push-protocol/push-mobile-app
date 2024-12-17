import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import ImagePreviewFooter from 'src/components/ui/ImagePreviewFooter';
import {useNotificationsApi} from 'src/contexts/NotificationContext';
import {usePushApi} from 'src/contexts/PushApiContext';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import {getTrimmedAddress} from 'src/navigation/screens/chats/helpers/chatAddressFormatter';

import EmptyFeed from './EmptyFeed';
import NotificationItem from './NotificationItem';

export default function InboxFeed(props) {
  const {userPushSDKInstance, userInfo} = usePushApi();
  const {createNotificationChannel} = useNotificationsApi();

  // SET STATES
  const [initialized, setInitialized] = useState(false);
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setloading] = useState(false);
  const [endReached, setEndReached] = useState(false);

  const [loadedImages, setLoadedImages] = useState([]);
  const [renderGallery, setRenderGallery] = useState(false);
  const [startFromIndex, setStartFromIndex] = useState(0);

  const {
    channelNotificationOpened,
    channelNotificationReceived,
    setChannelNotificationOpened,
    setChannelNotificationReceived,
  } = useNotificationsApi();

  // SET REFS
  const FlatListFeedsRef = useRef(null);

  // LOGIC
  useEffect(() => {
    if (!initialized && userPushSDKInstance) {
      fetchInitializedFeeds();
    }
  }, [initialized, userPushSDKInstance]);

  useEffect(() => {
    if (channelNotificationReceived || channelNotificationOpened) {
      fetchFeed(true, true);
      setChannelNotificationOpened(false);
      setChannelNotificationReceived(false);
    }
  }, [channelNotificationOpened, channelNotificationReceived]);

  useEffect(() => {
    createNotificationChannel();
  }, []);

  useEffect(() => {
    // Wallet changed, different user
    setInitialized(false);
  }, [userInfo?.wallets]);

  useEffect(() => {
    if (props.refreshNotifFeeds) {
      setInitialized(false);
    }
  }, [props.refreshNotifFeeds]);

  // Refresh Feed
  const fetchInitializedFeeds = async () => {
    setInitialized(true);
    setRefreshing(true);
    await performTimeConsumingTask();

    FlatListFeedsRef.current.scrollToOffset({animated: true, offset: 0});
    fetchFeed(true);
  };

  // Perform some task to wait
  const performTimeConsumingTask = async () => {
    return new Promise(resolve =>
      setTimeout(() => {
        resolve('result');
      }, 500),
    );
  };

  const fetchFeed = async (rewrite, refresh = false) => {
    if ((!endReached || rewrite === true) && userPushSDKInstance) {
      if (!loading) {
        setloading(true);
        const feeds = await userPushSDKInstance.notification.list('INBOX', {
          limit: 10,
          page: refresh ? 1 : page,
        });

        if (feeds && feeds.length > 0) {
          const oldMsg = feed.length > 0 ? feed[0].sid : '';
          const newMsg = feeds[0].sid;
          const isMsgNew = oldMsg !== newMsg;

          // clear the notifs if present
          AppBadgeHelper.setAppBadgeCount(0);

          if (rewrite) {
            setFeed([...feeds]);
            setEndReached(false);
          } else {
            setFeed(prev => [...prev, ...feeds]);
          }

          if (!refresh) {
            setPage(prev => prev + 1);
          }

          //show tost is msg is new
          if (isMsgNew) {
            props.ToasterFunc(
              'New Notifications Loaded!',
              '',
              ToasterOptions.TYPE.GRADIENT_PRIMARY,
            );
          }
        } else {
          setEndReached(true);
          props.ToasterFunc(
            'No More Notifications',
            '',
            ToasterOptions.TYPE.ERROR,
          );
        }

        setloading(false);
        setRefreshing(false);
      }
    }
  };

  function generateRandomChatSentence() {
    const subjects = ['I', 'You', 'We', 'They', 'Someone'];
    const verbs = ['love', 'hate', 'enjoy', 'miss', 'think about', 'remember'];
    const objects = [
      'coding',
      'chatting',
      'pizza',
      'movies',
      'nature',
      'music',
    ];
    const phrases = [
      'in the morning.',
      'right now.',
      'every day.',
      'all the time.',
      'on weekends.',
      "when I'm alone.",
    ];
    const message = [
      'sent a message',
      'sent a GIF',
      'sent an image',
      'sent a file',
      'replied to a message',
    ];

    const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

    const msg = randomElement(message);

    const sentence = `${randomElement(subjects)} ${randomElement(
      verbs,
    )} ${randomElement(objects)} ${randomElement(phrases)}`;
    return msg;
  }

  const chatMessage = {
    singleChat: (msg, timeStamp) => ({
      collapseKey: 'io.epns.epnsstaging',
      data: {
        type: 'PUSH_NOTIFICATION_CHAT',
        details: JSON.stringify({
          subType: 'INDIVIDUAL_CHAT',
          info: {
            wallets: '0x9B220a17929Ac119dD3D0711d916e28263dd0D9C',
            profilePicture:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAuUlEQVR4AcXBMWrDUBBF0avHh+zLjRp9XDrFZGfBTaaIcfndeHVKO3IhEMG8c6bvj+tKMTJ5px5BJcyEmTBrI5Pq9vNLlc8H/xHzQnXJTyphJsyEWeNFPh9UI5OqR7BnZLIRbH2xIcyEmTBrvIh5oRokVcwLewZJFfNCNUgqYSbMhNl0vp9WjISZMBNmjYN6BHtGJkcIM2EmzFqP4IiRyZ4ewRHCTJgJs+l8P60UPYJ3GplUwkyYCbM/Vc0q3B9XBygAAAAASUVORK5CYII=',
            chatId:
              '248d2886f49bb26e6715b214e063d27c6d57eb16fd0f594ea0cd0f135bfe4cbd',
            combinedDID:
              'eip155:0xDcA78D2f7cF9cF40bbC752494Fa41639280FbC3B_eip155:0x9B220a17929Ac119dD3D0711d916e28263dd0D9C',
            threadhash:
              'v2:a78b22977759c2a3798a4fbdf78f8f84688198470ae4879c298944bf67267082', //cid
          },
        }),
      },
      from: '755180533582',
      messageId: `0:1732875400813721%841${timeStamp}`,
      notification: {
        android: {
          color: '#e20880',
          imageUrl: null,
          smallIcon: 'ic_notification',
        },
        body: msg,
        title: getTrimmedAddress('0x9B220a17929Ac119dD3D0711d916e28263dd0D9C'),
      },
      sentTime: timeStamp,
      ttl: 2419200,
    }),
    groupChat: (msg, timeStamp) => ({
      collapseKey: 'io.epns.epnsstaging',
      data: {
        type: 'PUSH_NOTIFICATION_CHAT',
        details: JSON.stringify({
          subType: 'GROUP_CHAT',
          info: {
            wallets: '0x9B220a17929Ac119dD3D0711d916e28263dd0D9C',
            profilePicture:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAuUlEQVR4AcXBMWrDUBBF0avHh+zLjRp9XDrFZGfBTaaIcfndeHVKO3IhEMG8c6bvj+tKMTJ5px5BJcyEmTBrI5Pq9vNLlc8H/xHzQnXJTyphJsyEWeNFPh9UI5OqR7BnZLIRbH2xIcyEmTBrvIh5oRokVcwLewZJFfNCNUgqYSbMhNl0vp9WjISZMBNmjYN6BHtGJkcIM2EmzFqP4IiRyZ4ewRHCTJgJs+l8P60UPYJ3GplUwkyYCbM/Vc0q3B9XBygAAAAASUVORK5CYII=',
            chatId:
              '6bc7bef45a30b033390c060698e72f5a07a416d97db73e1363e171337469f339',
            combinedDID:
              'eip155:0xDcA78D2f7cF9cF40bbC752494Fa41639280FbC3B_eip155:0x9B220a17929Ac119dD3D0711d916e28263dd0D9C',
            threadhash:
              'v2:aad7f7f9129656e50bed6e5a08f254bf749e4a3de323a2b4fd3e2d188db58ef3', //cid
            isRequestAccepted: true,
          },
        }),
      },
      from: '755180533582',
      messageId: `0:1732875400813721%841${timeStamp}`,
      notification: {
        android: {
          color: '#e20880',
          imageUrl: null,
          smallIcon: 'ic_notification',
        },
        body: `${getTrimmedAddress(
          '0x9B220a17929Ac119dD3D0711d916e28263dd0D9C',
          4,
        )}: ${msg}`,
        title: 'Tech Updates',
      },
      sentTime: timeStamp,
      ttl: 2419200,
    }),
  };
  const {resolveNotification} = useNotificationsApi();
  return (
    <>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            const msg = generateRandomChatSentence();
            const timeStamp = Date.now();
            resolveNotification(chatMessage.groupChat(msg, timeStamp));
          }}
          style={{
            padding: 8,
            margin: 15,
            borderRadius: 10,
            backgroundColor: 'yellow',
          }}>
          <Text>Send Test Notification</Text>
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <FlatList
            ref={FlatListFeedsRef}
            data={feed}
            keyExtractor={item => item.sid.toString()}
            initialNumToRender={10}
            style={{flex: 1}}
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => {
              return (
                <NotificationItem
                  app={item.app}
                  chainName={item.blockchain}
                  cta={item.cta}
                  icon={item.icon}
                  image={item.image}
                  notificationTitle={
                    item.secret ? item.notification['title'] : item.title
                  }
                  notificationBody={
                    item.secret ? item.notification['body'] : item.message
                  }
                  url={item.url}
                />
              );
            }}
            onEndReached={async () => (!endReached ? fetchFeed(false) : null)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  fetchFeed(true, true);
                }}
              />
            }
            ListEmptyComponent={
              !refreshing && (
                <EmptyFeed
                  title="No notifications yet"
                  subtitle="Notifications for channels you are subscribed to will show up here."
                />
              )
            }
            ListFooterComponent={() => {
              return loading ? (
                <View style={{paddingBottom: 30, marginTop: 20}}>
                  <EPNSActivity style={styles.activity} size="small" />
                </View>
              ) : (
                <View style={styles.footer} />
              );
            }}
          />

          <ImageView
            images={loadedImages}
            imageIndex={startFromIndex}
            visible={renderGallery}
            swipeToCloseEnabled={true}
            onRequestClose={() => {
              setRenderGallery(false);
            }}
            FooterComponent={({imageIndex}) => (
              <ImagePreviewFooter
                imageIndex={imageIndex}
                imagesCount={loadedImages.length}
                fileURI={loadedImages[imageIndex].uri}
              />
            )}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  infodisplay: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoIcon: {
    height: 48,
    resizeMode: 'contain',
    margin: 10,
  },
  infoText: {
    marginVertical: 10,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  footer: {
    paddingBottom: 100,
  },
});
