import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Feeds} from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import SingleChatItem from './SingleChatItem';

type RequestProps = {
  requests: Feeds[];
  isIntentReceivePage: boolean;
};

const Requests = ({requests, isIntentReceivePage}: RequestProps) => {
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
            chatId={item.chatId}
            isIntentReceivePage={isIntentReceivePage}
            isIntentSendPage={false}
            clearSearch={() => {}}
          />
        ))}

        {requests.length === 0 && (
          <View style={styles.emptyRequests}>
            <Text style={styles.emptyRequestsText}>
              No pending requests at the movement
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Requests;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
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
  emptyRequests: {
    width: '100%',
    textAlign: 'center',
    marginTop: 100,
  },
  emptyRequestsText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
