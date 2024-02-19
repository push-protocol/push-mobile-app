import messaging from '@react-native-firebase/messaging';
import {useFocusEffect} from '@react-navigation/native';
import React, {Component} from 'react';
import {
  Animated,
  InteractionManager,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeArea} from 'react-native-safe-area-context';
import {connect} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
import NoticePrompt from 'src/components/modals/NoticePrompt';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import {withUseAuth} from 'src/hooks/auth/useAuth';
import Notify from 'src/singletons/Notify';

function ScreenFinishedTransition({setScreenTransitionAsDone}) {
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        // After screen is loaded
        setScreenTransitionAsDone();
      });

      return () => task.cancel();
    }, []),
  );

  return null;
}

function GetScreenInsets() {
  const insets = useSafeArea();
  if (insets.bottom > 0) {
    // Adjust inset by
    return <View style={styles.insetAdjustment}></View>;
  } else {
    return <View style={styles.noInsetAdjustment}></View>;
  }
}

class PushNotifyScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      transitionFinished: false,
      detailedInfoPresetned: false,

      fader: new Animated.Value(0),
    };
  }

  // FUNCTIONS
  // When Animation is Finished
  animationFinished = () => {
    this.setState(
      {
        detailedInfoPresetned: true,
      },
      () => {
        Animated.timing(this.state.fader, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      },
    );
  };

  // Open Notice Prompt With Overlay Blur
  toggleNoticePrompt = (
    toggle,
    animate,
    title,
    subtitle,
    notice,
    showIndicator,
  ) => {
    // Set Notice First
    if (title) {
      this.refs.NoticePrompt.changeTitle(title);
    }

    if (subtitle) {
      this.refs.NoticePrompt.changeSubtitle(subtitle);
    }

    if (notice) {
      this.refs.NoticePrompt.changeNotice(notice);
    }

    if (showIndicator) {
      this.refs.NoticePrompt.changeIndicator(showIndicator);
    }

    // Set render state of this and the animate the blur modal in
    this.refs.OverlayBlur.changeRenderState(toggle, animate);
    this.refs.NoticePrompt.changeRenderState(toggle, animate);
  };

  // Load the Next Screen
  loadNextScreenAfterAdditionalSetup = async () => {
    // FIREBASE
    const settings = await messaging().requestPermission();
    if (settings == messaging.AuthorizationStatus.DENIED) {
      // console.log('Permission settings:', settings);
      // Display enabling push notification message and move on
      this.toggleNoticePrompt(
        true,
        true,
        'Push Notifications are Disabled',
        'Having Push Notifications is recommended as Push (EPNS) uses this to deliver your messages to you.',
        `If you wish to enable Push Notifations in the future, you can do so from the [appsettings:App Settings]`,
        false,
      );
    } else {
      this.loadNextScreen();
    }
  };

  // Load real next screen
  loadNextScreenSequential = () => {
    this.loadNextScreen();
  };

  loadNextScreen = async () => {
    // Save Device Token
    Notify.instance.requestDeviceToken();

    // Goto Next Screen
    this.props.login();
  };

  // RETURN
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenFinishedTransition
          setScreenTransitionAsDone={() => {
            this.setState({
              transitionFinished: true,
            });
          }}
        />
        <Text style={styles.header}>Notifications</Text>
        <View style={styles.inner}>
          <DetailedInfoPresenter
            style={styles.intro}
            icon={require('assets/ui/push.png')}
            contentView={
              <View style={styles.introContent}>
                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title="Push (EPNS) uses push notifications to deliver messages from [d:different channels] which can be a [b:dApps] or [b:Smart Contracts] which you have subscribed to."
                />
                <StylishLabel
                  style={styles.paraend}
                  fontSize={16}
                  title="It's called [b:Ethereum Push Notification Service] after all [t::)]."
                />
              </View>
            }
            animated={!this.state.detailedInfoPresetned}
            startAnimation={this.state.transitionFinished}
            animationCompleteCallback={() => {
              this.animationFinished();
            }}
          />
        </View>
        <Animated.View style={[styles.footer, {opacity: this.state.fader}]}>
          <PrimaryButton
            iconFactory="Ionicons"
            icon="ios-notifications-outline"
            iconSize={24}
            title="Enable Notifications and Continue"
            fontSize={16}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
            disabled={false}
            onPress={() => {
              this.loadNextScreenAfterAdditionalSetup();
            }}
          />
          <GetScreenInsets />
        </Animated.View>

        {/* Overlay Blur and Notice to show in case biometric is skipped */}
        <OverlayBlur ref="OverlayBlur" />

        <NoticePrompt
          ref="NoticePrompt"
          closeTitle="OK"
          closeFunc={() => {
            this.toggleNoticePrompt(false, true);
            this.loadNextScreenSequential();
          }}
        />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {})(withUseAuth(PushNotifyScreen));

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  intro: {
    padding: 20,
    maxWidth: 540,
  },
  introContent: {
    marginTop: 20,
  },
  para: {
    marginBottom: 20,
  },
  paraend: {
    marginBottom: 0,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  insetAdjustment: {
    paddingBottom: 5,
  },
  noInsetAdjustment: {
    paddingBottom: 20,
  },
});
