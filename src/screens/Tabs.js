import React from "react";
import { View, Text, Image } from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Channels from "./Channels";
import HomeScreen from "./HomeScreen";
import SampleFeed from "../screens/SampleFeed";
import SpamBox from "./SpamBox";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function Tabs(props) {
  const Tab = createMaterialBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="Feed"
      activeColor="#228bc6"
      inactiveColor="#ccc"
      barStyle={{ backgroundColor: "#fefefe" }}
      shifting={true}
      labeled={true}
    >
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{
          tabBarLabel: "Inbox",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="list-alt" color={color} size={20} />
          ),
        }}
        initialParams={{
          wallet: props.route.params.wallet,
          pkey: props.route.params.pkey,
        }}
      />
      <Tab.Screen
        name="Channels"
        component={Channels}
        options={{
          tabBarLabel: "Channels",
          tabBarIcon: ({ color }) => (
            <FontAwesome5
              name="wifi"
              color={color}
              size={20}
              style={{
                transform: [{ rotate: "90deg" }],
                position: "absolute",
                left: 0,
              }}
            />
          ),
        }}
        initialParams={{
          wallet: props.route.params.wallet,
          pkey: props.route.params.pkey,
        }}
      />
      <Tab.Screen
        name="Spam"
        component={SpamBox}
        options={{
          tabBarLabel: "Spam",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="exclamation-circle" size={24} color={color} />
          ),
        }}
        initialParams={{
          wallet: props.route.params.wallet,
          pkey: props.route.params.pkey,
        }}
      />
      <Tab.Screen
        name="Sample feed"
        component={SampleFeed}
        options={{
          tabBarLabel: "Sample Feed",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="question" color={color} size={20} />
          ),
        }}
        initialParams={{
          wallet: props.route.params.wallet,
          pkey: props.route.params.pkey,
        }}
      />
    </Tab.Navigator>
  );
}
