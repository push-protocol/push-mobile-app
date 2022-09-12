import '@ethersproject/shims';
import {ethers} from 'ethers';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import SubscriptionStatus from 'src/components/buttons/SubscriptionStatus';

import ENV_CONFIG from 'src/env.config';
import GLOBALS from 'src/Globals';

const openURL = async url => {
  await Linking.openURL(url);
};

const ChannelItem = ({style, item, wallet, contract, pKey}) => {
  return item.icon && item.name ? (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          openURL(item.url);
        }}>
        <View style={styles.inner}>
          <View style={styles.iconContainer}>
            <Image source={{uri: item.icon}} style={styles.icon} />
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.contentTop}>
              <Text style={styles.contentTitle}>{item.name}</Text>
            </View>
            <View style={styles.contentBottom}>
              <Text
                style={{
                  flex: 1,
                  flexWrap: 'wrap',
                  fontSize: 10,
                }}>
                {item.info}
              </Text>
            </View>
          </View>

          <View style={styles.controlsContainer}>
            <SubscriptionStatus
              channel={item.channel}
              user={wallet}
              pKey={pKey}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  ) : null;
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  inner: {
    backgroundColor: GLOBALS.COLORS.WHITE,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 10,
    borderColor: '#eee',
    borderWidth: 1,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    flex: 0.2,
    margin: 10,
    minHeight: 50,
    aspectRatio: 1,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  icon: {
    overflow: 'hidden',
    resizeMode: 'contain',
    flex: 1,
  },
  contentContainer: {
    flex: 0.65,
    marginVertical: 10,
    paddingRight: 10,
  },
  contentTop: {
    paddingVertical: 5,
    flexDirection: 'row',
  },
  contentTitle: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    fontSize: 14,
    flexWrap: 'wrap',
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
  },
  contentBottom: {
    flex: 1,
    paddingBottom: 5,
  },
  contentMsg: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 10,
  },
  controlsContainer: {
    flex: 0.15,
    justifyContent: 'center',
  },
});

export default ChannelItem;
