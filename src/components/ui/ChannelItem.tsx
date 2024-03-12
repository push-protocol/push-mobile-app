import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Channel} from 'src/redux/channelSlice';

import SubscriptionStatus from '../buttons/SubscriptionStatus';
import {ChannelLogo, ChannelTitleCard} from './ChannelComponents';

type ChannelItemProps = {
  channel: Channel;
  selectChannelForSettings: (channel: Channel) => void;
};

const ChannelItem = ({channel, selectChannelForSettings}: ChannelItemProps) => {
  if (channel.name === null) {
    return null;
  }

  return (
    <View>
      <View style={styles.topContainer}>
        <ChannelLogo icon={channel.icon} />
        <SubscriptionStatus
          channel={channel}
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
