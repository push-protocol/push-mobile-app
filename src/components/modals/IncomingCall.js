import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {BlurView} from 'expo-blur';
import React, {useContext, useEffect, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RTCView} from 'react-native-webrtc';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import {VideoCallContext} from 'src/contexts/VideoContext';
import {DEFAULT_AVATAR} from 'src/navigation/screens/chats/constants';
import VideoPlaceholder from 'src/navigation/screens/video/components/VideoPlaceholder';
import {selectVideoCall} from 'src/redux/videoSlice';
import MetaStorage from 'src/singletons/MetaStorage';

const windowWidth = Dimensions.get('window').width;

const formattedAddress = address => {
  if (address.length < 10) {
    return address;
  }
  return address.slice(0, 8) + '...' + address.slice(-5);
};

const IncomingCall = ({stream}) => {
  const [fader] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  const {videoCallData, acceptRequestWrapper, disconnectWrapper} =
    useContext(VideoCallContext);
  const {otherUserProfilePicture} = useSelector(selectVideoCall);

  const handleAnswer = () => {
    (async () => {
      const {pgpPrivateKey} = await MetaStorage.instance.getUserChatData();
      acceptRequestWrapper({
        senderAddress: videoCallData.local.address,
        recipientAddress: videoCallData.incoming[0].address,
        chatId: videoCallData.meta.chatId,
        pgpPrivateKey: pgpPrivateKey,
      });
      // @ts-ignore
      navigation.navigate(GLOBALS.SCREENS.VIDEOCALL);
    })();
  };

  useEffect(() => {
    Animated.timing(fader, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      Animated.timing(fader, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };
  }, []);

  return (
    <Animated.View style={[{opacity: fader}, styles.container]}>
      <BlurView tint="light" intensity={100} style={styles.flex}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.6)', 'rgba(236, 233, 250, 0.6)']}
          useAngle
          angle={179.97}
          style={styles.flex}>
          <Ionicons
            name="close"
            style={styles.closeIcon}
            onPress={disconnectWrapper}
          />
          <View style={styles.detailsContainer}>
            <Image
              source={{uri: otherUserProfilePicture || DEFAULT_AVATAR}}
              style={styles.image}
            />
            <View style={styles.textContainer}>
              <Text style={styles.name}>
                {formattedAddress(videoCallData.incoming[0].address)}
              </Text>
              <Text style={styles.description}>Incoming Video Call</Text>
            </View>
          </View>
          <View style={styles.centeredContent}>
            <View style={styles.video}>
              {stream ? (
                <RTCView
                  style={styles.flex}
                  streamURL={stream.toURL()}
                  objectFit="cover"
                />
              ) : (
                <VideoPlaceholder
                  uri={otherUserProfilePicture || DEFAULT_AVATAR}
                />
              )}
            </View>
            <View style={styles.options}>
              <TouchableOpacity
                style={styles.callAccept}
                onPress={handleAnswer}>
                <Ionicons name="videocam" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.callReject}
                onPress={disconnectWrapper}>
                <MaterialIcons name="call-end" size={26} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

export default IncomingCall;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: GLOBALS.COLORS.WHITE,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    borderStyle: 'solid',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
  flex: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  image: {
    width: 46.29,
    height: 46.29,
    resizeMode: 'cover',
    borderRadius: 46.29 / 2,
    overflow: 'hidden',
  },
  video: {
    borderRadius: 24,
    width: windowWidth - 90,
    flex: 1,
    overflow: 'hidden',
    marginTop: 34,
  },
  callAccept: {
    width: 73,
    height: 44,
    borderRadius: 16,
    backgroundColor: GLOBALS.COLORS.CONFIRM_GREEN_LIGHT,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  callReject: {
    width: 60,
    height: 44,
    borderRadius: 16,
    backgroundColor: GLOBALS.COLORS.BADGE_RED,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  options: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 34,
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 34,
  },
  closeIcon: {
    alignSelf: 'flex-end',
    marginRight: 41,
    marginTop: 25,
    fontSize: 24,
    color: GLOBALS.COLORS.CHAT_LIGHT_DARK,
  },
  textContainer: {
    marginLeft: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: GLOBALS.COLORS.CHAT_BLACK,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: GLOBALS.COLORS.CHAT_BLACK,
  },
});
