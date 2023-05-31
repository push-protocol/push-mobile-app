import {Feather, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import InCallManager from 'react-native-incall-manager';
import LinearGradient from 'react-native-linear-gradient';
import {MediaStream, RTCView, mediaDevices} from 'react-native-webrtc';
import {useDispatch, useSelector} from 'react-redux';
import Globals from 'src/Globals';
import {
  selectVideoCall,
  setCallEnded,
  setIncomingAudioOn,
  setIncomingVideoOn,
  setReceiverPeerSignalled,
  toggleIsAudioOn,
  toggleIsVideoOn,
} from 'src/redux/videoSlice';
import {
  disableAudio,
  disableVideo,
  enableAudio,
  enableVideo,
  toggleCamera,
} from 'src/socket';

import {DEFAULT_AVATAR} from '../chats/constants';
import VideoPlaceholder from './components/VideoPlaceholder';
import {VIDEO_DATA} from './helpers/constants';
import {usePeer} from './helpers/peer';

const windowWidth = Dimensions.get('window').width;

const VideoScreen = () => {
  const [userMedia, setUserMedia] = useState<MediaStream | null>(null);
  const [anotherUserMedia, setAnotherUserMedia] = useState<MediaStream | null>(
    null,
  );
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {isAudioOn, isVideoOn, call, incomingVideoOn} =
    useSelector(selectVideoCall);

  const connectedUser: string = call.to || '';
  const senderAddress: string = call.from || '';
  const connectionRef = React.useRef<any>();

  const getMediaStream = async () => {
    const devices = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    if (Platform.OS === 'ios') {
      InCallManager.setForceSpeakerphoneOn(
        !InCallManager.getIsWiredHeadsetPluggedIn(),
      );
    } else if (Platform.OS === 'android') {
      InCallManager.setSpeakerphoneOn(true);
    }

    DeviceEventEmitter.addListener(
      'WiredHeadset',
      ({isPlugged, hasMic}: {isPlugged: boolean; hasMic: boolean}) => {
        console.log('WiredHeadset', isPlugged, hasMic);
        if (isPlugged && hasMic) {
          InCallManager.setForceSpeakerphoneOn(false);
        } else if (Platform.OS === 'ios') {
          InCallManager.setForceSpeakerphoneOn(!isPlugged);
        } else if (Platform.OS === 'android') {
          InCallManager.setSpeakerphoneOn(!isPlugged);
        }
      },
    );

    return devices;
  };

  const toggleAudio = () => {
    if (userMedia) {
      const peer = connectionRef.current;
      try {
        peer?.send(
          JSON.stringify({
            type: VIDEO_DATA.AUDIO_STATUS,
            isAudioOn: !isAudioOn,
          }),
        );
      } catch (e) {}
      isAudioOn ? disableAudio(userMedia) : enableAudio(userMedia);
      dispatch(toggleIsAudioOn());
    }
  };

  const toggleVideo = () => {
    if (userMedia) {
      const peer = connectionRef.current;
      try {
        peer?.send(
          JSON.stringify({
            type: VIDEO_DATA.VIDEO_STATUS,
            isVideoOn: !isVideoOn,
          }),
        );
      } catch (e) {}
      isVideoOn ? disableVideo(userMedia) : enableVideo(userMedia);
      dispatch(toggleIsVideoOn());
    }
  };

  const changeCamera = () => {
    if (userMedia) {
      toggleCamera(userMedia);
    }
  };

  const endCall = () => {
    dispatch(setReceiverPeerSignalled(false));
    dispatch(setCallEnded(true));
    const peer = connectionRef.current;
    try {
      peer?.send(
        JSON.stringify({type: VIDEO_DATA.END_CALL, endLocalStream: true}),
      );
    } catch (e) {
      console.log('Error while sending end call notification', e);
    }
    connectionRef.current?.destroy();
    if (!isVideoOn) {
      dispatch(toggleIsVideoOn());
    }
    if (!isAudioOn) {
      dispatch(toggleIsAudioOn());
    }
    navigation.goBack();
  };

  const setIncomingAudioStatus = (status: boolean) => {
    dispatch(setIncomingAudioOn(status));
  };

  const setIncomingVideoStatus = (status: boolean) => {
    dispatch(setIncomingVideoOn(status));
  };

  useEffect(() => {
    (async () => {
      console.log('<<<called');
      const stream = await getMediaStream();
      setUserMedia(stream);
    })();
  }, []);

  const [rcalled, rsetCalled] = useState(false);
  useEffect(() => {
    if (!userMedia) {
      return;
    }

    let toAddress = connectedUser;
    let fromAddress = senderAddress;
    console.log('******ANSWER CALL');
    const peer = usePeer({
      calling: call.calling,
      call: call,
      connectionRef: connectionRef,
      fromAddress,
      toAddress,
      userMedia,
      setAnotherUserMedia,
      rcalled,
      rsetCalled,
      isVideoOn,
      isAudioOn,
      setIncomingAudioStatus,
      setIncomingVideoStatus,
      onEndCall: endCall,
    });

    console.log(peer);
  }, [userMedia]);

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
