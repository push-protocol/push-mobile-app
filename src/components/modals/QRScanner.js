import {Ionicons} from '@expo/vector-icons';
import {Audio} from 'expo-av';
import {Camera} from 'expo-camera';
import React, {Component} from 'react';
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import GLOBALS from 'src/Globals';
import StylishLabel from 'src/components/labels/StylishLabel';

export default class QRScanner extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      backButtonColor: GLOBALS.COLORS.WHITE,

      render: false,
      camrender: false,
      fader: new Animated.Value(0),

      isHeaderEnabled: false,
    };
  }

  // COMPONENT MOUNTED
  componentDidMount() {}

  // COMPONENT UNMOUNTED
  componentWillUnmount() {}

  // FUNCTIONS
  // Set State
  changeRenderState = (shouldOpen, navigation) => {
    if (shouldOpen == true) {
      this.animateFadeIn(navigation);
    } else {
      this.animateFadeOut(navigation);
    }
  };

  // Set Fade In and Fade Out Animation
  animateFadeIn = navigation => {
    this.setState({
      render: true,
    });

    if (navigation) {
      if (navigation.headerShown) {
        this.setState({
          isHeaderEnabled: true,
        });
      }

      navigation.setOptions({
        headerShown: false,
      });
    }

    Animated.timing(this.state.fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      this.setState({
        camrender: true,
      });
    });
  };

  animateFadeOut = navigation => {
    this.setState(
      {
        camrender: false,
      },
      () => {
        Animated.timing(this.state.fader, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          this.setState({
            render: false,
          });

          if (navigation) {
            if (this.state.isHeaderEnabled) {
              navigation.setOptions({
                headerShown: true,
              });
            }
          }
        });
      },
    );
  };

  // Toggle QR Scanner
  toggleQRScanner = closeFunc => {
    closeFunc();
  };

  playScanSound = async () => {
    try {
      const {sound} = await Audio.Sound.createAsync(
        require('assets/sounds/scanned.mp3'),
      );
      await sound.playAsync();
    } catch (err) {
      console.log('err on song', err);
    }
  };

  // Handle barcode scanning
  handleBarCodeScanned = async (scanned, navigation, doneFunc) => {
    let code = scanned.data;

    // Close this
    this.changeRenderState(false, navigation);

    // Call done function
    doneFunc(code);
  };

  // RENDER
  render() {
    const {style, navigation, title, doneFunc, closeFunc} = this.props;

    let paddingTop = getStatusBarHeight();
    let backicon = 'ios-arrow-back';
    if (Platform.OS == 'android') {
      backicon = 'md-arrow-back';
    }

    return this.state.render == false ? null : (
      <Animated.View style={[styles.container, {opacity: this.state.fader}]}>
        <StatusBar
          animated={true}
          translucent={true}
          barStyle="light-content"
          backgroundColor="#000000"
        />

        {this.state.camrender == false ? null : (
          <Camera
            onBarCodeScanned={scanned =>
              this.handleBarCodeScanned(scanned, navigation, doneFunc)
            }
            style={styles.preview}
          />
        )}

        <SafeAreaView forceInset={{top: 'never', bottom: 'always'}}>
          <View style={styles.focusContainer}>
            <View style={styles.focusView}>
              <View style={[styles.borderView, styles.leftTopBorder]}></View>
              <View style={[styles.borderView, styles.rightTopBorder]}></View>
              <View style={[styles.borderView, styles.leftBottomBorder]}></View>
              <View
                style={[styles.borderView, styles.rightBottomBorder]}></View>
            </View>
            <StylishLabel
              style={styles.scannerText}
              fontSize={16}
              title={title}
            />
          </View>
        </SafeAreaView>

        <View style={[styles.topBar, {paddingTop: paddingTop}]}>
          <TouchableWithoutFeedback
            onPressIn={() => {
              this.setState({
                backButtonColor: GLOBALS.COLORS.LINKS,
              });
            }}
            onPressOut={() => {
              this.setState({
                backButtonColor: GLOBALS.COLORS.WHITE,
              });
            }}
            onPress={() => {
              this.toggleQRScanner(closeFunc);
            }}>
            <View style={[styles.button, styles.back]}>
              <Ionicons
                name={backicon}
                color={this.state.backButtonColor}
                size={30}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Animated.View>
    );
  }
}

const BORDER_GAP = 4;

// Styling
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    ...StyleSheet.absoluteFill,
    backgroundColor: GLOBALS.COLORS.BLACK,
  },
  preview: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    width: '100%',
    backgroundColor: GLOBALS.COLORS.MID_BLACK_TRANS,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  back: {},
  focusContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusView: {
    width: '65%',
    aspectRatio: 1,
    backgroundColor: GLOBALS.COLORS.MID_BLACK_TRANS,
  },
  borderView: {
    position: 'absolute',
    width: '25%',
    aspectRatio: 1,
    borderWidth: 2,
  },
  leftTopBorder: {
    top: -BORDER_GAP,
    left: -BORDER_GAP,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: GLOBALS.COLORS.GRADIENT_PRIMARY,
  },
  rightTopBorder: {
    top: -BORDER_GAP,
    right: -BORDER_GAP,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderColor: GLOBALS.COLORS.GRADIENT_THIRD,
  },
  leftBottomBorder: {
    bottom: -BORDER_GAP,
    right: -BORDER_GAP,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: GLOBALS.COLORS.GRADIENT_SECONDARY,
  },
  rightBottomBorder: {
    bottom: -BORDER_GAP,
    left: -BORDER_GAP,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderColor: GLOBALS.COLORS.GRADIENT_THIRD,
  },
  scannerText: {
    padding: 20,
    color: GLOBALS.COLORS.WHITE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
