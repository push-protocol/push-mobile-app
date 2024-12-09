import {useNavigation} from '@react-navigation/native';
import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import GLOBALS from 'src/Globals';
import {switchUser} from 'src/redux/authSlice';

import HeaderBanner from './HeaderBanner';
import UserProfile from './UserProfile';

type HeaderProps = {
  title: string;
};

const Header: FC<HeaderProps> = ({title}) => {
  const navigation = useNavigation();

  const navigateToSettings = () => {
    navigation.navigate(GLOBALS.SCREENS.SETTINGS);
  };

  return (
    <>
      <HeaderBanner />
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <UserProfile icon="copy" onPressIcon={navigateToSettings} />
      </View>
    </>
  );
};

// Styling
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  container: {
    padding: 16,
    backgroundColor: GLOBALS.COLORS.WHITE,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 29,
  },
});

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {
  switchUser,
})(Header);
