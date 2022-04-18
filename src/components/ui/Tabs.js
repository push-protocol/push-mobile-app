import React from 'react'

import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'

import HomeScreen from 'src/screens/HomeScreen'
import ChannelsScreen from 'src/screens/ChannelsScreen'
import SampleFeedScreen from 'src/screens/SampleFeedScreen'
import SpamBoxScreen from 'src/screens/SpamBoxScreen'
import { useSelector } from 'react-redux'

export default function Tabs() {
  const { activeUser, users } = useSelector((state) => state.auth)
  const Tab = createMaterialBottomTabNavigator()

  const { wallet, userPKey: pkey } = users[activeUser]

  console.log({ wallet, pkey })
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      activeColor="#674c9f"
      inactiveColor="#ccc"
      barStyle={{ backgroundColor: '#fefefe' }}
      shifting={true}
      labeled={true}
    >
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="list-alt" color={color} size={20} />
          ),
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />

      <Tab.Screen
        name="Channels"
        component={ChannelsScreen}
        options={{
          tabBarLabel: 'Channels',
          tabBarIcon: ({ color }) => (
            <FontAwesome5
              name="wifi"
              color={color}
              size={20}
              style={{
                transform: [{ rotate: '90deg' }],
                position: 'absolute',
                left: 0,
              }}
            />
          ),
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />

      <Tab.Screen
        name="Spam"
        component={SpamBoxScreen}
        options={{
          tabBarLabel: 'Spam',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="trash" size={24} color={color} />
          ),
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />

      <Tab.Screen
        name="SampleFeed"
        component={SampleFeedScreen}
        options={{
          tabBarLabel: 'Sample Feed',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="help-box" color={color} size={24} />
          ),
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />
    </Tab.Navigator>
  )
}
