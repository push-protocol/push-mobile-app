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
import ENV_CONFIG from "src/env.config";
import addresses from "../templates/addresses";
import EPNSABI from "../abis/epnscore.json";
import GLOBALS from "src/Globals";
import ProfileDisplayer from "src/components/ui/ProfileDisplayer";
import SubscriptionStatus from "../components/buttons/SubscriptionStatus";
import EPNSNotifierIcon from "src/components/custom/EPNSNotifierIcon";
import { useNavigation } from "@react-navigation/native";

export default function Channels(props) {
  const navigation = useNavigation();

  const { wallet, pkey } = props.route.params;
  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [contract, setContract] = useState(null);
  const [loading, setloading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [endReached, setEndReached] = useState(false);

  // useEffect(() => {
  //   // fetchChannels();
  //   const network = "ropsten";
  //   const providerState = ethers.getDefaultProvider(network, {
  //     etherscan: "TZCWZ8YCQDH4THP54865SDGTG3XXY8ZAQU",
  //     infura: ENV_CONFIG.INFURA_PROJECT_ID
  //       ? {
  //           projectId: ENV_CONFIG.INFURA_PROJECT_ID,
  //           projectSecret: ENV_CONFIG.INFURA_PROJECT_SECRET,
  //         }
  //       : null,
  //     alchemy: "wxQBUQ4vvHpc8HJBJWw1YjWoCMDwiHh2",
  //   });
  //   setProvider(providerState);
  //   initiateContractInstance(providerState);
  // }, []);

  // const initiateContractInstance = async (provider) => {
  //   const contractInstanceState = await new ethers.Contract(
  //     addresses.epnscore,
  //     EPNSABI,
  //     provider
  //   );

  //   setContract(contractInstanceState);
  // };

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_FETCH_CHANNELS;

    // const apiURL =
    // "https://backend-staging.epns.io/apis/channels/fetch_channels";

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
  };

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
    <SafeAreaView style={{ backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <ProfileDisplayer
          // ref="ProfileDisplayer"
          style={styles.profile}
          wallet={wallet}
          lockApp={() => {
            const { handleAppAuthState } = this.context;
            handleAppAuthState(APP_AUTH_STATES.ONBOARDED);
          }}
        />
        {/* Header Comes Here */}
        <EPNSNotifierIcon
          // ref="EPNSNotifier"
          style={styles.notifier}
          iconSize={32}
          onPress={() => {
            // Refresh the feeds
            // this.refreshFeeds();
          }}
          onNewNotifications={() => {
            // Do nothing for now, bell is ringing in the module anyway
          }}
        />
        {/* <ImageButton
          style={styles.help}
          src={require("assets/ui/help.png")}
          iconSize={24}
          onPress={() => {
            // // Finally associate token to server if not done
            // const publicKey = CryptoHelper.getPublicKeyFromPrivateKey(this.props.route.params.pkey);
            // const privateKey = this.props.route.params.pkey;
            //
            // // While an async function, there is no need to wait
            // ServerHelper.associateTokenToServer(publicKey, privateKey);

            navigation.navigate("SampleFeed", {});
          }}
        /> */}
        <ImageButton
          style={styles.settings}
          src={require("assets/ui/settings.png")}
          iconSize={24}
          onPress={() => {
            // // Finally associate token to server if not done
            // const publicKey = CryptoHelper.getPublicKeyFromPrivateKey(this.props.route.params.pkey);
            // const privateKey = this.props.route.params.pkey;
            //
            // // While an async function, there is no need to wait
            // ServerHelper.associateTokenToServer(publicKey, privateKey);

            navigation.navigate("Settings", {});
          }}
        />
      </View>
      <FlatList
        data={channels}
        style={{ backgroundColor: "#fff", marginBottom: 60 }}
        keyExtractor={(item) => item.channel.toString()}
        initialNumToRender={5}
        showsVerticalScrollIndicator={false}
        onEndReached={async () => (!endReached ? await fetchChannels() : null)}
        renderItem={({ item }) => (
          <View>
            {item.icon && item.name && item.info ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  marginVertical: 10,
                  marginHorizontal: 20,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <View
                  style={{
                    flex: 0.2,
                    // justifyContent: "center",
                    alignItems: "center",
                    marginVertical: 10,
                  }}
                >
                  {item.icon ? (
                    <Image
                      source={{ uri: item.icon }}
                      style={{
                        width: 50,
                        height: 50,
                        borderWidth: 1,
                        borderColor: "#ccc",
                      }}
                    />
                  ) : null}
                </View>
                <View
                  style={{
                    flex: 0.8,
                    marginTop: 8,
                    marginHorizontal: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      openURL(item.url);
                    }}
                  >
                    <Text
                      style={{
                        color: "#E10780",
                        fontWeight: "bold",
                        fontSize: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      flex: 1,
                      flexWrap: "wrap",
                      marginTop: 5,
                      fontSize: 10,
                    }}
                  >
                    {item.info}
                  </Text>
                  <View
                    style={{
                      marginTop: 10,
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <SubscriptionStatus
                      channel={item.channel}
                      user={props.route.params.wallet}
                      // contract={contract}
                    />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

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
  feedDisplayer: {
    flex: 1,
    width: "100%",
  },
});
