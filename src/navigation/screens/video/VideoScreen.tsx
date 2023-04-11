import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {createSocketConnection} from '@pushprotocol/socket';
import {ENV, EVENTS} from '@pushprotocol/socket/src/lib/constants';
import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RNSimplePeer from 'react-native-simple-peer';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc';
import Globals from 'src/Globals';
import {ConnectedUser} from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import {sendCallPayload} from './connection';

const windowWidth = Dimensions.get('window').width;

const VideoScreen = ({route}: any) => {
  const {data} = route.params;
  const connectedUser: ConnectedUser = data.connectedUser;
  const senderAddress: string = data.senderAddress;

  const [userMedia, setUserMedia] = useState<MediaStream | null>(null);
  const [anotherUserMedia, setAnotherUserMedia] = useState<MediaStream | null>(
    null,
  );

  const getMediaStream = async () => {
    return await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
  };

  let called = false;

  useEffect(() => {
    (async () => {
      console.log('<<<called');

      try {
        const stream = await getMediaStream();

        setUserMedia(stream);

        const peer = new RNSimplePeer({
          initiator: true,
          trickle: false,
          config: {},
          webRTC: {
            RTCPeerConnection,
            RTCIceCandidate,
            RTCSessionDescription,
          },
          offerOptions: {},
          stream: stream,
        });

        // @ts-ignore
        peer.on('signal', (_data: any) => {
          if (!called) {
            called = true;
            console.log('CALL USER -> SIGNAL CALLBACK', _data);

            // ring the user
            sendCallPayload(connectedUser.wallets, senderAddress, _data)
              .then(r => console.log(r.status))
              .catch(e => console.error(e));
          }
        });

        // @ts-ignore
        peer.on('stream', (_data: any) => {
          setAnotherUserMedia(_data);
        });

        // listenback from the user
        const socket = createSocketConnection({
          user: caip10ToWallet(connectedUser.wallets),
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
            <RTCView
              style={styles.videoView}
              streamURL="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // TODO: Add local stream
              objectFit="cover"
            />
          )}
        </View>
      </View>
      <View style={styles.options}>
        <View style={styles.iconContainer}>
          <Ionicons name="md-camera-reverse-outline" style={styles.icon} />
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="videocam-outline" style={styles.icon} />
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="mic-outline" style={styles.icon} />
        </View>
        <View style={[styles.iconContainer, styles.callendContainer]}>
          <MaterialIcons name="call-end" style={[styles.icon, styles.white]} />
        </View>
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
});
