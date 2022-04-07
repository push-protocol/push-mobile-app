import React, { Component } from "react";
import {
  StatusBar,
  View,
  Text,
  InteractionManager,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { useFocusEffect } from "@react-navigation/native";

import messaging from "@react-native-firebase/messaging";
import HomeFeed from "src/components/ui/HomeFeed";
import FeedsDisplayer from "src/components/ui/FeedsDisplayer";

import ImageButton from "src/components/buttons/ImageButton";
import PrimaryButton from "src/components/buttons/PrimaryButton";
import OverlayBlur from "src/components/modals/OverlayBlur";
import { Feather } from "@expo/vector-icons";

import { ToasterOptions, Toaster } from "src/components/indicators/Toaster";

import CryptoHelper from "src/helpers/CryptoHelper";
import FeedDBHelper from "src/helpers/FeedDBHelper";
import AppBadgeHelper from "src/helpers/AppBadgeHelper";
import ServerHelper from "src/helpers/ServerHelper";

import Notify from "src/singletons/Notify";
import MetaStorage from "src/singletons/MetaStorage";
import Utilities from "src/singletons/Utilities";

import AuthContext, { APP_AUTH_STATES } from "src/components/auth/AuthContext";
import GLOBALS from "src/Globals";

function ScreenFinishedTransition({ runAfterScreenTransition }) {
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        // After screen is loaded
        runAfterScreenTransition();
      });

      return () => task.cancel();
    }, [])
  );

  return null;
}

