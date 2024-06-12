import React, {useEffect, useState} from 'react';
import {Image, StyleSheet} from 'react-native';
import Globals from 'src/Globals';
import {ProfilePicHelper} from 'src/helpers/ProfilePicHelper';

import Blockies from '../web3/Blockies';

interface ProfilePictureProps {
  address: string;
}

const ProfilePicture = ({address}: ProfilePictureProps) => {
  const [profilePicture, setProfilePicture] = useState<string>();

  useEffect(() => {
    ProfilePicHelper.getProfilePicture(address).then(pic => {
      if (pic) setProfilePicture(pic);
    });
  }, []);

  return (
    <>
      {profilePicture ? (
        <Image
          source={{uri: profilePicture}}
          style={styles.image}
          resizeMode={'cover'}
        />
      ) : (
        <Blockies style={styles.blockies} seed={address} dimension={40} />
      )}
    </>
  );
};

export default ProfilePicture;

const styles = StyleSheet.create({
  blockies: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Globals.COLORS.LIGHT_GRAY,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: 40,
    height: 40,
    borderWidth: 1,
    marginRight: 10,
    overflow: 'hidden',
    resizeMode: 'contain',
    borderRadius: 40 / 2,
    borderColor: Globals.COLORS.LIGHT_GRAY,
  },
});
