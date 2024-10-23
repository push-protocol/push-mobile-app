import React from 'react';
import ChannelsDisplayer from 'src/components/ui/ChannelsDisplayer';
import Header from 'src/components/ui/Header';

const ChannelsScreen = () => {
  return (
    <>
      <Header title="Channels" />
      <ChannelsDisplayer />
    </>
  );
};

export default ChannelsScreen;
