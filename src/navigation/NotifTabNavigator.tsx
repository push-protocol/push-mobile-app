import React, {useState} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import GLOBALS from 'src/Globals';
import Header from 'src/components/ui/Header';

import HomeScreen from './screens/HomeScreen';
import SpamBoxScreen from './screens/SpamBoxScreen';

const renderScene = SceneMap({
  [GLOBALS.SCREENS.FEED]: HomeScreen,
  [GLOBALS.SCREENS.SPAM]: SpamBoxScreen,
});

const NotifTabNavigator = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const [routes] = useState([
    {key: GLOBALS.SCREENS.FEED, title: 'Inbox'},
    {key: GLOBALS.SCREENS.SPAM, title: 'Spam'},
  ]);

  return (
    <>
      <Header />
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            labelStyle={{
              textTransform: 'none',
              fontSize: 16,
            }}
            indicatorStyle={{backgroundColor: GLOBALS.COLORS.PINK}}
            style={{backgroundColor: GLOBALS.COLORS.WHITE}}
            activeColor="black"
            inactiveColor="gray"
          />
        )}
      />
    </>
  );
};

export default NotifTabNavigator;

const styles = StyleSheet.create({});
