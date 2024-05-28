import {Env, user} from '@pushprotocol/restapi';
import Globals from 'src/Globals';
import envConfig from 'src/env.config';

import {CacheHelper} from './CacheHelper';

export const ProfilePicHelper = {
  getProfilePicture: async (address: string) => {
    try {
      const cachedPicture = await CacheHelper.getItem(address);
      if (cachedPicture) return cachedPicture;
      const response = await user.get({
        account: address,
        env: envConfig.ENV as Env,
      });
      const pfp =
        response?.profile?.picture || Globals.CONSTANTS.DEFAULT_PROFILE_PICTURE;
      CacheHelper.setItem(address, pfp);
    } catch {
      return Globals.CONSTANTS.DEFAULT_PROFILE_PICTURE;
    }
  },
};
