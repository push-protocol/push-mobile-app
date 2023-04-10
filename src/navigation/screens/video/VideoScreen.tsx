import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MediaStream, RTCView, mediaDevices} from 'react-native-webrtc';
import Globals from 'src/Globals';
import {ConnectedUser} from 'src/apis';

const windowWidth = Dimensions.get('window').width;

// const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};

const VideoScreen = ({route}: any) => {
  // const {localStream} = useSelector(
  //   (state: {video: VideoCallState}) => state.video, // TODO: add other redux slice types
  // );

  const {data} = route.params;
  const connectedUser: ConnectedUser = data.connectedUser;
  const senderAddress: string = data.senderAddress;

  // const [isUserMediaLoaded, setIsUserMediaLoaded] = useState(true);
  const [userMedia, setUserMedia] = useState<MediaStream | null>(null);

  const getMediaStream = async () => {
    return await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
  };

  const callUser = async () => {};

  useEffect(() => {
    (async () => {
      // Initialize the call
      try {
        const stream = await getMediaStream();
        console.log('media', stream.toURL());
        setUserMedia(stream);
      } catch (error) {
        console.log('eee ', error);
      }
    })();
  }, []);

  return (
    <LinearGradient colors={['#EEF5FF', '#ECE9FA']} style={styles.container}>
      <View style={styles.videoViewContainer}>
        <RTCView
          style={styles.videoView}
          objectFit="cover"
          streamURL="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // TODO: Add remote stream
        />
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
