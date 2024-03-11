import React from 'react';
import {Image} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import GLOBALS from 'src/Globals';
import {ChainHelper} from 'src/helpers/ChainHelper';
import {Channel} from 'src/redux/channelSlice';

type ChannelTitleCardProps = {
  channel: Channel;
};

type ChannelLogoProps = {
  icon?: any;
};

export const ChannelLogo = ({icon}: ChannelLogoProps) => {
  return (
    <View style={styles.iconContainer}>
      {icon && <Image source={{uri: icon}} style={styles.icon} />}
    </View>
  );
};

export const ChannelTitleCard = ({channel}: ChannelTitleCardProps) => {
  const icon = ChainHelper.chainIdToLogo(Number(channel.alias_blockchain_id));

  return (
    <View style={styles.titleCardContainer}>
      <View style={styles.row}>
        <Text style={styles.channelName} numberOfLines={1}>
          {channel.name}
        </Text>
        {channel.verified_status === 1 && (
          <Image
            source={require('assets/ui/verified.png')}
            style={styles.verifiedIcon}
          />
        )}
        <Image
          source={require('assets/ui/ethereum.png')}
          style={styles.verifiedIcon}
        />
        {icon && <Image source={icon} style={styles.verifiedIcon} />}
      </View>
      <Text style={styles.subscriberCount}>
        {Intl.NumberFormat('en', {notation: 'compact'}).format(
          channel.subscriber_count,
        )}{' '}
        {channel.subscriber_count === 1 ? 'subscriber' : 'subscribers'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  subscriberCount: {
    color: '#494D5F',
  },
  channelName: {
    color: GLOBALS.COLORS.BLACK,
    fontSize: 18,
    letterSpacing: -0.43,
    lineHeight: 23.4,
  },
  verifiedIcon: {
    width: 16,
    height: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  icon: {
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  titleCardContainer: {
    flexDirection: 'column',
  },
});
