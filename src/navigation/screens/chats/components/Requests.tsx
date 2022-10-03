import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Feeds} from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import SingleChatItem from './SingleChatItem';

type RequestProps = {
  requests: Feeds[];
  isIntentPage: boolean;
};

const Requests = ({requests, isIntentPage}: RequestProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {requests.map((item, index) => (
          <SingleChatItem
            key={index}
            image={item.profilePicture}
            wallet={caip10ToWallet(item.wallets)}
            text={item.threadhash ? item.threadhash : ''}
            combinedDID={item.combinedDID}
            isIntentPage={isIntentPage}
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
