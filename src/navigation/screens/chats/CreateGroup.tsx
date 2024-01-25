import {Ionicons} from '@expo/vector-icons';
import {ENV, createGroup} from '@kalashshah/react-native-sdk/src';
import {IUser} from '@pushprotocol/restapi';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
import {useSelector} from 'react-redux';
import Globals from 'src/Globals';
import envConfig from 'src/env.config';
import {caip10ToWallet, walletToCAIP10} from 'src/helpers/CAIPHelper';
import {selectUsers} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';

import {UserChatCredentials} from './ChatScreen';
import CreateGroupDetails from './components/createGroup/CreateGroupDetails';
import CreateGroupWallets from './components/createGroup/CreateGroupWallets';

const PADDING_TOP =
  Platform.OS === 'android'
    ? StatusBar.currentHeight
      ? StatusBar.currentHeight + 10
      : 30
    : 50;

const CREATE_GROUP_STEP_KEYS = {
  INPUT_DETAILS: 1,
  ADD_MEMBERS: 2,
} as const;

type CreateGroupStepKeys =
  (typeof CREATE_GROUP_STEP_KEYS)[keyof typeof CREATE_GROUP_STEP_KEYS];

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imageSource, setImageSource] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [activeComponent, setActiveComponent] = useState<CreateGroupStepKeys>(
    CREATE_GROUP_STEP_KEYS.INPUT_DETAILS,
  );
  const [members, setMembers] = useState<{user: IUser; isAdmin: boolean}[]>([]);
  const navigation = useNavigation();
  const [connectedUser] = useSelector(selectUsers);

  const handleBack = () => {
    if (activeComponent === CREATE_GROUP_STEP_KEYS.INPUT_DETAILS) {
      navigation.goBack();
    } else {
      setActiveComponent((activeComponent - 1) as CreateGroupStepKeys);
    }
  };

  const handleNext = async () => {
    if (activeComponent === CREATE_GROUP_STEP_KEYS.ADD_MEMBERS) {
      try {
        setIsLoading(true);
        const grpMembers = members
          .filter(member => !member.isAdmin)
          .map(member => caip10ToWallet(member.user.wallets));
        const admins = members
          .filter(member => member.isAdmin)
          .map(member => caip10ToWallet(member.user.wallets));

        const {pgpPrivateKey}: UserChatCredentials =
          await MetaStorage.instance.getUserChatData();

        const grp = await createGroup({
          groupName,
          groupDescription,
          members: grpMembers,
          groupImage: imageSource,
          admins,
          isPublic,
          pgpPrivateKey,
          account: walletToCAIP10(connectedUser.wallet),
          env: envConfig.ENV as ENV,
        });

        console.log('Group created successfully', grp);
        // @ts-ignore
        navigation.navigate(Globals.SCREENS.CHATS);
      } catch (err) {
        console.log('Error creating group', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (groupName === '' || groupDescription === '' || !imageSource) return;
      setActiveComponent((activeComponent + 1) as CreateGroupStepKeys);
    }
  };

  const renderStep = () => {
    switch (activeComponent) {
      case CREATE_GROUP_STEP_KEYS.INPUT_DETAILS:
        return (
          <CreateGroupDetails
            groupName={groupName}
            setGroupName={setGroupName}
            groupDescription={groupDescription}
            setGroupDescription={setGroupDescription}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            imageSource={imageSource}
            setImageSource={setImageSource}
          />
        );
      case CREATE_GROUP_STEP_KEYS.ADD_MEMBERS:
        return <CreateGroupWallets members={members} setMembers={setMembers} />;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.flexGrow}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons
                name="arrow-back"
                size={35}
                color={Globals.COLORS.CHAT_LIGHT_DARK}
              />
            </TouchableOpacity>
            <Text style={styles.headerTxt}>Create Group</Text>
          </View>
          <View style={styles.content}>
            {renderStep()}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleNext}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={Globals.COLORS.WHITE} size="small" />
              ) : (
                <Text style={styles.submitBtnTxt}>
                  {(activeComponent === CREATE_GROUP_STEP_KEYS.INPUT_DETAILS &&
                    'Next') ||
                    'Create Group'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateGroup;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Globals.COLORS.WHITE,
  },
  flexGrow: {
    flexGrow: 1,
  },
  content: {
    padding: 10,
    width: '100%',
    paddingHorizontal: 24,
    flex: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Globals.COLORS.WHITE,
    paddingVertical: 10,
    paddingTop: PADDING_TOP,
    paddingHorizontal: 16,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: PADDING_TOP,
    zIndex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: Globals.COLORS.WHITE,
  },
  headerTxt: {
    fontSize: 24,
    color: 'black',
    flex: 1,
    textAlign: 'center',
  },
  submitButton: {
    width: '50%',
    backgroundColor: Globals.COLORS.PINK,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
  submitBtnTxt: {
    color: Globals.COLORS.WHITE,
    fontSize: 16,
  },
});
