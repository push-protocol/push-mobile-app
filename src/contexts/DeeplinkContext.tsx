import {useNavigation} from '@react-navigation/native';
import React, {createContext, useCallback, useEffect, useState} from 'react';
import {Linking} from 'react-native';
import {useSelector} from 'react-redux';
import Globals from 'src/Globals';
import {DeeplinkHelper} from 'src/helpers/DeeplinkHelper';
import {selectAuthState} from 'src/redux/authSlice';

type DeeplinkPage = keyof typeof Globals.SCREENS | null;

interface DeeplinkContextType {
  page: DeeplinkPage;
  params: Object;
  setDeeplink: (page: DeeplinkPage, params: Object) => void;
}

export const DeeplinkContext = createContext<DeeplinkContextType>({
  page: null,
  params: {},
  setDeeplink: () => {},
});

export const useDeeplink = () => {
  const context = React.useContext(DeeplinkContext);
  if (!context)
    throw new Error(
      'useDeeplink must be used within a DeeplinkContextProvider',
    );

  return context;
};

interface DeeplinkContextProviderProps {
  children: React.ReactNode;
}

const DeeplinkContextProvider = ({children}: DeeplinkContextProviderProps) => {
  const [page, setPage] = useState<DeeplinkPage>(null);
  const [params, setParams] = useState<Object>({});
  const authState = useSelector(selectAuthState);
  const navigation = useNavigation();

  const setDeeplink = useCallback((page: DeeplinkPage, params: Object) => {
    setPage(page);
    setParams(params);
  }, []);

  useEffect(() => {
    if (authState === Globals.AUTH_STATE.AUTHENTICATED && page) {
      try {
        // @ts-ignore
        navigation.navigate(Globals.SCREENS[page]);
      } catch {
      } finally {
        setPage(null);
        setParams({});
      }
    }
  }, [page, authState]);

  useEffect(() => {
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('initial URL: ' + url);
      }
    });
    Linking.addEventListener('url', ({url}) => {
      console.log('url', url);
      const data = DeeplinkHelper.parseUrl(url);
      console.log('data: ' + JSON.stringify(data));
      setPage(data.page);
      setParams(data.params);
    });

    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  return (
    <DeeplinkContext.Provider value={{page, params, setDeeplink}}>
      {children}
    </DeeplinkContext.Provider>
  );
};

export default DeeplinkContextProvider;
