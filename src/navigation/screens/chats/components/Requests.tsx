import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Globals from 'src/Globals';

import {DUMMY_REQUESTS} from '../constants';
import SingleChatItem from './SingleChatItem';

const Requests = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {DUMMY_REQUESTS.map((item, index) => (
          <SingleChatItem
            key={index}
            image={item.image}
            wallet={item.wallet}
            text={item.text}
            time={item.time}
            onPress={() =>
              //@ts-ignore
              navigation.navigate(Globals.SCREENS.SINGLE_CHAT, {
                wallet: item.wallet,
              })
            }
          />
        ))}
      </View>
    </View>
  );
};

export default Requests;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '95%',
    height: '100%',
  },
  content: {padding: 10, width: '100%'},

  walletImage: {
    width: 24,
    height: 24,
    marginRight: 5,
    resizeMode: 'contain',
  },

  header: {
    marginBottom: 5,
    padding: 10,
  },
});
