import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Linking } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function SubscriptionStatus(props) {
  const [subscribed, setSubscribed] = useState(null);
  useEffect(() => {
    let isMounted = true;
    const contract = props.contract;

    contract
      .memberExists(props.user, props.channel)
      .then((response) => {
        console.log("getSubscribedStatus() --> %o", response);
        if (isMounted) setSubscribed(response);
      })
      .catch((err) => {
        // console.log("!!!Error, getSubscribedStatus() --> %o", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const openURL = (url) => {
    // if (validURL(url) || 1) {
    // console.log("OPENING URL ", url);
    // Bypassing the check so that custom app domains can be opened
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // showToast("Device Not Supported", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
      }
    });
    // } else {
    // showToast("Link not valid", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    // }
  };

  return (
    <View>
      {subscribed == null ? (
        <ActivityIndicator size={"small"} color={"#E20880"} />
      ) : subscribed == false ? (
        <TouchableOpacity
          onPress={() => openURL("https://app.epns.io")}
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
          onPress={() => openURL("https://app.epns.io")}
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
