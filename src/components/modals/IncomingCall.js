import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {BlurView} from 'expo-blur';
import React, {useEffect, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RTCView} from 'react-native-webrtc';
import GLOBALS from 'src/Globals';
import {DEFAULT_AVATAR} from 'src/navigation/screens/chats/constants';
import VideoPlaceholder from 'src/navigation/screens/video/components/VideoPlaceholder';

const windowWidth = Dimensions.get('window').width;

const IncomingCall = ({stream}) => {
  const [fader] = useState(new Animated.Value(0));

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
          <Ionicons name="close" style={styles.closeIcon} />
          <View style={styles.detailsContainer}>
            <Image source={{uri: DEFAULT_AVATAR}} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>John Doe</Text>
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
                <VideoPlaceholder uri={DEFAULT_AVATAR} />
              )}
            </View>
            <View style={styles.options}>
              <TouchableHighlight style={styles.callAccept}>
                <Ionicons name="videocam" size={24} color="white" />
              </TouchableHighlight>
              <TouchableHighlight style={styles.callReject}>
                <MaterialIcons name="call-end" size={26} color="white" />
              </TouchableHighlight>
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
    backgroundColor: GLOBALS.COLORS.GRAY,
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
    width: 46,
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
