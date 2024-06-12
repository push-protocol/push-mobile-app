import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import GLOBALS from 'src/Globals';

import PrimaryButton from '../buttons/PrimaryButton';

type EmptyFeedProps = {
  title: string;
  subtitle: string;
};

const EmptyFeed = ({title, subtitle}: EmptyFeedProps) => {
  const navigation = useNavigation();

  const handleNavigateToChannels = () => {
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.CHANNELS);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('assets/ui/nonotifbell.png')}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View>
        <PrimaryButton
          title="Explore Channels"
          fontSize={12}
          fontColor={GLOBALS.COLORS.WHITE}
          bgColor={GLOBALS.COLORS.BLACK}
          icon="compass"
          iconFactory="Feather"
          iconSize={22}
          iconColor="#CF59E2"
          iconFirst={true}
          onPress={handleNavigateToChannels}
          style={styles.button}
          setButtonStyle={styles.buttonStyle}
        />
      </View>
    </View>
  );
};

export default EmptyFeed;

const styles = StyleSheet.create({
  container: {
    flexGrow: 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 44,
    width: 44,
  },
  title: {
    color: GLOBALS.COLORS.BLACK,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.43,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    marginHorizontal: '20%',
    color: '#3D3E45',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.43,
  },
  button: {
    marginTop: 24,
    alignSelf: 'center',
  },
  buttonStyle: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
});
