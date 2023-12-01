import {Asset} from 'expo-asset';
import {LinearGradient} from 'expo-linear-gradient';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GLOBALS from 'src/Globals';
import StylishLabel from 'src/components/labels/StylishLabel';
import DownloadHelper from 'src/helpers/DownloadHelper';
import {MediaHelper} from 'src/helpers/MediaHelper';
import useDecrypt from 'src/helpers/useDecrypt';

import ImageDownloadWithIndicator from '../loaders/ImageDownloadWithIndicator';
import VideoDownloadWithIndicator from '../loaders/VideoDownloadWithIndicator';

function extractTimeStamp(notificationBody: string): {
  notificationBody: string;
  timeStamp: string;
  originalBody: string;
} {
  const parsedBody = {
    notificationBody: notificationBody,
    timeStamp: '',
    originalBody: notificationBody,
  };
  const matches = notificationBody.match(/\[timestamp:(.*?)\]/);
  if (matches) {
    parsedBody.timeStamp = matches[1];
    const textWithoutTimeStamp = notificationBody.replace(
      / *\[timestamp:[^)]*\] */g,
      '',
    );
    parsedBody.notificationBody = textWithoutTimeStamp;
    parsedBody.originalBody = textWithoutTimeStamp;
  }
  return parsedBody;
}

function convertTimeStamp(timeStamp: string) {
  return moment
    .utc(parseInt(timeStamp) * 1000)
    .local()
    .format('DD MMM YYYY | hh:mm A');
}

type chainNameType =
  | 'ETH_TEST_SEPOLIA'
  | 'POLYGON_TEST_MUMBAI'
  | 'ETH_MAINNET'
  | 'POLYGON_MAINNET'
  | 'BSC_MAINNET'
  | 'BSC_TESTNET'
  | 'OPTIMISM_MAINNET'
  | 'OPTIMISM_TESTNET'
  | 'POLYGON_ZK_EVM_TESTNET'
  | 'POLYGON_ZK_EVM_MAINNET'
  | 'ARBITRUMONE_MAINNET'
  | 'ARBITRUM_TESTNET'
  | 'THE_GRAPH'
  | undefined;

