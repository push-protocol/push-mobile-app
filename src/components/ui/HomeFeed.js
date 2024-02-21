import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import StylishLabel from 'src/components/labels/StylishLabel';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import ImagePreviewFooter from 'src/components/ui/ImagePreviewFooter';
import {usePushApi} from 'src/contexts/PushApiContext';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';

import NotificationItem from './NotificationItem';

export default function InboxFeed(props) {
  const {userPushSDKInstance, userInfo} = usePushApi();

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

  // SET REFS
  const FlatListFeedsRef = useRef(null);

  // LOGIC
  useEffect(() => {
    if (!initialized && userPushSDKInstance) {
      fetchInitializedFeeds();
    }
  }, [initialized, userPushSDKInstance]);

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
              refreshing ? (
                <View style={[styles.infodisplay, styles.noPendingFeeds]}>
                  <StylishLabel
                    style={styles.infoText}
                    fontSize={16}
                    title="[dg:Please wait, Refreshing feed.!]"
                  />
                </View>
              ) : (
                <View style={[styles.infodisplay, styles.noPendingFeeds]}>
                  <Image
                    style={styles.infoIcon}
                    source={require('assets/ui/feed.png')}
                  />
                  <StylishLabel
                    style={styles.infoText}
                    fontSize={16}
                    title="[dg:No Notifications!]"
                  />
                </View>
              )
            }
            ListFooterComponent={() => {
              return loading ? (
                <View style={{paddingBottom: 30, marginTop: 20}}>
                  <EPNSActivity style={styles.activity} size="small" />
                </View>
              ) : null;
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
});
