import {Env, user} from '@pushprotocol/restapi';
import envConfig from 'src/env.config';

import {CacheHelper} from './CacheHelper';

export const ProfilePicHelper = {
  getProfilePicture: async (address: string) => {
    try {
      const cachedPicture = await CacheHelper.getItem(address.toLowerCase());
      if (cachedPicture) return cachedPicture;
      const response = await user.get({
        account: address,
        env: envConfig.ENV as Env,
      });
      const pfp = response?.profile?.picture;
      if (pfp) CacheHelper.setItem(address.toLowerCase(), pfp);
      return pfp;
    } catch {
      return null;
    }
  },
};