export type NotificationItemProps = {
  notificationTitle: string | undefined;
  notificationBody: string | undefined;
  cta: string | undefined;
  app: string | undefined;
  icon: string | undefined;
  image: string | undefined;
  url: string | undefined;
  isSpam?: boolean;
  subscribeFn?: () => Promise<unknown>;
  isSubscribedFn?: () => Promise<unknown>;
  theme?: string | undefined;
  chainName: chainNameType;
  isSecret?: boolean;
  decryptFn?: () => Promise<{
    title: string;
    body: string;
    cta: string;
    image: string;
  }>;
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notificationTitle,
  notificationBody,
  cta,
  app,
  icon,
  image,
  url,
  isSpam,
  isSubscribedFn,
  subscribeFn,
  theme,
  chainName,
  isSecret,
  decryptFn,
}) => {
  const {notificationBody: parsedBody, timeStamp} = extractTimeStamp(
    notificationBody || '',
  );

  const {
    notifTitle,
    notifBody,
    notifCta,
    notifImage,
    setDecryptedValues,
    isSecretRevealed,
  } = useDecrypt({notificationTitle, parsedBody, cta, image}, isSecret);

  const isCtaURLValid = MediaHelper.validURL(notifCta);
  const isChannelURLValid = MediaHelper.validURL(url);

  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true);

  const showMetaInfo = isSecret || timeStamp;

  const gotToCTA = () => {
    if (!isCtaURLValid || !notifCta) return;
    Linking.canOpenURL(notifCta).then(supported => {
      if (supported) {
        Linking.openURL(notifCta!);
      }
    });
  };

  const goToURL = () => {
    if (!isChannelURLValid || !url) return;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url!);
      }
    });
  };

  const onSubscribe = async () => {
    if (!subscribeFn) return;
    try {
      setSubscribeLoading(true);
      await subscribeFn();
      setIsSubscribed(true);
    } finally {
      setSubscribeLoading(false);
    }
  };

  const onDecrypt = async () => {
    if (decryptFn) {
      try {
        const decryptedPayload = await decryptFn();
        if (decryptedPayload) {
          setDecryptedValues(decryptedPayload);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const onImagePreview = async (fileURL: string) => {
    await Asset.loadAsync(fileURL);
  };

  useEffect(() => {
    if (!isSpam || !isSubscribedFn) return;

    isSubscribedFn().then((res: unknown) => {
      setIsSubscribed(Boolean(res));
    });
  }, [isSubscribedFn, isSpam]);

  if (isSubscribed && isSpam) return null;

  const ctaBorderEnabled = cta && cta !== '' ? true : false;

  return (
    <TouchableOpacity
      style={[styles.container]}
      onPress={gotToCTA}
      disabled={!isCtaURLValid}>
      {ctaBorderEnabled ? (
        <LinearGradient
          colors={[
            GLOBALS.COLORS.GRADIENT_SECONDARY,
            GLOBALS.COLORS.GRADIENT_SECONDARY,
          ]}
          style={[styles.cover]}
          start={[0.1, 0.3]}
          end={[1, 1]}></LinearGradient>
      ) : (
        <View style={[styles.cover, styles.coverPlain]}></View>
      )}
      <View style={styles.inner}>
        <View style={styles.header}>
          <View>
            <TouchableOpacity
              style={[styles.appLink]}
              onPress={goToURL}
              disabled={!isChannelURLValid}>
              <Image style={styles.appicon} source={{uri: icon}} />
              <Text style={styles.apptext} numberOfLines={1}>
                {app}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.content]}>
          <View>
            {!notifImage ? null : DownloadHelper.isMediaSupportedVideo(
                notifImage,
              ) ? (
              <View style={[styles.contentVid]}>
                <VideoDownloadWithIndicator
                  style={[styles.msgVid]}
                  fileURL={notifImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={[styles.contentImg]}>
                <ImageDownloadWithIndicator
                  style={[styles.msgImg]}
                  fileURL={notifImage}
                  imgsrc={false}
                  resizeMode="contain"
                  onPress={() => {
                    onImagePreview(notifImage);
                  }}
                />
              </View>
            )}

            <View style={[styles.contentBody]}>
              {!notifTitle ? null : (
                <Text style={[styles.msgSub]}>{notifTitle}</Text>
              )}

              <StylishLabel
                style={[styles.msg]}
                fontSize={14}
                title={notifBody}
              />

              {!timeStamp ? null : (
                <View style={styles.timestampOuter}>
                  <Text style={styles.timestamp}>
                    {convertTimeStamp(timeStamp)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Define default props
NotificationItem.defaultProps = {
  notificationTitle: '',
  notificationBody: '',
  cta: '',
  app: '',
  image: '',
  url: '',
  isSpam: false,
  theme: 'light',
};

// Define StyleSheet
const styles = StyleSheet.create({
  container: {
    // width: "100%",
    marginVertical: 15,
    marginHorizontal: 20,
  },
  cover: {
    // position: 'absolute',
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    flex: 1,
    borderRadius: GLOBALS.ADJUSTMENTS.FEED_ITEM_RADIUS,
  },
  coverPlain: {
    backgroundColor: GLOBALS.COLORS.SLIGHT_GRAY,
  },
  inner: {
    margin: 1,
    overflow: 'hidden',
    borderRadius: GLOBALS.ADJUSTMENTS.FEED_ITEM_RADIUS,
  },
  header: {
    width: '100%',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: GLOBALS.COLORS.SLIGHTER_GRAY,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: GLOBALS.COLORS.SLIGHT_GRAY,
  },
  appInfo: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'red',
  },
  appLink: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  appicon: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    height: 24,
    aspectRatio: 1,
    marginRight: 5,
    overflow: 'hidden',
    backgroundColor: GLOBALS.COLORS.SLIGHT_GRAY,
  },
  apptext: {
    marginRight: 10,
    marginLeft: 5,
    fontSize: 12,
    color: GLOBALS.COLORS.MID_BLACK_TRANS,
    fontWeight: '300',
  },
  appsecret: {
    width: 16,
    height: 16,
    borderRadius: 16,
  },
  content: {
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  contentLoader: {
    margin: 20,
  },
  contentVid: {
    width: '100%',
  },
  msgVid: {
    borderColor: GLOBALS.COLORS.SLIGHT_GRAY,
    backgroundColor: GLOBALS.COLORS.SLIGHTER_GRAY,
    borderBottomWidth: 1,
  },
  contentImg: {
    width: '100%',
    aspectRatio: 2,
  },
  msgImg: {
    borderColor: GLOBALS.COLORS.SLIGHT_GRAY,
    backgroundColor: GLOBALS.COLORS.SLIGHTER_GRAY,
    borderBottomWidth: 1,
    resizeMode: 'contain',
  },
  contentBody: {
    paddingHorizontal: 15,
  },
  msgSub: {
    fontSize: 16,
    fontWeight: '300',
    color: GLOBALS.COLORS.MID_BLACK_TRANS,
    paddingVertical: 10,
  },
  msg: {
    paddingTop: 5,
    paddingBottom: 20,
  },
  timestampOuter: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: -20,
    borderTopLeftRadius: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: GLOBALS.COLORS.SLIGHT_GRAY,
    overflow: 'hidden',

    backgroundColor: GLOBALS.COLORS.SLIGHTER_GRAY,
  },
  timestamp: {
    fontWeight: '300',
    fontSize: 12,

    color: GLOBALS.COLORS.MID_BLACK_TRANS,
  },
  link: {
    textDecorationLine: 'none',
    color: GLOBALS.COLORS.PINK,
  },
});

export default NotificationItem;
