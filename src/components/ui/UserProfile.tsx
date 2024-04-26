import {Ionicons} from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import {usePushApi} from 'src/contexts/PushApiContext';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {getTrimmedAddress} from 'src/navigation/screens/chats/helpers/chatAddressFormatter';
import {selectUserAddress, selectUserDomain} from 'src/redux/authSlice';

export const UserProfileIcon = () => {
  const {readOnlyMode, isLoading, userInfo} = usePushApi();

  return (
    <View>
      <Image
        source={{
          uri:
            userInfo?.profile.picture ||
            GLOBALS.CONSTANTS.DEFAULT_PROFILE_PICTURE,
        }}
        style={styles.image}
        resizeMode={'cover'}
      />
      {!isLoading && (
        <View
          style={[
            styles.statusIcon,
            {
              backgroundColor: readOnlyMode
                ? GLOBALS.COLORS.STATUS_YELLOW
                : GLOBALS.COLORS.STATUS_GREEN,
            },
          ]}
        />
      )}
    </View>
  );
};

interface UserProfileAddressProps {
  icon: 'copy' | 'warning';
}

export const UserProfileAddress = ({icon}: UserProfileAddressProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const userAddress = useSelector(selectUserAddress);
  const userDomain = useSelector(selectUserDomain);

  const copyToClipboard = () => {
    Clipboard.setString(caip10ToWallet(userAddress || ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity
      style={[
        styles.addressContainer,
        {backgroundColor: icon === 'copy' ? '#F5EAFF' : '#FFEAEA'},
      ]}
      onPress={copyToClipboard}>
      <Text style={styles.address}>
        {userDomain || getTrimmedAddress(caip10ToWallet(userAddress || ''))}
      </Text>
      <Ionicons
        name={copied ? 'checkmark' : icon}
        size={copied ? 16 : 12}
        color={icon === 'copy' ? '#CF59E2' : '#E25959'}
      />
    </TouchableOpacity>
  );
};

interface UserProfileProps extends UserProfileAddressProps {}

const UserProfile = (props: UserProfileProps) => {
  return (
    <View style={styles.profileContainer}>
      <UserProfileIcon />
      <UserProfileAddress {...props} />
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  image: {
    width: 34,
    height: 34,
    borderWidth: 1,
    overflow: 'hidden',
    resizeMode: 'contain',
    borderRadius: 34 / 2,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
  },
  statusIcon: {
    position: 'absolute',
    top: 22,
    left: 22,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: GLOBALS.COLORS.WHITE,
  },
  addressContainer: {
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 13,
    color: GLOBALS.COLORS.BLACK,
    marginRight: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
