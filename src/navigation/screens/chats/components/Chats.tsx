import {EvilIcons} from '@expo/vector-icons';
import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import Globals from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import SingleChatItem from './SingleChatItem';

type ChatsProps = {
  feeds: PushNodeClient.Feeds[];
};

const Chats = ({feeds}: ChatsProps) => {
  const [value, setValue] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.searchView}>
        <TextInput
          style={styles.input}
          onChangeText={setValue}
          value={value}
          placeholder="Search name.eth or 0x123.."
          autoFocus
        />

        <EvilIcons
          name="search"
          size={30}
          color="black"
          style={styles.searchImage}
        />
      </View>

      <View style={styles.content}>
        {feeds.map((item, index) => (
          <SingleChatItem
            key={index}
            image={item.profilePicture}
            wallet={caip10ToWallet(item.wallets)}
            text={item.threadhash ? item.threadhash : ''}
          />
        ))}
      </View>
    </View>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '95%',
    height: '100%',
  },
  content: {padding: 10, width: '100%'},
  input: {
    margin: 12,
    borderRadius: 20,
    padding: 20,
    color: Globals.COLORS.BLACK,
    fontSize: 18,
    textTransform: 'capitalize',
    height: 60,
    paddingLeft: 15,
    paddingRight: 10,
    width: '70%',
    minWidth: '70%',
  },
  searchView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    margin: 12,
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
    borderRadius: 20,
    padding: 4,
    color: Globals.COLORS.BLACK,
    marginBottom: 10,
  },
  searchImage: {
    marginRight: 20,
  },

  walletImage: {
    width: 24,
    height: 24,
    marginRight: 5,
    resizeMode: 'contain',
  },
  bottomText: {
    color: Globals.COLORS.BLACK,
    marginLeft: 10,
    fontSize: 16,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomContainer: {
    borderTopColor: Globals.COLORS.LIGHT_GRAY,
    flex: 1,
    justifyContent: 'space-between',
    borderTopWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 30,
  },
});
