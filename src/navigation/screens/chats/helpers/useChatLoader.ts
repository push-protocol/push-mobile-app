import {useEffect, useState} from 'react';
import {generateKeyPair} from 'src/helpers/w2w/pgp';
import MetaStorage from 'src/singletons/MetaStorage';

const useChatLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    (async () => {
      const {wallet} = await MetaStorage.instance.getStoredWallets();
      const userPk =
        '0xc34e2e5d4473555cf7d880cc335309a5b59021930b13e70e859b6b84c7dd9ec2';
      console.log('userPk', userPk, 'address', wallet);

      // Obtain pgp key
      const keyPairs = await generateKeyPair();
      console.log('got keys', Object.keys(keyPairs));

      // setIsLoading(false);
    })();
  }, []);

  return [isLoading];
};
export {useChatLoader};
