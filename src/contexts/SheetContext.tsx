import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import React, {
  createContext,
  createRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {BackHandler} from 'react-native';
import {StyleSheet} from 'react-native';
import NFSettingsSheet from 'src/components/sheets/NFSettingSheet';
import {Channel} from 'src/redux/channelSlice';

type Sheets = 'NFSettingsSheet';

type OpenSheetOptions = {
  name: 'NFSettingsSheet';
  channel: Channel;
};

const nfSettingSheetRef = createRef<BottomSheet>();

export const SheetContext = createContext({
  nfSettingSheetRef,
  openSheet: (options: OpenSheetOptions) => {},
  closeSheet: (name: Sheets) => {},
});

export const useSheets = () => {
  const context = React.useContext(SheetContext);
  if (!context)
    throw new Error('useSheet must be used within a SheetContextProvider');

  return context;
};

interface SheetContextProviderProps {
  children: React.ReactNode;
}

const SheetContextProvider = ({children}: SheetContextProviderProps) => {
  const [nfSettingCurrentChannel, setNfSettingCurrentChannel] =
    useState<Channel>();
  const [isOpenNfSettingSheet, setIsOpenNfSettingSheet] = useState(false);
  const nfSettingSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    const backAction = () => {
      if (isOpenNfSettingSheet) {
        nfSettingSheetRef.current?.close();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isOpenNfSettingSheet]);

  const snapPointsNfSettingsSheet = useMemo(() => {
    if (nfSettingCurrentChannel && nfSettingCurrentChannel.channel_settings) {
      return ['85%'];
    } else {
      return [200];
    }
  }, [nfSettingCurrentChannel]);

  const openSheet = (options: OpenSheetOptions) => {
    switch (options.name) {
      case 'NFSettingsSheet':
        setIsOpenNfSettingSheet(true);
        setNfSettingCurrentChannel(options.channel);
        nfSettingSheetRef.current?.expand();
        break;
    }
  };

  const closeSheet = (name: Sheets) => {
    switch (name) {
      case 'NFSettingsSheet':
        nfSettingSheetRef.current?.close();
        setIsOpenNfSettingSheet(false);
        break;
    }
  };

  return (
    <SheetContext.Provider value={{nfSettingSheetRef, openSheet, closeSheet}}>
      {children}
      <BottomSheet
        ref={nfSettingSheetRef}
        handleIndicatorStyle={styles.handleIndicator}
        enablePanDownToClose={true}
        onClose={() => {
          setNfSettingCurrentChannel(undefined);
          setIsOpenNfSettingSheet(false);
        }}
        index={-1}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        snapPoints={snapPointsNfSettingsSheet}>
        {nfSettingCurrentChannel && (
          <NFSettingsSheet
            channel={nfSettingCurrentChannel}
            hideSheet={() => {
              nfSettingSheetRef.current?.close();
              setNfSettingCurrentChannel(undefined);
            }}
          />
        )}
      </BottomSheet>
    </SheetContext.Provider>
  );
};

export default SheetContextProvider;

const styles = StyleSheet.create({
  handleIndicator: {
    top: -24,
    width: 50,
    backgroundColor: 'white',
  },
});
