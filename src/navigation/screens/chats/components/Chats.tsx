import {EvilIcons} from '@expo/vector-icons';
import React, {useContext, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import Globals from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import Web3Helper from 'src/helpers/Web3Helper';
import {Context} from 'src/navigation/screens/chats/ChatScreen';

import SingleChatItem from './SingleChatItem';

type ChatsProps = {
  feeds: PushNodeClient.Feeds[];
  isIntentReceivePage: boolean;
};

const getCombinedDID = (addrs1: string, addrs2: string) => {
  return `eip155:${addrs1}_eip155:${addrs2}`;
};

const tempImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA60lEQVR4AcXBsW3EMAxA0R9CM7jPEgY8QUqtoIaNu9SuvYIbNVyBUxxwo2iJpKVTKDhcwfc+vj6/f5g49kF0Xgszxz6IzmthRkgmJBOSFTUn6q0SjfXBzVWZGeuDm6sSqTmRkExIJiQrvVUiNSfqrRKpOTO9VSI1J+qtEgnJhGRCssI/1JxXqDmvEJIJyYRk5dgH0eCut0qk5sz0VonUnOjYB5GQTEgmJCvntRDpyo2aE/VWmVFzZs5rIRKSCcmEZIU/ludGNNYHkZrziuW5MSMkE5IJyYqac/PciHqrvOPYB5GaEwnJhGRCsl/QAz+87qkGxwAAAABJRU5ErkJggg==';

const Chats = ({feeds, isIntentReceivePage}: ChatsProps) => {
  const [value, setValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);

  const appContext = useContext(Context);

  const handleSearch = async () => {
    setIsSearching(true);
    const query = value.trim();
    if (Web3Helper.isHex(query)) {
      try {
        const finalAddress = Web3Helper.getAddressChecksum(query.toLowerCase());
        console.log(finalAddress);
      } catch {
        console.log('Error invalid address');
        handleClearSearch();
        return;
      }
    }
    setIsSearchEnabled(true);
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setIsSearchEnabled(false);
    setIsSearching(false);
    setValue('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchView}>
        <TextInput
          style={styles.input}
          onChangeText={setValue}
          value={value}
          placeholder="Search name.eth or 0x123.."
          editable={!isSearching}
          selectTextOnFocus={!isSearching}
        />
        {isSearching ? (
          <EvilIcons
            name="spinner"
            size={30}
            color="black"
            style={styles.searchImage}
          />
        ) : isSearchEnabled ? (
          <EvilIcons
            name="close"
            size={30}
            color="black"
            style={styles.searchImage}
            onPress={handleClearSearch}
          />
        ) : (
          <EvilIcons
            name="search"
            size={30}
            color="black"
            style={styles.searchImage}
            onPress={handleSearch}
          />
        )}
      </View>

      {isSearchEnabled && (
        <View style={styles.content}>
          <SingleChatItem
            image={tempImage}
            wallet={value}
            text={null}
            combinedDID={getCombinedDID(
              value,
              appContext?.connectedUser.wallets!,
            )}
            isIntentReceivePage={isIntentReceivePage}
            isIntentSendPage={true}
          />
        </View>
      )}

      {!isSearchEnabled && (
        <View style={styles.content}>
          {feeds.map((item, index) => (
            <SingleChatItem
              key={index}
              image={item.profilePicture}
              wallet={caip10ToWallet(item.wallets)}
              text={item.threadhash ? item.threadhash : ''}
              combinedDID={item.combinedDID}
              isIntentReceivePage={isIntentReceivePage}
              isIntentSendPage={false}
            />
          ))}
        </View>
      )}
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
