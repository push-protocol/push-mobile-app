import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import ChannelsDisplayer from 'src/components/ui/ChannelsDisplayer';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

const ChannelsScreen = () => {
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);

  const {wallet, userPKey} = users[currentUser];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.content}>
        <ChannelsDisplayer wallet={wallet} pKey={userPKey} />
      </View>
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },

  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: 55,
  },
  notifier: {
    marginTop: 5,
    marginRight: 10,
  },
  settings: {
    marginTop: 5,
    width: 24,
  },
  help: {
    width: 24,
    marginTop: 5,
    marginRight: 10,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChannelsScreen;
