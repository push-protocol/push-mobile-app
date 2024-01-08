import {FontAwesome5} from '@expo/vector-icons';
import React, {useEffect} from 'react';
import {Image, StyleSheet} from 'react-native';
import {Text, TouchableOpacity, View} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import Globals from 'src/Globals';
import LimitInput from 'src/components/input/LimitInput';

interface CreateGroupDetailsProps {
  groupName: string;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
  groupDescription: string;
  setGroupDescription: React.Dispatch<React.SetStateAction<string>>;
  isPublic: boolean;
  setIsPublic: React.Dispatch<React.SetStateAction<boolean>>;
  imageSource: string | undefined;
  setImageSource: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const CreateGroupDetails = ({
  groupName,
  setGroupName,
  groupDescription,
  imageSource,
  isPublic,
  setGroupDescription,
  setImageSource,
  setIsPublic,
}: CreateGroupDetailsProps) => {
  const handleImagePicker = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.5,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        setImageSource(response.assets[0].base64);
      }
    });
  };

  return (
    <>
      <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
        {imageSource ? (
          <Image
            source={{uri: `data:image/png;base64,${imageSource}`}}
            style={styles.previewImage}
          />
        ) : (
          <FontAwesome5 name="camera" size={38} color="#575D73" />
        )}
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <LimitInput
          title="Group Name"
          limit={50}
          value={groupName}
          defaultValue={groupName}
          onChangeText={txt => setGroupName(txt)}
        />
      </View>
      <View style={styles.inputContainer}>
        <LimitInput
          title="Group Description"
          limit={150}
          optional
          value={groupDescription}
          defaultValue={groupDescription}
          onChangeText={txt => setGroupDescription(txt)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[
            styles.toggleItem,
            styles.toggleItemLeft,
            isPublic && styles.selectedItem,
          ]}
          onPress={() => setIsPublic(true)}>
          <Text style={styles.toggleTitle}>Public</Text>
          <Text style={styles.toggleTxt}>
            Anyone can view chats, even without joining
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleItem,
            styles.toggleItemRight,
            !isPublic && styles.selectedItem,
          ]}
          onPress={() => setIsPublic(false)}>
          <Text style={styles.toggleTitle}>Private</Text>
          <Text style={styles.toggleTxt}>
            Encrypted Chats, Users must join group to view
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CreateGroupDetails;

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  toggle: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleItem: {
    width: '50%',
    alignItems: 'center',
    padding: 12,
    borderWidth: 0.5,
    borderColor: Globals.COLORS.CHAT_LIGHT_GRAY,
  },
  toggleTitle: {
    fontSize: 18,
  },
  toggleTxt: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    color: Globals.COLORS.CHAT_LIGHT_DARK,
  },
  selectedItem: {
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
  },
  toggleItemLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  toggleItemRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  uploadButton: {
    width: 128,
    height: 128,
    borderRadius: 12,
    backgroundColor: Globals.COLORS.LIGHT_BLUE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 128,
    height: 128,
    borderRadius: 12,
    ...StyleSheet.absoluteFillObject,
  },
});
