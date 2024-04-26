import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BlurView} from 'expo-blur';
import Constants from 'expo-constants';
import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import {TabIcon} from 'src/components/custom/TabIcons';
import {usePushApi} from 'src/contexts/PushApiContext';
import NotifTabNavigator from 'src/navigation/NotifTabNavigator';
import ChannelsScreen from 'src/navigation/screens/ChannelsScreen';
import HomeScreen from 'src/navigation/screens/HomeScreen';
import SettingsScreen from 'src/navigation/screens/SettingsScreen';
import SpamBoxScreen from 'src/navigation/screens/SpamBoxScreen';
import {ChatScreen} from 'src/navigation/screens/chats';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);
  const {readOnlyMode, showUnlockProfileModal} = usePushApi();
  const {bottom} = useSafeAreaInsets();

  const wallet = users[currentUser].wallet;
  const pkey = users[currentUser].userPKey;

  return (
    <Tab.Navigator
      initialRouteName={GLOBALS.SCREENS.FEED}
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          height: bottom + 60,
          elevation: 0,
        },
        tabBarShowLabel: false,
        headerShown: false,
        lazy: true,
        tabBarBackground: () => {
          return (
            <>
              {Platform.OS === 'android' ? (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: GLOBALS.COLORS.WHITE,
                  }}
                />
              ) : (
                <BlurView
                  tint="light"
                  experimentalBlurMethod="dimezisBlurView"
                  intensity={50}
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    overflow: 'hidden',
                  }}
                />
              )}
            </>
          );
        },
      }}>
      <Tab.Screen
        name={GLOBALS.SCREENS.NOTIF_TABS}
        component={NotifTabNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon active={focused} icon={'INBOX'} />
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
        listeners={{
          tabPress: e => {
            if (readOnlyMode) {
              e.preventDefault();
              showUnlockProfileModal();
            }
          },
        }}
        options={{
          tabBarIcon: ({focused}) => <TabIcon active={focused} icon={'CHAT'} />,
        }}
        initialParams={{
          wallet,
          pkey,
        }}
      />

      <Tab.Screen
        name={GLOBALS.SCREENS.SETTINGS}
        component={SettingsScreen}
        initialParams={{tabBarHeight: bottom + 60}}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon active={focused} icon={'SETTINGS'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
