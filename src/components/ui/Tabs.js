import React from "react";
import { View, Text, Image } from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialIcons, MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

import HomeScreen from "src/screens/HomeScreen";
import ChannelsScreen from "src/screens/ChannelsScreen";
import SampleFeedScreen from "src/screens/SampleFeedScreen";
import SpamBoxScreen from "src/screens/SpamBoxScreen";

import GLOBALS from 'src/Globals';

export default function Tabs(props) {
  const Tab = createMaterialBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="Feed"
      activeColor="#674c9f"
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
        component={ChannelsScreen}
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
        component={SpamBoxScreen}
        options={{
          tabBarLabel: "Spam",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="trash" size={24} color={color} />
          ),
        }}
        initialParams={{
          wallet: props.route.params.wallet,
          pkey: props.route.params.pkey,
        }}
      />

      <Tab.Screen
        name="SampleFeed"
        component={SampleFeedScreen}
        options={{
          tabBarLabel: "Sample Feed",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="help-box" color={color} size={24} />
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
