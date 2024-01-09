import {Entypo, FontAwesome5, Ionicons} from '@expo/vector-icons';
import {GroupDTO} from '@pushprotocol/restapi';
import React, {useState} from 'react';
import {Image, KeyboardAvoidingView, ScrollView} from 'react-native';
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import {getTrimmedAddress} from './helpers/chatAddressFormatter';

const GroupInfo = ({route, navigation}: any) => {
  const {groupInformation}: {groupInformation: GroupDTO} = route.params;
  const memberCount = groupInformation.members.length;

  const [pendingMemberListOpen, setPendingMemberListOpen] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const showMemberList = (
    members: GroupDTO['members'] | GroupDTO['pendingMembers'],
    showTags: boolean,
  ) => {
    return (
      <FlatList
        data={members}
        keyExtractor={item => item.wallet}
        scrollEnabled={false}
        renderItem={({item}) => {
          return (
            <View style={styles.profileContainer}>
              <View style={styles.flexRow}>
                <Image
                  style={styles.profilePic}
                  source={{
                    uri:
                      item.image || Globals.CONSTANTS.DEFAULT_PROFILE_PICTURE,
                  }}
                />
                <Text style={styles.profileAddr}>
                  {getTrimmedAddress(caip10ToWallet(item.wallet))}
                </Text>
              </View>
              {showTags && (
                <View style={styles.flexRow}>
                  {item.isAdmin && (
                    <View style={styles.adminContainer}>
                      <Text style={styles.adminTxt}>Admin</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.flexGrow}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTxt}>Group info</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topContainer}>
              <Image
                source={{uri: groupInformation.groupImage}}
                style={styles.groupImage}
              />
              <View>
                <Text style={styles.groupName}>
                  {groupInformation.groupName}
                </Text>
                <Text style={styles.memberCount}>{`${memberCount} member${
                  memberCount === 1 ? '' : 's'
                }`}</Text>
              </View>
            </View>
            {groupInformation.groupDescription && (
              <View>
                <Text style={styles.groupDesc}>Group Description</Text>
                <Text style={styles.groupDescTxt}>
                  {groupInformation.groupDescription}
                </Text>
              </View>
            )}
            <View style={styles.lockContainer}>
              <Ionicons
                name={groupInformation.isPublic ? 'lock-open' : 'lock-closed'}
                size={24}
                color="black"
                style={styles.lockIcon}
              />
              <View>
                <Text style={styles.lockTitle}>
                  {groupInformation.isPublic ? 'Public' : 'Private'}
                </Text>
                <Text style={styles.lockDescription}>
                  {groupInformation.isPublic
                    ? 'Anyone can view the chats'
                    : 'Chats are encrypted'}
                </Text>
              </View>
            </View>
            {groupInformation.pendingMembers.length > 0 && (
              <TouchableOpacity
                style={styles.pendingReqContainer}
                onPress={() => setPendingMemberListOpen(val => !val)}>
                <View style={styles.pendingReqTopContainer}>
                  <Text style={styles.pendingReq}>Pending Requests</Text>
                  <Entypo
                    name={pendingMemberListOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="black"
                  />
                </View>
                {pendingMemberListOpen &&
                  showMemberList(groupInformation.pendingMembers, false)}
              </TouchableOpacity>
            )}
            {showMemberList(groupInformation.members, true)}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GroupInfo;

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
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Globals.COLORS.WHITE,
    paddingVertical: 10,
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 10
          : 30
        : 50,
    paddingHorizontal: 17,
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
  lockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 0.5,
    borderColor: Globals.COLORS.CHAT_LIGHT_GRAY,
    borderRadius: 16,
    marginVertical: 16,
  },
  lockTitle: {
    fontSize: 16,
  },
  lockDescription: {
    fontSize: 12,
    color: Globals.COLORS.CHAT_LIGHT_DARK,
  },
  lockIcon: {
    marginRight: 12,
  },
  groupImage: {
    height: 64,
    width: 64,
    borderRadius: 16,
    marginRight: 12,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  groupName: {
    fontSize: 20,
  },
  memberCount: {
    fontSize: 16,
    color: '#575D73',
  },
  groupDesc: {
    fontSize: 18,
    marginBottom: 5,
  },
  groupDescTxt: {
    fontSize: 16,
    color: '#575D73',
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
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingReqTopContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Globals.COLORS.WHITE,
    borderColor: Globals.COLORS.CHAT_LIGHT_GRAY,
    borderRadius: 16,
    width: '99.5%',
    alignSelf: 'center',
  },
  adminContainer: {
    backgroundColor: Globals.COLORS.CHAT_LIGHT_PINK,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminTxt: {
    fontSize: 12,
    color: Globals.COLORS.PINK,
  },
  pendingReq: {
    fontSize: 18,
    marginBottom: 5,
  },
  pendingReqContainer: {
    borderWidth: 0.5,
    borderColor: Globals.COLORS.CHAT_LIGHT_GRAY,
    marginBottom: 16,
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
    borderRadius: 16,
    display: 'flex',
  },
});
