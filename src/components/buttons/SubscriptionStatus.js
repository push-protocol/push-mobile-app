import { serializeTransaction } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import ENV_CONFIG from "src/env.config";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function SubscriptionStatus(props) {
  const [subscribed, setSubscribed] = useState(null);
  const [modal, setModal] = useState(false);
  const [action, setAction] = useState("");

  const apiURL =
    ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_FETCH_SUBSCRIPTION;

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchSubscriptionStatus(props.user, props.channel);

    return () => {
      isMounted = false;
    };
  });

  const showPopUp = async (action) => {
    setModal(true);
    setAction(action);
  };

  const fetchSubscriptionStatus = async (user, channel) => {
    // console.log(apiURL);
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriber: user,
        channel: channel,
        op: "read",
      }),
    });

    const subscriptionStatus = await response.json();

    // console.log(subscriptionStatus);

    setSubscribed(subscriptionStatus);
  };

  const openURL = async (url) => {
    // if (validURL(url) || 1) {
    // console.log("OPENING URL ", url);
    // Bypassing the check so that custom app domains can be opened
    await Linking.openURL(url);
    // Linking.canOpenURL(url).then((supported) => {
    //   if (supported) {
    //     Linking.openURL(url);
    //   } else {
    //     // showToast("Device Not Supported", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    //   }
    // });
    // } else {
    // showToast("Link not valid", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    // }
  };

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          setModal(!modal);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {action} is currently posible with Metamask. You will be
              redirected to the Metamask app where you can sign into our Dapp
              and carry out {action}.
            </Text>
            <TouchableOpacity
              style={styles.button1}
              onPress={() => openURL(ENV_CONFIG.METAMASK_LINK)}
            >
              <Text style={styles.textStyle}>
                Sign In with Metamask.{"  "}
                <FontAwesome5 name="external-link-alt" size={20} />{" "}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModal(!modal)}
            >
              <Text style={styles.textStyle}>Close.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {subscribed == null ? (
        <ActivityIndicator size={"small"} color={"#E20880"} />
      ) : subscribed == false ? (
        <TouchableOpacity
          onPress={() => showPopUp("Subscription")}
          style={{
            backgroundColor: "#E20880",
            padding: 5,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: "white", fontWeight: "500" }}>
            Subscribe
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            showPopUp("Unsubscription");
          }}
          style={{
            backgroundColor: "#674C9F",
            padding: 5,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: "white", fontWeight: "500" }}>
            Unsubscribe
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  button1: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    backgroundColor: "#E20880",
  },
  buttonOpen: {
    backgroundColor: "#228bc6",
  },
  buttonClose: {
    backgroundColor: "#228bc6",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
