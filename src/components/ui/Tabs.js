import {FontAwesome5, MaterialCommunityIcons} from '@expo/vector-icons';
import {Entypo} from '@expo/vector-icons';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import React from 'react';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import ChannelsScreen from 'src/navigation/screens/ChannelsScreen';
import HomeScreen from 'src/navigation/screens/HomeScreen';
import SampleFeedScreen from 'src/navigation/screens/SampleFeedScreen';
import SpamBoxScreen from 'src/navigation/screens/SpamBoxScreen';
import {ChatScreen} from 'src/navigation/screens/chats';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

export default function Tabs() {
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);

  const Tab = createMaterialBottomTabNavigator();
  const wallet = users[currentUser].wallet;
  const pkey = users[currentUser].userPKey;

  return (
    <Tab.Navigator
      initialRouteName={GLOBALS.SCREENS.FEED}
      activeColor="#674c9f"
      inactiveColor="#ccc"
      barStyle={{backgroundColor: '#fefefe'}}
      shifting={true}
      labeled={true}>
      <Tab.Screen
        name={GLOBALS.SCREENS.FEED}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({color}) => (
            <FontAwesome5 name="list-alt" color={color} size={20} />
          ),
        }}
        initialParams={{
          wallet,
        }}
      />

      <Tab.Screen
        name={GLOBALS.SCREENS.CHANNELS}
        component={ChannelsScreen}
        options={{
          tabBarLabel: 'Channels',
          tabBarIcon: ({color}) => (
            <FontAwesome5
              name="wifi"
              color={color}
              size={20}
              style={{
                transform: [{rotate: '90deg'}],
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
        name={GLOBALS.SCREENS.SPAM}
        component={SpamBoxScreen}
        options={{
          tabBarLabel: 'Spam',
          tabBarIcon: ({color}) => (
            <FontAwesome5 name="trash" size={24} color={color} />
          ),
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />

      <Tab.Screen
        name={GLOBALS.SCREENS.SAMPLEFEED}
        component={SampleFeedScreen}
        options={{
          tabBarLabel: 'Sample Feed',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="help-box" color={color} size={24} />
          ),
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />

      <Tab.Screen
        name={GLOBALS.SCREENS.CHATS}
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({color}) => (
            <Entypo name="chat" color={color} size={24} />
          ),
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />
    </Tab.Navigator>
  );
}
