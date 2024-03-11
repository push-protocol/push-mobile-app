import React from 'react';
import {Image} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import {ChainHelper} from 'src/helpers/ChainHelper';
import {selectChannel} from 'src/redux/channelSlice';

import SubscriptionStatus from '../buttons/SubscriptionStatus';
import {ChannelLogo, ChannelTitleCard} from './ChannelComponents';

type ChannelItemProps = {
  index: number;
  selectChannelForSettings: (index: number) => void;
};

const ChannelItem = ({index, selectChannelForSettings}: ChannelItemProps) => {
  const channel = useSelector(selectChannel(index));
  if (index === 1) {
    console.log('Channel', channel);
  }

  if (channel.name === null) {
    return null;
  }

  return (
    <View>
      <View style={styles.topContainer}>
        <ChannelLogo icon={channel.icon} />
        <SubscriptionStatus
          index={index}
          channel={channel.channel}
          selectChannelForSettings={selectChannelForSettings}
        />
      </View>
      <View style={styles.middleContainer}>
        <ChannelTitleCard channel={channel} />
      </View>
      <Text numberOfLines={2} style={styles.info}>
        {channel.info}
      </Text>
    </View>
  );
};

export default ChannelItem;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  middleContainer: {
    marginTop: 12,
    marginBottom: 5,
  },

  info: {
    color: '#494D5F',
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: -0.3,
    fontWeight: '400',
  },
});
