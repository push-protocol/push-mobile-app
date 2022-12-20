import {EvilIcons} from '@expo/vector-icons';
import React, {useContext, useState} from 'react';
import {Dimensions, StyleSheet, Text, TextInput, View} from 'react-native';
import Globals from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import {caip10ToWallet, getCombinedDID} from 'src/helpers/CAIPHelper';
import Web3Helper from 'src/helpers/Web3Helper';
import {Context} from 'src/navigation/screens/chats/ChatScreen';

import {DEFAULT_AVATAR} from '../constants';
import SingleChatItem from './SingleChatItem';

type ChatsProps = {
  feeds: PushNodeClient.Feeds[];
  isIntentReceivePage: boolean;
};

const Chats = ({feeds, isIntentReceivePage}: ChatsProps) => {
  const [ethAddress, setEthAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);

  const appContext = useContext(Context);

  const handleSearch = async () => {
    const query = ethAddress.trim();
    if (query === '') {
      return;
    }
    try {
      setIsSearching(true);
      if (Web3Helper.isHex(query)) {
        Web3Helper.getAddressChecksum(query.toLowerCase());
      } else if (query.includes('.eth')) {
        const address = await Web3Helper.resolveBlockchainDomain(query, 'eth');
        setEthAddress(address);
        console.log('Invalid ens name');
      }
      setIsSearchEnabled(true);
    } catch (error) {
      console.log('bad address', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setIsSearchEnabled(false);
    setIsSearching(false);
    setEthAddress('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchView}>
        <TextInput
          style={styles.input}
          onChangeText={setEthAddress}
          value={ethAddress}
          placeholder="Search name.eth or 0x1123..."
          editable={!isSearching}
          selectTextOnFocus={!isSearching}
          placeholderTextColor="#000"
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
            image={DEFAULT_AVATAR}
            wallet={ethAddress}
            text={null}
            combinedDID={getCombinedDID(
              ethAddress,
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

      {feeds.length === 0 && (
        <View style={styles.emptyFeeds}>
          <Text style={styles.emptyFeedsText}>No conversations found</Text>
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
    borderRadius: 20,
    color: Globals.COLORS.BLACK,
    fontSize: 16,
    height: Dimensions.get('window').height / 16,
    paddingLeft: 15,
    paddingRight: 10,
    textAlignVertical: 'top',
    width: '70%',
    flex: 2,
    minWidth: '70%',
  },
  searchView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginVertical: 12,
    marginLeft: 5,
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
    borderRadius: 20,
    padding: 4,
    color: Globals.COLORS.BLACK,
    marginBottom: 10,
  },

  searchImage: {
    marginRight: 20,
    flex: 1,
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
  emptyFeeds: {
    width: '100%',
    textAlign: 'center',
    marginTop: 100,
  },
  emptyFeedsText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
