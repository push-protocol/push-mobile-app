import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RTCView} from 'react-native-webrtc';
import Globals from 'src/Globals';

const windowWidth = Dimensions.get('window').width;

const VideoScreen = () => {
  // const {localStream} = useSelector(
  //   (state: {video: VideoCallState}) => state.video, // TODO: add other redux slice types
  // );

  return (
    <LinearGradient colors={['#EEF5FF', '#ECE9FA']} style={styles.container}>
      <View style={styles.videoViewContainer}>
        <RTCView
          style={styles.videoView}
          objectFit="cover"
          streamURL="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // TODO: Add remote stream
        />
        <View style={styles.smallVideoViewContainer}>
          <RTCView
            style={styles.videoView}
            streamURL="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // TODO: Add local stream
            objectFit="cover"
          />
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
