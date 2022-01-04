import "@ethersproject/shims";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import {
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

import StylishLabel from "src/components/labels/StylishLabel";
import EPNSActivity from "src/components/loaders/EPNSActivity";

import SubscriptionStatus from "src/components/buttons/SubscriptionStatus";
import ChannelItem from "src/components/ui/ChannelItem";

import ENV_CONFIG from "src/env.config";
import GLOBALS from "src/Globals";

const ChannelsDisplayer = ({ style, wallet, pKey }) => {
  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(1);

  const [refreshing, setRefreshing] = useState(false);

  const [contract, setContract] = useState(null);
  const [endReached, setEndReached] = useState(false);

  useEffect(() => {
    setRefreshing(true);
  }, []);

  const fetchChannels = async () => {
    // const apiURL =
    // "https://backend-staging.epns.io/apis/channels/fetch_channels";
    const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_FETCH_CHANNELS;

    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page: page,
        pageSize: 10,
        op: "write",
      }),
    });
    const resJson = await response.json();

    if (resJson.count != 0 && resJson.results != []) {
      const data = channels;
      await setChannels([...data, ...resJson.results]);
      await setPage(page + 1);
    }

    setRefreshing(false);
  };

  useEffect(() => {
    if (refreshing == true) {
      fetchChannels();
    }
  }, [refreshing]);

  const openURL = (url) => {
    if (validURL(url) || 1) {
      // console.log("OPENING URL ", url);
      // Bypassing the check so that custom app domains can be opened
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // showToast("Device Not Supported", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
        }
      });
    } else {
      // showToast("Link not valid", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    }
  };

  // to check valid url
  const validURL = (str) => {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  };

  return (
    <SafeAreaView style={[styles.container, style]}>
      {channels.length == 0 && (
        <View style={[styles.infodisplay, styles.noPendingFeeds]}>
          <EPNSActivity style={styles.activity} size="small" />
          <StylishLabel
            style={styles.infoText}
            fontSize={16}
            title="[dg:Fetching Channels!]"
          />
        </View>
      )}
      {channels.length != 0 && (
        <FlatList
          data={channels}
          style={styles.channels}
          contentContainerStyle={{ paddingVertical: 10 }}
          keyExtractor={(item) => item.channel.toString()}
          initialNumToRender={20}
          showsVerticalScrollIndicator={false}
          onEndReached={async () => (!endReached ? setRefreshing(true) : null)}
          renderItem={({ item }) => (
            <ChannelItem
              item={item}
              wallet={wallet}
              contract={contract}
              pKey={pKey}
            />
          )}
          ListFooterComponent={() => {
            return endReached ? (
              <View style={{ paddingBottom: 20, marginTop: 20 }}>
                <EPNSActivity style={styles.activity} size="small" />
              </View>
            ) : null;
          }}
        />
      )}
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  channels: {
    flex: 1,
    width: "100%",
  },
  infodisplay: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoIcon: {
    height: 48,
    resizeMode: "contain",
    margin: 10,
  },
  infoText: {
    marginVertical: 10,
  },
});

export default ChannelsDisplayer;
