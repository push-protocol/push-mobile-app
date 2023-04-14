import {Feather, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {createSocketConnection} from '@pushprotocol/socket';
import {ENV, EVENTS} from '@pushprotocol/socket/src/lib/constants';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RNPeer from 'react-native-simple-peer';
import {
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';
import {useDispatch, useSelector} from 'react-redux';
import Peer from 'simple-peer';
import Globals from 'src/Globals';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
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
import {sendCallPayload} from './connection';

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

  let called = false;

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

      try {
        const stream = await getMediaStream();
        setUserMedia(stream);
        return;

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
          wrtc: {
            RTCPeerConnection,
            RTCIceCandidate,
            RTCSessionDescription,
            // @ts-ignore
            RTCView,
            MediaStream,
            MediaStreamTrack,
            mediaDevices,
            registerGlobals,
          },
          config: {
            ice_servers: [
              {
                url: 'stun:global.stun.twilio.com:3478',
                urls: 'stun:global.stun.twilio.com:3478',
              },
              {
                url: 'turn:global.turn.twilio.com:3478?transport=udp',
                username:
                  '7c0479d041874e91392ab52c3e403efe90202051a393e5a03d3a938b3af21ff8',
                urls: 'turn:global.turn.twilio.com:3478?transport=udp',
                credential: '6+sioRGkn7oS7L+HlwaZW1jfxylpBoJvCdFDvE26GPg=',
              },
              {
                url: 'turn:global.turn.twilio.com:3478?transport=tcp',
                username:
                  '7c0479d041874e91392ab52c3e403efe90202051a393e5a03d3a938b3af21ff8',
                urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
                credential: '6+sioRGkn7oS7L+HlwaZW1jfxylpBoJvCdFDvE26GPg=',
              },
              {
                url: 'turn:global.turn.twilio.com:443?transport=tcp',
                username:
                  '7c0479d041874e91392ab52c3e403efe90202051a393e5a03d3a938b3af21ff8',
                urls: 'turn:global.turn.twilio.com:443?transport=tcp',
                credential: '6+sioRGkn7oS7L+HlwaZW1jfxylpBoJvCdFDvE26GPg=',
              },
            ],
          },
        });

        // @ts-ignore
        peer.on('signal', (_data: any) => {
          if (!called) {
            called = true;
            console.log('CALL USER -> SIGNAL CALLBACK', _data);

            // ring the user
            sendCallPayload(connectedUser, senderAddress, _data)
              .then(r => console.log(r.status))
              .catch(e => console.error(e));
          }
        });

        // @ts-ignore
        peer.on('stream', (_data: any) => {
          console.log('got stream ', _data);
          // console.log('----------------- stream -------------------------------');
          if (_data.currentTarget && _data.currentTarget._remoteStreams) {
            _data = _data.currentTarget._remoteStreams[0];
          }
          //console.log('Got peer stream!!!', peerId, stream);

          // peer.stream = stream;
          setAnotherUserMedia(_data);
        });

        // Save the peer connection
        connectionRef.current = peer;

        // listenback from the user
        const socket = createSocketConnection({
          user: caip10ToWallet(connectedUser),
          env: ENV.STAGING,
          socketOptions: {autoConnect: true, reconnectionAttempts: 3},
        });

        if (socket) {
          socket.on(EVENTS.USER_FEEDS, (feedItem: any) => {
            console.log('*** got feed');

            try {
              const {payload} = feedItem || {};

              // if video meta, skip notification
              if (
                payload.hasOwnProperty('data') &&
                payload.data.hasOwnProperty('videoMeta')
              ) {
                const videoMeta = JSON.parse(payload.data.videoMeta);

                if (videoMeta.status === 1) {
                  // incoming call
                  // TODO incomingCall(videoMeta);
                } else if (videoMeta.status === 2) {
                  const signalData = videoMeta.signalData;
                  console.log('got the signal data', signalData);
                  peer.signal(signalData);
                }
              }
            } catch (e) {
              console.error('Error while diplaying received Notification: ', e);
            }
          });

          socket.on(EVENTS.CONNECT, () => {
            console.log('socket connection connection done');
          });
        }
      } catch (error) {
        console.log('eee ', error);
      }
    })();
  }, []);

  const [receiverPeerSignalled, setRecieverPeerSignalled] = useState(false);
  useEffect(() => {
    if (!userMedia) {
      return;
    }

    let toAddress = connectedUser;
    let fromAddress = senderAddress;
    console.log('******ANSWER CALL');

    try {
      const peer2: any = new RNPeer({
        initiator: true,
        trickle: true,
        config: {},
        webRTC: {
          RTCPeerConnection,
          RTCIceCandidate,
          RTCSessionDescription,
        },
        stream: userMedia,
      });
      console.log('answer call -> data');
      const res = peer2.signal(call.signal);
      console.log('got res', res);

      console.log('Sending Payload for answer call - Step 1');

      peer2.on('signal', (data: any) => {
        console.log('ANSWER CALL -> SIGNAL CALLBACK');
        console.log('RECIEVER PEER SIGNALED', receiverPeerSignalled);

        // send answer call notification
        // Prepare post request
        // 1 is call initiated, 2 is call answered, 3 is completed
        console.log(
          'Sending Payload for answer call - Peer on Signal - Step 2',
        );
        if (!receiverPeerSignalled) {
          setRecieverPeerSignalled(true);

          console.log(
            'Sending Payload for answer call - Peer on Signal - Step 3',
            receiverPeerSignalled,
          );
          const videoPayload: any = {
            userToCall: toAddress,
            fromUser: fromAddress,
            signalData: data,
            name: 'name',
            status: 2,
          };
          let identityPayload = {
            notification: {
              title: 'VideoCall',
              body: 'VideoCall',
            },
            data: {
              amsg: 'VideoCall',
              asub: 'VideoCall',
              type: '3',
              etime: Date.now() + 245543,
              hidden: '1',
              videoMeta: videoPayload,
            },
          };

          const identityType: number = 2;
          const stringifiedData: string = JSON.stringify(identityPayload);
          const identity: string = `${identityType}+${stringifiedData}`;

          const payload: any = {
            sender: `eip155:42:${toAddress}`,
            recipient: `eip155:42:${fromAddress}`,
            identity: identity,
            source: 'PUSH_VIDEO',
          };

          console.log('****/// sending payload', payload);

          const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
          };
          fetch(
            'https://backend-staging.epns.io/apis/v1/payloads/video/poc',
            requestOptions,
          );
        }
        // socket.emit('answerCall', { signal: data, to: call.from });
      });

      peer2.on('connect', () => {
        // wait for 'connect' event before using the data channel
        peer2.send('hey caller, how is it going?');
      });

      peer2.on('stream', (currentStream: MediaStream) => {
        console.log('GOT STREAM BACK IN ANSWERCALL');
        setAnotherUserMedia(currentStream);
      });

      peer2.on('error', (err: any) => {
        console.log('!!!!!!!! err', err);
      });

      connectionRef.current = peer2;
    } catch (error) {
      console.log('------err: ', error);
    }
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
