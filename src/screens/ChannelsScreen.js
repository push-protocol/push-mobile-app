import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import {
  StatusBar,
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import SubscriptionStatus from "src/components/buttons/SubscriptionStatus";
import EPNSNotifierIcon from "src/components/custom/EPNSNotifierIcon";

import ProfileDisplayer from "src/components/ui/ProfileDisplayer";
import ChannelsDisplayer from "src/components/ui/ChannelsDisplayer";

import ENV_CONFIG from "src/env.config";
import GLOBALS from "src/Globals";

const ChannelsScreen = ({ style, route }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={"dark-content"}
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.content}>
        <ChannelsDisplayer
          wallet={route.params.wallet}
          pKey={route.params.pkey}
        />
      </View>
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: "center",
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: 55,
  },
  notifier: {
    marginTop: 5,
    marginRight: 10,
  },
  settings: {
    marginTop: 5,
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
});

export default ChannelsScreen;
