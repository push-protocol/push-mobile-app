import {Ionicons} from '@expo/vector-icons';
import {EvilIcons} from '@expo/vector-icons';
import {PushApi} from '@kalashshah/react-native-sdk/src';
import React, {useRef, useState} from 'react';
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import {Toaster, ToasterOptions} from 'src/components/indicators/Toaster';
import {getCombinedDID} from 'src/helpers/CAIPHelper';
import Web3Helper from 'src/helpers/Web3Helper';
import {
  Context,
  UserChatCredentials,
} from 'src/navigation/screens/chats/ChatScreen';
import {DEFAULT_AVATAR} from 'src/navigation/screens/chats/constants';

import SingleChatItem from './components/SingleChatItem';
import {ChatData} from './helpers/useChatLoader';

const NewChatScreen = ({route, navigation}: any) => {
  const [ethAddress, setEthAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isIntentReceivePage, setIsIntentReceivePage] = useState(false);
  const [matchedItem, setMatchedItem] = useState<PushApi.IFeeds | null>(null);
  const toastRef = useRef<any>();

  const chatCredentials: UserChatCredentials = route.params.chatCredentials;
  const chatData: ChatData = route.params.chatData;

  const checkIfAddressPresetInFeed = (
    addrs: string,
  ): [PushApi.IFeeds | null, boolean] => {
    const feeds = chatData.feeds;

    if (feeds) {
      for (let i = 0; i < feeds.length; i++) {
        if (feeds[i].wallets && feeds[i].wallets.indexOf(addrs) !== -1) {
          return [feeds[i], true];
        }
      }
    }
    return [null, false];
  };

  const checkIfAddressPresetInReq = (
    addrs: string,
  ): [PushApi.IFeeds | null, boolean] => {
    const feeds = chatData.requests;
    if (feeds) {
      for (let i = 0; i < feeds.length; i++) {
        if (feeds[i].wallets && feeds[i].wallets.indexOf(addrs) !== -1) {
          return [feeds[i], true];
        }
      }
    }
    return [null, false];
  };

  const handleSearch = async () => {
    const query = ethAddress.trim();
    if (query === '') {
      return;
    }
    try {
      setIsSearching(true);
      let address = '';
      if (Web3Helper.isHex(query)) {
        address = Web3Helper.getAddressChecksum(query.toLowerCase());
      } else {
        try {
          address = await Web3Helper.resolveBlockchainDomain(query, 'ETH');
          setEthAddress(address);
        } catch (error) {
          showError(query);
          setEthAddress('');
          return;
        }
      }
      const [matchedFeed, isAddressPreset] =
        checkIfAddressPresetInFeed(address);

      if (isAddressPreset) {
        setMatchedItem(matchedFeed);
      } else {
        // for send intent page
        const [_matchedFeed, _isAddressPreset] =
          checkIfAddressPresetInReq(address);
        if (_isAddressPreset) {
          setMatchedItem(_matchedFeed);
          setIsIntentReceivePage(true);
        }
      }
      setIsSearchEnabled(true);
    } catch (error) {
      showError(query);
      setEthAddress('');
    } finally {
      setIsSearching(false);
    }
  };

  const showError = (q: string) => {
    if (toastRef.current) {
      toastRef.current.showToast(
        `${q} is not a valid ens name or eth address`,
        '',
        ToasterOptions.TYPE.GRADIENT_PRIMARY,
      );
    }
  };

  const handleClearSearch = () => {
    setIsSearchEnabled(false);
    setIsSearching(false);
    setIsIntentReceivePage(false);
    setMatchedItem(null);
    setEthAddress('');
  };

  if (!chatData.connectedUserData) {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '90%',
        }}>
        <Image
          style={{marginTop: 50, width: 50, height: 50}}
          source={require('assets/chat/loading.gif')}
        />
      </View>
    );
  }

  if (!chatData.connectedUserData) {
    return <></>;
  }

  return (
    <Context.Provider
      value={{
        connectedUser: chatData.connectedUserData!,
        feeds: chatData.feeds,
        requests: chatData.requests,
        chatCredentials: chatCredentials,
      }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={35}
            color={Globals.COLORS.CHAT_LIGHT_DARK}
            onPress={() => navigation.goBack()}
          />

          <View style={styles.info}>
            <View style={styles.user}>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.wallet}>New Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.searchView}>
          <TextInput
            style={styles.input}
            onChangeText={setEthAddress}
            value={ethAddress}
            placeholder="Search web3 domain or 0x123.."
            editable={!isSearching}
            selectTextOnFocus={!isSearching}
            placeholderTextColor={Globals.COLORS.CHAT_LIGHT_DARK}
            autoCapitalize="none"
            onSubmitEditing={handleSearch}
            multiline={false}
          />
          {isSearching ? (
            <EvilIcons
              name="spinner"
              size={30}
              color={Globals.COLORS.CHAT_LIGHT_DARK}
              style={styles.searchImage}
            />
          ) : isSearchEnabled ? (
            <EvilIcons
              name="close"
              size={30}
              color={Globals.COLORS.CHAT_LIGHT_DARK}
              style={styles.searchImage}
              onPress={handleClearSearch}
            />
          ) : (
            <EvilIcons
              name="search"
              size={30}
              color={Globals.COLORS.CHAT_LIGHT_DARK}
              style={styles.searchImage}
              onPress={handleSearch}
            />
          )}
        </View>

        {isSearchEnabled &&
          (matchedItem ? (
            <View style={styles.content}>
              <SingleChatItem
                image={matchedItem.profilePicture}
                wallet={ethAddress}
                text={matchedItem.threadhash ? matchedItem.threadhash : ''}
                combinedDID={matchedItem.combinedDID}
                isIntentReceivePage={isIntentReceivePage}
                isIntentSendPage={false}
                clearSearch={handleClearSearch}
              />
            </View>
          ) : (
            <View style={styles.content}>
              <SingleChatItem
                image={DEFAULT_AVATAR}
                wallet={ethAddress}
                text={null}
                combinedDID={getCombinedDID(
                  ethAddress,
                  chatData.connectedUserData.wallets,
                )}
                isIntentReceivePage={false}
                isIntentSendPage={true}
                clearSearch={handleClearSearch}
              />
            </View>
          ))}

        <Toaster ref={toastRef} />
      </View>
    </Context.Provider>
  );
};
export {NewChatScreen};

const styles = StyleSheet.create({
  content: {padding: 10, width: '100%', paddingHorizontal: 24},
  header: {
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 10
          : 30
        : 50,
    paddingHorizontal: 17,
    marginBottom: 0,
    borderBottomWidth: 3,
    borderBottomColor: '#D53893',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'white',
  },
  info: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    width: '85%',
    justifyContent: 'space-between',
  },

  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  user: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  wallet: {
    fontSize: 22,
    marginLeft: 10,
    color: '#D53893',
    fontWeight: '300',
  },
  input: {
    borderRadius: 20,
    color: Globals.COLORS.BLACK,
    fontSize: 16,
    paddingLeft: 15,
    paddingRight: 10,
    width: '65%',
    flex: 2,
    minWidth: '65%',
    alignSelf: 'center',
    textAlignVertical: 'center',
  },
  searchView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    marginTop: 14,
    marginHorizontal: 12,
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
    borderRadius: 20,
    color: Globals.COLORS.BLACK,
  },
  searchImage: {
    marginRight: 10,
    flex: 1,
    paddingHorizontal: 10,
    width: '20%',
  },
});
