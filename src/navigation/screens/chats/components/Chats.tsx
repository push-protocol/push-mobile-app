import {EvilIcons, Ionicons} from '@expo/vector-icons';
import {IFeeds} from '@pushprotocol/restapi';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import {caip10ToWallet, getCombinedDID} from 'src/helpers/CAIPHelper';
import Web3Helper from 'src/helpers/Web3Helper';
import {Context} from 'src/navigation/screens/chats/ChatScreen';

import {DEFAULT_AVATAR} from '../constants';
import SingleChatItem from './SingleChatItem';

type ChatsProps = {
  feeds: IFeeds[];
  isIntentReceivePage: boolean;
  toastRef: any;
};

const Chats = ({feeds, isIntentReceivePage, toastRef}: ChatsProps) => {
  const [ethAddress, setEthAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [matchedItem, setMatchedItem] = useState<IFeeds | null>(null);

  const appContext = useContext(Context);
  const navigation = useNavigation();

  const showError = (q: string) => {
    if (toastRef) {
      toastRef.showToast(
        `${q} is not a valid ens name or eth address`,
        '',
        ToasterOptions.TYPE.GRADIENT_PRIMARY,
      );
    }
  };

  const checkIfAddressPresetInFeed = (
    addrs: string,
  ): [IFeeds | null, boolean] => {
    for (let i = 0; i < feeds.length; i++) {
      if (feeds[i].wallets.indexOf(addrs) !== -1) {
        return [feeds[i], true];
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
        console.log('weee were called');
        setMatchedItem(matchedFeed);
      }
      setIsSearchEnabled(true);
    } catch (error) {
      showError(query);
      setEthAddress('');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setIsSearchEnabled(false);
    setIsSearching(false);
    setMatchedItem(null);
    setEthAddress('');
  };

  const navigateToCreateGrp = () => {
    // @ts-ignore
    navigation.navigate(Globals.SCREENS.CREATE_GROUP);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchView}>
        <TextInput
          style={styles.input}
          onChangeText={setEthAddress}
          value={ethAddress}
          placeholder="Search web3 domain or 0x123.."
          editable={!isSearching}
          selectTextOnFocus={!isSearching}
          placeholderTextColor="#000"
          autoCapitalize="none"
          onSubmitEditing={handleSearch}
          multiline={false}
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
              chatId={matchedItem.chatId}
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
                appContext?.connectedUser.wallets!,
              )}
              isIntentReceivePage={isIntentReceivePage}
              isIntentSendPage={true}
              clearSearch={handleClearSearch}
              chatId={undefined}
            />
          </View>
        ))}

      {!isSearchEnabled && (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.createGrpButton}
            onPress={navigateToCreateGrp}>
            <Ionicons
              name="people-outline"
              style={styles.createGrpButtonIcon}
            />
            <Text style={styles.createGrpButtonTxt}>Create Group</Text>
            <View style={styles.newTag}>
              <Text style={styles.newTagTxt}>New</Text>
            </View>
          </TouchableOpacity>
          {feeds.map((item, index) => {
            if (item.groupInformation) {
              return (
                <SingleChatItem
                  key={item.chatId || index}
                  image={item.groupInformation.groupImage}
                  title={item.groupInformation.groupName}
                  clearSearch={handleClearSearch}
                  chatId={item.groupInformation.chatId}
                  isIntentReceivePage={isIntentReceivePage}
                  isIntentSendPage={false}
                  text={item.threadhash ? item.threadhash : ''}
                  feed={item}
                  combinedDID={item.combinedDID}
                />
              );
            } else {
              return (
                <SingleChatItem
                  key={item.chatId || index}
                  image={item.profilePicture}
                  wallet={caip10ToWallet(item.wallets)}
                  text={item.threadhash ? item.threadhash : ''}
                  combinedDID={item.combinedDID}
                  isIntentReceivePage={isIntentReceivePage}
                  isIntentSendPage={false}
                  clearSearch={handleClearSearch}
                  chatId={item.chatId}
                  feed={item}
                />
              );
            }
          })}
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
    width: '100%',
    paddingHorizontal: 16,
  },
  content: {
    padding: 10,
    width: '100%',
    paddingBottom: 100,
  },
  input: {
    borderRadius: 20,
    color: Globals.COLORS.BLACK,
    fontSize: 16,
    height: Dimensions.get('window').height / 16,
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
    height: 50,
    marginTop: 12,
    marginLeft: 5,
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
    borderRadius: 20,
    padding: 4,
    color: Globals.COLORS.BLACK,
  },

  searchImage: {
    marginRight: 10,
    flex: 1,
    paddingHorizontal: 10,
    // paddingVertical: 8,
    // backgroundColor: 'pink',
    width: '20%',
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
  createGrpButton: {
    height: 54,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  createGrpButtonTxt: {
    fontSize: 16,
  },
  createGrpButtonIcon: {
    fontSize: 32,
    marginRight: 8,
    color: Globals.COLORS.PINK,
    transform: [{scaleX: -1}],
  },
  newTag: {
    backgroundColor: Globals.COLORS.CHAT_LIGHT_PINK,
    borderRadius: 6,
    marginLeft: 18,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newTagTxt: {
    color: Globals.COLORS.PINK,
    fontSize: 10,
  },
});
