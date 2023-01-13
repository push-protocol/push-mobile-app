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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import GLOBALS from 'src/Globals';
import {QRCodeVerification} from 'src/helpers/QRCodeValidator';

export default class QRScanner extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      backButtonColor: GLOBALS.COLORS.BLACK,
      render: false,
      camrender: false,
      fader: new Animated.Value(0),
      isHeaderEnabled: false,
      showError: true,
    };
  }

  // COMPONENT MOUNTED
  componentDidMount() {}

  // COMPONENT UNMOUNTED
  componentWillUnmount() {}

  // FUNCTIONS
  // Set State
  changeRenderState = (shouldOpen, navigation) => {
    if (shouldOpen === true) {
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

    const isValid = QRCodeVerification(code, this.props.qrType);
    // show error and stop
    if (!isValid) {
      this.setState({showError: true});
      return;
    }

    // Close this
    this.changeRenderState(false, navigation);

    // Call done function
    doneFunc(code);
  };

  // RENDER
  render() {
    const {navigation, title, errorMessage, doneFunc, closeFunc, navHeader} =
      this.props;

    let paddingTop = getStatusBarHeight();
    let backicon = 'ios-arrow-back';
    if (Platform.OS === 'android') {
      backicon = 'md-arrow-back';
    }

    return this.state.render === false ? null : (
      <Animated.View style={[styles.container, {opacity: this.state.fader}]}>
        <StatusBar
          animated={true}
          translucent={true}
          barStyle="light-content"
          backgroundColor="#000000"
        />

        {this.state.camrender === false ? null : (
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
              <View style={[styles.borderView, styles.leftTopBorder]} />
              <View style={[styles.borderView, styles.rightTopBorder]} />
              <View style={[styles.borderView, styles.leftBottomBorder]} />
              <View style={[styles.borderView, styles.rightBottomBorder]} />
            </View>
          </View>
          {/* make region outside the focus dimmer */}
          <View style={translucentStyles.b1} />
          <View style={translucentStyles.b2} />
          <View style={translucentStyles.b3} />
          <View style={translucentStyles.b4} />
        </SafeAreaView>

        <View style={scanLabel.view}>
          <Text style={scanLabel.text}>{title}</Text>
        </View>

        <View style={[styles.topBar, {paddingTop: paddingTop}]}>
          <TouchableWithoutFeedback
            onPressIn={() => {
              this.setState({
                backButtonColor: GLOBALS.COLORS.LINKS,
              });
            }}
            onPressOut={() => {
              this.setState({
                backButtonColor: GLOBALS.COLORS.BLACK,
              });
            }}
            onPress={() => {
              this.toggleQRScanner(closeFunc);
            }}>
            <View style={[styles.button, styles.back]}>
              <Ionicons name={backicon} color="#657795" size={24} />
            </View>
          </TouchableWithoutFeedback>
          <Text
            style={{
              paddingLeft: 10,
              fontSize: 20,
            }}>
            {navHeader}
          </Text>
        </View>

        {/* Error Modal */}
        {this.state.showError && (
          <View style={errorModal.container}>
            <View style={errorModal.modal}>
              <Text style={errorModal.header}>Invalid QR code</Text>
              <Text style={errorModal.msg}>{errorMessage}</Text>
              <TouchableOpacity
                onPress={() => {
                  this.setState({showError: false});
                }}>
                <Text style={errorModal.okButton}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    );
  }
}

const BORDER_GAP = 4;

// Styling
const errorModal = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#000000aa',
  },
  modal: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    right: '10%',
    padding: 24,
    height: 189,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  header: {
    fontWeight: '500',
    fontSize: 24,
    color: '#333333',
    textAlign: 'center',
  },
  msg: {
    fontWeight: '400',
    fontSize: 18,
    color: '#657795',
    marginVertical: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
  okButton: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#D53893',
    fontSize: 18,
  },
});

const scanLabel = StyleSheet.create({
  view: {
    position: 'absolute',
    width: '90%',
    left: '5%',
    top: 100,
    backgroundColor: '#2F313799',
    borderRadius: 16,
    paddingHorizontal: 21,
    paddingVertical: 17,
  },
  text: {
    color: 'white',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 28,
  },
});

const translucentStyles = StyleSheet.create({
  b1: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: '-17%',
    backgroundColor: GLOBALS.COLORS.MID_BLACK_TRANS,
    width: '17%',
    height: '100%',
    zIndex: -1,
  },
  b2: {
    position: 'absolute',
    top: 10,
    left: '83%',
    right: 0,
    backgroundColor: GLOBALS.COLORS.MID_BLACK_TRANS,
    width: '17%',
    height: '100%',
    zIndex: -1,
  },
  b3: {
    position: 'absolute',
    top: 0,
    left: '17%',
    right: '17%',
    backgroundColor: GLOBALS.COLORS.MID_BLACK_TRANS,
    width: '66%',
    height: '38%',
    zIndex: -1,
  },
  b4: {
    position: 'absolute',
    bottom: 0,
    left: '17%',
    right: '17%',
    backgroundColor: GLOBALS.COLORS.MID_BLACK_TRANS,
    width: '66%',
    height: '24%',
    zIndex: -1,
  },
});

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
    backgroundColor: GLOBALS.COLORS.WHITE,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    width: '66%',
    aspectRatio: 1,
  },
  borderView: {
    position: 'absolute',
    width: '25%',
    aspectRatio: 1,
    borderWidth: 5,
  },
  leftTopBorder: {
    top: 50,
    left: -BORDER_GAP,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: GLOBALS.COLORS.QR_SCAN_COLOR,
  },
  rightTopBorder: {
    top: 50,
    right: -BORDER_GAP,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderColor: GLOBALS.COLORS.QR_SCAN_COLOR,
  },
  leftBottomBorder: {
    bottom: -50,
    right: -BORDER_GAP,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: GLOBALS.COLORS.QR_SCAN_COLOR,
  },
  rightBottomBorder: {
    bottom: -50,
    left: -BORDER_GAP,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderColor: GLOBALS.COLORS.QR_SCAN_COLOR,
  },
  scannerText: {
    padding: 20,
    color: GLOBALS.COLORS.WHITE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
