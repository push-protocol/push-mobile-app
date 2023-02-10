import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import React from 'react';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import {TabIcon} from 'src/components/custom/TabIcons';
import ChannelsScreen from 'src/navigation/screens/ChannelsScreen';
import HomeScreen from 'src/navigation/screens/HomeScreen';
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
      labeled={false}>
      <Tab.Screen
        name={GLOBALS.SCREENS.FEED}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({focused}) => (
            <TabIcon active={focused} icon={'INBOX'} />
          ),
        }}
        initialParams={{
          wallet,
        }}
      />

      <Tab.Screen
        name={GLOBALS.SCREENS.SPAM}
        component={SpamBoxScreen}
        options={{
          tabBarLabel: 'Spam',
          tabBarIcon: ({focused}) => <TabIcon active={focused} icon={'SPAM'} />,
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />

      <Tab.Screen
        name={GLOBALS.SCREENS.CHANNELS}
        component={ChannelsScreen}
        options={{
          tabBarLabel: 'Channels',
          tabBarIcon: ({focused}) => (
            <TabIcon active={focused} icon={'CHANNELS'} />
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
          tabBarIcon: ({focused}) => <TabIcon active={focused} icon={'CHAT'} />,
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />
    </Tab.Navigator>
  );
}
