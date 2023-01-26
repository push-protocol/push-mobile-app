import React from 'react';
import {Image} from 'react-native';

const ICONS = {
  INBOX: 'INBOX',
  SPAM: 'SPAM',
  CHANNELS: 'CHANNELS',
  CHAT: 'CHAT',
};

type ICON_TYPE = 'INBOX' | 'SPAM' | 'CHANNELS' | 'CHAT';

interface TabIconProps {
  icon: ICON_TYPE;
  active: boolean;
}

const TabIcon = ({icon, active}: TabIconProps) => {
  switch (icon) {
    case 'CHAT':
      if (active) {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icon_filled/chat-icon.png')}
          />
        );
      } else {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/chat-icon.png')}
          />
        );
      }
    case 'SPAM':
      if (active) {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icon_filled/ic_outline-info.png')}
          />
        );
      } else {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/ic_outline-info.png')}
          />
        );
      }

    case 'CHANNELS':
      if (active) {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icon_filled/channel-icon.png')}
          />
        );
      } else {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/channel-icon.png')}
          />
        );
      }

    default:
      if (active) {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icon_filled/inbox-icon.png')}
          />
        );
      } else {
        return (
          <ImageComponent
            src={require('assets/icons/nav_icons/inbox-icon.png')}
          />
        );
      }
  }
};

const ImageComponent = ({src}: {src: any}) => {
  return <Image source={src} />;
};

export {ICONS, TabIcon};
