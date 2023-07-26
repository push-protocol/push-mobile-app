import {Feather, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RTCView} from 'react-native-webrtc';
import {useDispatch, useSelector} from 'react-redux';
import Globals from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import {VideoCallContext, initVideoCallData} from 'src/contexts/VideoContext';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import {
  selectVideoCall,
  setOtherUserProfilePicture,
} from 'src/redux/videoSlice';
import {endStream, toggleCamera} from 'src/socket';

import {DEFAULT_AVATAR} from '../chats/constants';
import VideoPlaceholder from './components/VideoPlaceholder';
import {VideoCallStatus} from './helpers/video';

const windowWidth = Dimensions.get('window').width;

const VideoScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {otherUserProfilePicture} = useSelector(selectVideoCall);
  const [profilePicture, setProfilePicture] = useState<string>();

  const {
    videoCallData: data,
    disconnectWrapper: disconnect,
    toggleVideoWrapper: toggleVideo,
    toggleAudioWrapper: toggleAudio,
    requestWrapper,
    createWrapper,
  } = useContext(VideoCallContext);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // @ts-ignore
      navigation.navigate(Globals.SCREENS.SPLASH);
    }
  };

  const endCall = () => {
    disconnect();
    handleGoBack();
  };

  const changeCamera = () => {
    if (data.local.stream) {
      toggleCamera(data.local.stream);
    }
  };

  useEffect(() => {
    (async () => {
      if (data.incoming[0].status === VideoCallStatus.INITIALIZED) {
        if (data.local.stream === null) {
          await createWrapper();
        }
        requestWrapper({
          senderAddress: data.local.address,
          recipientAddress: data.incoming[0].address,
          chatId: data.meta.chatId,
        });
      }
    })();

    return () => {
      // Cleanup - end camera/mic streams when screen unmounts
      if (data.local.stream) {
        endStream(data.local.stream);
      }
      setOtherUserProfilePicture(undefined);
    };
  }, []);

  useEffect(() => {
    if (data === initVideoCallData) {
      handleGoBack();
    }
  }, [data]);

  useEffect(() => {
    (async () => {
      if (otherUserProfilePicture === undefined) {
        const otherUser = await PushNodeClient.getUser(
          walletToCAIP10(data.incoming[0].address),
        );
        dispatch(
          setOtherUserProfilePicture(
            otherUser?.profilePicture || DEFAULT_AVATAR,
          ),
        );
      }
      if (profilePicture === undefined) {
        const profile = await PushNodeClient.getUser(
          walletToCAIP10(data.local.address),
        );
        setProfilePicture(profile?.profilePicture || DEFAULT_AVATAR);
      }
    })();
  }, []);

  return (
    <LinearGradient colors={['#EEF5FF', '#ECE9FA']} style={styles.container}>
      <View style={styles.videoViewContainer}>
        <View style={styles.videoViewWrapper}>
          {data.incoming[0].stream && data.incoming[0].video ? (
            <RTCView
              style={styles.videoView}
              objectFit="cover"
              streamURL={data.incoming[0].stream.toURL()}
            />
          ) : (
            <VideoPlaceholder uri={otherUserProfilePicture || DEFAULT_AVATAR} />
          )}
        </View>
        <View style={styles.smallVideoViewContainer}>
          <View style={styles.videoViewWrapper}>
            {data.local.stream && data.local.video ? (
              <RTCView
                style={styles.videoView}
                streamURL={data.local.stream.toURL()}
                objectFit="cover"
                zOrder={1}
              />
            ) : (
              <VideoPlaceholder uri={profilePicture || DEFAULT_AVATAR} />
            )}
          </View>
        </View>
      </View>
      <View style={styles.options}>
        <TouchableOpacity style={styles.iconContainer} onPress={changeCamera}>
          <Ionicons name="md-camera-reverse-outline" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconContainer,
            !data.local.video && styles.backgroundRed,
          ]}
          onPress={toggleVideo}>
          <Feather
            name={data.local.video ? 'video' : 'video-off'}
            style={styles.featherIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconContainer,
            !data.local.audio && styles.backgroundRed,
          ]}
          onPress={toggleAudio}>
          <Feather
            name={data.local.audio ? 'mic' : 'mic-off'}
            style={styles.featherIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconContainer, styles.callendContainer]}
          onPress={endCall}>
          <MaterialIcons name="call-end" style={[styles.icon, styles.white]} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default VideoScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Globals.COLORS.SLIGHT_GRAY,
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 64,
  },
  options: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 18,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Globals.COLORS.WHITE,
    borderRadius: 10,
    fontSize: 24,
    shadowColor: Globals.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.51,
    elevation: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  icon: {
    fontSize: 24,
    color: Globals.COLORS.BLACK,
  },
  featherIcon: {
    fontSize: 20,
    color: Globals.COLORS.BLACK,
  },
  callendContainer: {
    width: 80,
    height: 48,
    backgroundColor: Globals.COLORS.SUBLIME_RED,
  },
  videoViewContainer: {
    borderRadius: 16,
    width: windowWidth - 10,
    flex: 1,
    shadowColor: Globals.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 1.51,
    shadowOpacity: 0.16,
    elevation: 1,
  },
  videoView: {
    flex: 1,
  },
  smallVideoViewContainer: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 198,
    height: 120,
    borderRadius: 16,
    shadowColor: Globals.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 1.51,
    shadowOpacity: 0.32,
    elevation: 4,
    zIndex: 1,
  },
  white: {
    color: Globals.COLORS.WHITE,
  },
  backgroundRed: {
    backgroundColor: Globals.COLORS.SUBLIME_RED,
  },
  videoViewWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