export default class HomeScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      transitionFinished: false,
      refresh: false,
    };
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    await this.maintainer();

    // To Output msg payload for testing
    // this.outputSecretMsgPayload();
    // Testing Feed DB
    // this.props.navigation.setParams({onPressAction: ()=>console.log("TT")})
    //
    // navigation.setOptions({
    //   onPressAction: ()=>console.log("TT")
    // });
  }

  // COMPONENT UNMOUNTED
  componentWillUnmount() {}

  // COMPONENT DID UPDATE
  componentDidUpdate(prevProps) {
    if (
      prevProps.route.params.refreshNotifFeed !==
        this.props.route.params.refreshNotifFeed &&
      this.props.route.params.refreshNotifFeed == true
    ) {
      this.refreshFeeds();
    }
  }

  // COMPONENT LOADED
  // Run as soon as loaded
  maintainer = async () => {
    // DEPRECATED
    // IN FAVOR OF /src/components/ui/Header.js handles it now
    // // Set Notification Listener
    // Notify.instance.setNotificationListenerCallback(() => {
    //   this.onNotificationListenerUpdate();
    // });
    // END DEPRECATION

    // Since User is logged in, reset passcode attempts
    await MetaStorage.instance.setRemainingPasscodeAttempts(
      GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS
    );

    // Initialize Utilities
    Utilities.instance.initialize();
  };

  // Run After Transition is finished
  afterTransitionMaintainer = async () => {
    // DEPRECATED
    // IN FAVOR OF /src/components/ui/Header.js handles it now
    // // Trigger Notification Update
    // await this.onNotificationListenerUpdate();
    // END DEPRECATION

    // First sign in by user
    const firstSignIn = await MetaStorage.instance.getFirstSignInByUser();
    if (firstSignIn) {
      // Request new device token
      await Notify.instance.requestDeviceToken(true);
      

      // Set it to false for future
      await MetaStorage.instance.setFirstSignInByUser(false);
    }

    // Refresh feed automatically
    // await this.refreshFeeds();

    // Get signed type and register device for push
    let signedInType = await MetaStorage.instance.getSignedInType();
    if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_WALLET) {
      ServerHelper.associateTokenToServerNoAuth(this.props.route.params.wallet);
    } else if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_PRIVATE_KEY) {
      // Finally associate token to server if not done
      const publicKey = CryptoHelper.getPublicKeyFromPrivateKey(
        this.props.route.params.pkey
      );
      const privateKey = this.props.route.params.pkey;

      // While an async function, there is no need to wait
      ServerHelper.associateTokenToServer(publicKey, privateKey);
    }
  };

  // Component Unmounted
  componentWillUnmount() {
    // DEPRECATED
    // IN FAVOR OF /src/components/ui/Header.js handles it now
    // // Reset Callback of notification
    // Notify.instance.setNotificationListenerCallback(null);
    // END DEPRECATION
  }

  // FUNCTIONS
  // DEPRECATED
  // IN FAVOR OF /src/components/ui/Header.js handles it now
  // // To refresh the bell badge
  // onNotificationListenerUpdate = async () => {
  // 	// Check Notifier
  // 	await this.refs.EPNSNotifier.getBadgeCountAndRefresh();
  // };
  // END DEPRECATION

  // To refresh the Feeds\\
  refreshFeeds = async () => {
    //this.refs.FeedsDisplayer.resetFeedState();
    // await this.refs.FeedsDisplayer.triggerGetItemsFromDB(false);
    this.props.navigation.setParams({ refreshNotifFeed: false });

    this.setState({ refresh: !this.state.refresh }, () => {
      if (this.state.refresh == true) {
        this.setState({ refresh: false });
      }
    });
  };

  // DEPRECATED
  // IN FAVOR OF /src/components/ui/Header.js handles it now
  // exitIntentOnOverleyBlur = () => {
  //   this.refs.ProfileDisplayer.toggleActive(false);
  // };
  // END DEPRECATION

  // To output secret msg payload, only used in testing
  outputSecretMsgPayload = async () => {
    const pkey = this.props.route.params.pkey; // The private key used

    const secret = "Random15Pass"; // 15 or less characters
    const sub = "Hey this is subject"; // This is subject
    const msg =
      "This message can go up to 200 letters I think, This message can go up to 200 letters I think"; // The intended msg
    const cta = "https://someurl.com/"; // the call to action
    const imgurl = "https://someimageurl.com/image.jpeg"; // the url of image

    CryptoHelper.outputMsgPayload(secret, sub, msg, cta, imgurl, pkey);
  };

  // TO SHOW TOASTER
  showToast = (msg, icon, type, tapCB, screenTime) => {
    this.refs.Toaster.showToast(msg, icon, type, tapCB, screenTime);
  };

  // RENDER
  render() {
    const { navigation } = this.props;
    const { wallet, pkey } = this.props.route.params;

    return (
      <View style={styles.container}>
        <ScreenFinishedTransition
          runAfterScreenTransition={() => {
            this.setState({
              transitionFinished: true,
            });

            this.afterTransitionMaintainer();
          }}
        />

        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle={"dark-content"}
            translucent
            backgroundColor="transparent"
          />

          <View style={styles.content}>
            <HomeFeed
              wallet={wallet}
              privateKey={this.props.route.params.pkey}
              refreshNotifFeeds={this.state.refresh}
              ToasterFunc={(msg, icon, type, tapCB, screenTime) => {
                this.showToast(msg, icon, type, tapCB, screenTime);
              }}
            />
            {/*
						<FeedsDisplayer
							ref="FeedsDisplayer"
							style={styles.feedDisplayer}
							onFeedRefreshed={() => {
								this.onNotificationListenerUpdate();
							}}
							showToast={(msg, icon, type, tapCB, screenTime) => {
								this.showToast(msg, icon, type, tapCB, screenTime);
							}}
							privateKey={this.props.route.params.pkey}
						/> */}
          </View>
        </SafeAreaView>

        {/* Overlay Blur to show incase need to emphasize on something */}
        <OverlayBlur
          ref="OverlayBlur"
          onPress={() => {
            this.exitIntentOnOverleyBlur();
          }}
        />

        {/* Toaster Always goes here in the end after safe area */}
        <Toaster ref="Toaster" onToastTap />
      </View>
    );
  }
}

// Connect to Auth Context
HomeScreen.contextType = AuthContext;

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    // justifyContent: "center",
    // alignItems: "center",
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  profile: {
    // position: "absolute",
    // top: 0,
    // right: 0,
    // left: 0,
    // bottom: 0,
    // zIndex: 99,
  },
  header: {
    flexDirection: "row",
    alignSelf: "stretch",
    // justifyContent: "flex-end",
    alignItems: "center",
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: 55,
  },
  notifier: {
    marginTop: 5,
    marginRight: 0,
  },
  settings: {
    marginTop: 5,
    marginLeft: 10,
    width: 24,
  },
  help: {
    width: 24,
    marginTop: 5,
    marginRight: 10,
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  feedDisplayer: {
    flex: 1,
    width: "100%",
  },
});
