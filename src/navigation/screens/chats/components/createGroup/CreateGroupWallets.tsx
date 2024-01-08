import {Entypo, EvilIcons, Ionicons} from '@expo/vector-icons';
import {PushApi} from '@kalashshah/react-native-sdk/src';
import {IUser} from '@pushprotocol/restapi';
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import Tooltip from 'rn-tooltip';
import Globals from 'src/Globals';
import envConfig from 'src/env.config';
import {caip10ToWallet, walletToCAIP10} from 'src/helpers/CAIPHelper';
import {UserHelper} from 'src/helpers/UserHelper';
import Web3Helper from 'src/helpers/Web3Helper';
import {selectUsers} from 'src/redux/authSlice';

import {getTrimmedAddress} from '../../helpers/chatAddressFormatter';

interface CreateGroupWalletsProps {
  members: {user: IUser; isAdmin: boolean}[];
  setMembers: React.Dispatch<
    React.SetStateAction<{user: IUser; isAdmin: boolean}[]>
  >;
}

const CreateGroupWallets = ({members, setMembers}: CreateGroupWalletsProps) => {
  const [ethAddress, setEthAddress] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [connectedUser] = useSelector(selectUsers);

  const MAX_MEMBERS = 5000;

  const handleSearch = async () => {
    const query = ethAddress.trim();
    if (
      query === '' ||
      query === connectedUser.wallet ||
      members.length >= MAX_MEMBERS
    ) {
      return;
    }

    try {
      setIsSearching(true);
      let address = '';
      if (Web3Helper.isHex(query)) {
        address = Web3Helper.getAddressChecksum(query.toLowerCase());
      } else {
        address = await Web3Helper.resolveBlockchainDomain(query, 'ETH');
      }

      const profile = await PushApi.user.get({
        env: envConfig.ENV as PushApi.Env,
        account: address,
      });

      const caip10 = walletToCAIP10(address);
      if (members.find(member => member.user.wallets === caip10)) return;
      if (profile)
        setMembers(prev => [...prev, {user: profile, isAdmin: false}]);
      else
        setMembers(prev => [
          ...prev,
          {user: UserHelper.displayDefaultUser({caip10}), isAdmin: false},
        ]);
    } catch (error) {
    } finally {
      setEthAddress('');
      setIsSearching(false);
    }
  };

  const toggleAdmin = (index: number) => {
    const newMembers = [...members];
    newMembers[index].isAdmin = !newMembers[index].isAdmin;
    setMembers(newMembers);
  };

  const removeMember = (index: number) => {
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  return (
    <>
      <View style={styles.topContainer}>
        <Text style={styles.subtitle}>Add wallets</Text>
        <Text style={styles.memberLen}>{`${
          members.length + 1
        } / ${MAX_MEMBERS} Members`}</Text>
      </View>
      <View style={styles.inputContainer}>
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
        {isSearching && <EvilIcons name="spinner" size={24} color="black" />}
      </View>
      <FlatList
        scrollEnabled={false}
        data={members}
        keyExtractor={item => item.user.did}
        renderItem={({item, index}) => {
          return (
            <View style={styles.profileContainer}>
              <View style={styles.flexRow}>
                <Image
                  style={styles.profilePic}
                  source={{
                    uri:
                      item.user.profile.picture ||
                      Globals.CONSTANTS.DEFAULT_PROFILE_PICTURE,
                  }}
                />
                <Text style={styles.profileAddr}>
                  {getTrimmedAddress(caip10ToWallet(item.user.wallets))}
                </Text>
              </View>
              <View style={styles.flexRow}>
                {item.isAdmin && (
                  <Ionicons
                    name="shield-outline"
                    size={20}
                    color={Globals.COLORS.PINK}
                  />
                )}
                <Tooltip
                  overlayColor="transparent"
                  backgroundColor={Globals.COLORS.WHITE}
                  actionType="press"
                  height={60}
                  popover={
                    <View>
                      <TouchableOpacity
                        style={styles.flexRow}
                        onPress={() => toggleAdmin(index)}>
                        <Ionicons
                          name="shield-outline"
                          size={24}
                          color="black"
                        />
                        <Text style={styles.tooltipTxt}>
                          {!item.isAdmin ? 'Make' : 'Remove'} admin
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.flexRow}
                        onPress={() => removeMember(index)}>
                        <Ionicons
                          name="remove-circle-outline"
                          size={24}
                          color="black"
                        />
                        <Text style={styles.tooltipTxt}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  }>
                  <Entypo name="dots-three-vertical" size={18} color="black" />
                </Tooltip>
              </View>
            </View>
          );
        }}
      />
    </>
  );
};

export default CreateGroupWallets;

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 18,
  },
  memberLen: {
    fontSize: 12,
    color: Globals.COLORS.DARK_GRAY,
  },
  topContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
    marginBottom: 8,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileAddr: {
    fontSize: 16,
    marginLeft: 12,
  },
  input: {
    color: Globals.COLORS.BLACK,
    fontSize: 16,
    width: '100%',
    flex: 1,
    alignSelf: 'center',
    textAlignVertical: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    width: '100%',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Globals.COLORS.CHAT_LIGHT_GRAY,
    height: 48,
    marginVertical: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipTxt: {
    marginLeft: 8,
  },
});
