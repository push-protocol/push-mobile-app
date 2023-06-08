import {Feather, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RTCView} from 'react-native-webrtc';
import Globals from 'src/Globals';
import {VideoCallContext} from 'src/contexts/VideoContext';
import {toggleCamera} from 'src/socket';

import {DEFAULT_AVATAR} from '../chats/constants';
import VideoPlaceholder from './components/VideoPlaceholder';
import {VideoCallStatus} from './helpers/video';

const windowWidth = Dimensions.get('window').width;

const VideoScreen = () => {
  const navigation = useNavigation();

  const {
    videoCallData: data,
    disconnectWrapper: disconnect,
    toggleVideoWrapper: toggleVideo,
    toggleAudioWrapper: toggleAudio,
    requestWrapper,
    createWrapper,
  } = useContext(VideoCallContext);

  const endCall = () => {
    disconnect();
    navigation.goBack();
  };

  const changeCamera = () => {
    if (userMedia) {
      toggleCamera(userMedia);
    }
  };

  const anotherUserMedia = data.incoming[0].stream;
  const incomingVideoOn = data.incoming[0].video;
  const userMedia = data.local.stream;
  const isVideoOn = data.local.video;
  const isAudioOn = data.local.audio;

  useEffect(() => {
    (async () => {
      console.log('VideoScreen useEffect called', data);
      if (data.local.stream === null) {
        await createWrapper();
      }
      if (data.incoming[0].status === VideoCallStatus.INITIALIZED) {
        requestWrapper({
          senderAddress: data.local.address,
          recipientAddress: data.incoming[0].address,
          chatId: data.meta.chatId,
        });
      }
    })();
  }, []);

  return (
    <LinearGradient colors={['#EEF5FF', '#ECE9FA']} style={styles.container}>
      <View style={styles.videoViewContainer}>
        <View style={styles.videoViewWrapper}>
          {anotherUserMedia && incomingVideoOn ? (
            <RTCView
              style={styles.videoView}
              objectFit="cover"
              streamURL={anotherUserMedia.toURL()}
            />
          ) : (
            <VideoPlaceholder uri={DEFAULT_AVATAR} />
          )}
        </View>
        <View style={styles.smallVideoViewContainer}>
          <View style={styles.videoViewWrapper}>
            {userMedia && isVideoOn ? (
              <RTCView
                style={styles.videoView}
                streamURL={userMedia.toURL()}
                objectFit="cover"
                zOrder={1}
              />
            ) : (
              <VideoPlaceholder uri={DEFAULT_AVATAR} />
            )}
          </View>
        </View>
      </View>
      <View style={styles.options}>
        <TouchableOpacity style={styles.iconContainer} onPress={changeCamera}>
          <Ionicons name="md-camera-reverse-outline" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconContainer, !isVideoOn && styles.backgroundRed]}
          onPress={toggleVideo}>
          <Feather
            name={isVideoOn ? 'video' : 'video-off'}
            style={styles.featherIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconContainer, !isAudioOn && styles.backgroundRed]}
          onPress={toggleAudio}>
          <Feather
            name={isAudioOn ? 'mic' : 'mic-off'}
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
