import React, {useEffect, useState} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import Header from 'src/components/ui/Header';
import {selectInboxNotificationAcknowledgement} from 'src/redux/homeSlice';

import HomeScreen from './screens/HomeScreen';
import SpamBoxScreen from './screens/SpamBoxScreen';

const renderScene = SceneMap({
  [GLOBALS.SCREENS.FEED]: HomeScreen,
  [GLOBALS.SCREENS.SPAM]: SpamBoxScreen,
});

const NotifTabNavigator = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // GET REDUX STATES
  const notificationOpened = useSelector(
    selectInboxNotificationAcknowledgement,
  )?.notificationOpened;

  useEffect(() => {
    if (notificationOpened && index === 1) {
      setIndex(0);
    }
  }, [notificationOpened]);

  const [routes] = useState([
    {key: GLOBALS.SCREENS.FEED, title: 'Inbox'},
    {key: GLOBALS.SCREENS.SPAM, title: 'Spam'},
  ]);

  return (
    <>
      <Header title="Notifications" />
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            labelStyle={styles.tabLabelStyles}
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

const styles = StyleSheet.create({
  tabLabelStyles: {
    textTransform: 'none',
    fontSize: 16,
  },
});
