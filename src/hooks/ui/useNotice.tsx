import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import GLOBALS from 'src/Globals';
import StylishLabel from 'src/components/labels/StylishLabel';

interface NoticeProps {
  defaultOpen?: boolean;
}

interface NoticeComponentProps {
  title: string;
  subtitle?: string;
  notice?: string;
  loading?: boolean;
  closeFunc: () => void;
  closeTitle: string;
}

const useNotice = ({defaultOpen = false}: NoticeProps = {}) => {
  const [open, setOpen] = useState(defaultOpen);
  const fader = useRef(new Animated.Value(0)).current;

  const showNotice = () => {
    Animated.timing(fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setOpen(true);
  };

  const hideNotice = () => {
    Animated.timing(fader, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setOpen(false);
  };

  const NoticeComponent = ({
    title,
    subtitle,
    notice,
    loading = false,
    closeFunc,
    closeTitle,
  }: NoticeComponentProps) => {
    if (!open) return null;
    return (
      <Animated.View style={[styles.container, {opacity: fader}]}>
        <View style={styles.notice}>
          <View>
            {title == null ? null : <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {notice && (
            <View style={styles.noticeArea}>
              {loading === true ? (
                <ActivityIndicator size="large" color={GLOBALS.COLORS.BLACK} />
              ) : (
                <StylishLabel
                  style={styles.noticeText}
                  textStyle={styles.overrideStylish}
                  title={notice}
                  fontSize={14}
                />
              )}
            </View>
          )}
          {loading === true ? null : (
            <View>
              <TouchableHighlight
                style={styles.cancel}
                underlayColor={GLOBALS.COLORS.MID_GRAY}
                onPress={closeFunc}>
                <Text style={styles.cancelText}>{closeTitle}</Text>
              </TouchableHighlight>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return {
    isNoticeOpen: open,
    showNotice,
    hideNotice,
    NoticeComponent,
  };
};

export default useNotice;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  notice: {
    position: 'absolute',
    display: 'flex',
    alignSelf: 'center',
    width: '75%',
    maxWidth: 300,
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
  },
  title: {
    fontSize: 16,
    backgroundColor: GLOBALS.COLORS.WHITE,
    color: GLOBALS.COLORS.BLACK,
    paddingTop: 20,
    paddingBottom: 5,
    paddingHorizontal: 15,
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    paddingTop: 5,
    paddingBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
    color: GLOBALS.COLORS.BLACK,
    textAlign: 'center',
    fontSize: 14,
  },
  noticeArea: {
    paddingVertical: 25,
    paddingHorizontal: 15,
    justifyContent: 'center',
    backgroundColor: GLOBALS.COLORS.SLIGHT_GRAY,
  },
  noticeText: {
    fontSize: 14,
    minWidth: 20,
    minHeight: 30,
    textAlign: 'center',
    color: GLOBALS.COLORS.BLACK,
  },
  cancel: {
    padding: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  cancelText: {
    color: GLOBALS.COLORS.LINKS,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overrideStylish: {
    textAlign: 'center',
  },
});
