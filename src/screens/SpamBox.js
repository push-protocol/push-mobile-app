import React from "react";
import { View, Text } from "react-native";
import SpamFeed from "../components/ui/SpamFeed";

export default function SpamBox(props) {
  console.log("SPAM PROPS", props);
  return <SpamFeed wallet={props.route.params.wallet} />;
}
