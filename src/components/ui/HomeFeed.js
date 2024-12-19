import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import ImagePreviewFooter from 'src/components/ui/ImagePreviewFooter';
import {useNotificationsApi} from 'src/contexts/NotificationContext';
import {usePushApi} from 'src/contexts/PushApiContext';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';

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

  return (
    <>
      <SafeAreaView style={styles.container}>
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
