import {Feather, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MediaStream, RTCView, mediaDevices} from 'react-native-webrtc';
import {useDispatch, useSelector} from 'react-redux';
import Globals from 'src/Globals';
import {
  VideoCallState,
  selectVideoCall,
  setCallEnded,
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
import {usePeer} from './peer';

const windowWidth = Dimensions.get('window').width;

const VideoScreen = () => {
  const [userMedia, setUserMedia] = useState<MediaStream | null>(null);
  const [anotherUserMedia, setAnotherUserMedia] = useState<MediaStream | null>(
    null,
  );
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {isAudioOn, isVideoOn, call} = useSelector(
    selectVideoCall,
  ) as VideoCallState;

  const connectedUser: string = call.to || '';
  const senderAddress: string = call.from || '';
  const connectionRef = React.useRef<any>();

  const getMediaStream = async () => {
    return await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
  };

  const toggleAudio = () => {
    if (userMedia) {
      isAudioOn ? disableAudio(userMedia) : enableAudio(userMedia);
      dispatch(toggleIsAudioOn());
    }
  };

  const toggleVideo = () => {
    if (userMedia) {
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
    connectionRef.current.destroy();
    navigation.goBack();
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
    });

    console.log(peer);
  }, [userMedia]);

  return (
    <LinearGradient colors={['#EEF5FF', '#ECE9FA']} style={styles.container}>
      <View style={styles.videoViewContainer}>
        {anotherUserMedia ? (
          <RTCView
            style={styles.videoView}
            objectFit="cover"
            streamURL={anotherUserMedia.toURL()} // TODO: Add remote stream
          />
        ) : (
          <RTCView
            style={styles.videoView}
            objectFit="cover"
            streamURL="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // TODO: Add remote stream
          />
        )}
        <View style={styles.smallVideoViewContainer}>
          {userMedia ? (
            <RTCView
              style={styles.videoView}
              streamURL={userMedia.toURL()} // TODO: Add local stream
              objectFit="cover"
            />
          ) : (
            <VideoPlaceholder uri={DEFAULT_AVATAR} />
          )}
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
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconContainer, !isAudioOn && styles.backgroundRed]}
          onPress={toggleAudio}>
          <Ionicons
            name={isAudioOn ? 'mic-outline' : 'mic-off-outline'}
            style={styles.icon}
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
    marginTop: 50, // TODO: Find appropriate value
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
    width: 34,
    height: 34,
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
  callendContainer: {
    width: 52,
    height: 40,
    backgroundColor: Globals.COLORS.SUBLIME_RED,
  },
  videoViewContainer: {
    borderRadius: 16,
    width: windowWidth - 10,
    overflow: 'hidden',
    flex: 1,
    zIndex: 1,
  },
  videoView: {
    flex: 1,
  },
  smallVideoViewContainer: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 198,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    // TODO: Remove below 2 lines after adding video connections
    borderWidth: 2,
    borderColor: Globals.COLORS.WHITE,
  },
  white: {
    color: Globals.COLORS.WHITE,
  },
  backgroundRed: {
    backgroundColor: Globals.COLORS.SUBLIME_RED,
  },
});

// const peer = new RNSimplePeer({
//   initiator: true,
//   trickle: false,
//   debugConsole: false,
//   // iceCompleteTimeout
//   config: {
//     ice_servers: [
//       {
//         url: 'stun:global.stun.twilio.com:3478',
//         urls: 'stun:global.stun.twilio.com:3478',
//       },
//       {
//         url: 'turn:global.turn.twilio.com:3478?transport=udp',
//         username:
//           '7c0479d041874e91392ab52c3e403efe90202051a393e5a03d3a938b3af21ff8',
//         urls: 'turn:global.turn.twilio.com:3478?transport=udp',
//         credential: '6+sioRGkn7oS7L+HlwaZW1jfxylpBoJvCdFDvE26GPg=',
//       },
//       {
//         url: 'turn:global.turn.twilio.com:3478?transport=tcp',
//         username:
//           '7c0479d041874e91392ab52c3e403efe90202051a393e5a03d3a938b3af21ff8',
//         urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
//         credential: '6+sioRGkn7oS7L+HlwaZW1jfxylpBoJvCdFDvE26GPg=',
//       },
//       {
//         url: 'turn:global.turn.twilio.com:443?transport=tcp',
//         username:
//           '7c0479d041874e91392ab52c3e403efe90202051a393e5a03d3a938b3af21ff8',
//         urls: 'turn:global.turn.twilio.com:443?transport=tcp',
//         credential: '6+sioRGkn7oS7L+HlwaZW1jfxylpBoJvCdFDvE26GPg=',
//       },
//     ],
//   },
//   webRTC: {
//     RTCPeerConnection,
//     RTCIceCandidate,
//     RTCSessionDescription,
//   },
//   offerOptions: {},
//   stream: stream,
// });
