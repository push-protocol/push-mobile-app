import {BlurView} from 'expo-blur';
import React from 'react';
import {InteractionManager, Pressable, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';

interface ModalType {
  InnerComponent?: (props: any) => JSX.Element;
  InnerComponentProps?: any;
  onBackDropPress?: () => void;
}

const useModalBlur = () => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = async () => {
    // Fix for iOS modal not opening bug
    await InteractionManager.runAfterInteractions(() => {
      setOpen(true);
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const ModalComponent = ({
    InnerComponent,
    InnerComponentProps,
    onBackDropPress,
  }: ModalType) => {
    return (
      <>
        <Modal
          isVisible={open}
          animationIn="fadeIn"
          animationInTiming={500}
          animationOut="fadeOut"
          animationOutTiming={500}
          backdropOpacity={1}
          customBackdrop={
            <Pressable onPress={onBackDropPress} style={styles.blurView}>
              <BlurView intensity={70} tint="dark" style={styles.blurView} />
            </Pressable>
          }>
          <View style={styles.container}>
            {InnerComponent && <InnerComponent {...InnerComponentProps} />}
          </View>
        </Modal>
      </>
    );
  };

  return {
    isModalOpen: open,
    showModal: handleOpen,
    hideModal: handleClose,
    ModalComponent,
  };
};

export default useModalBlur;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
});
