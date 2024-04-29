import React, {useState} from 'react';
import {Image, ImageSourcePropType, StyleSheet, Text, View} from 'react-native';
import GLOBALS from 'src/Globals';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import useAuth from 'src/hooks/auth/useAuth';

interface SectionProps {
  title: string;
  description: string;
  image: ImageSourcePropType;
}

const Section = ({title, description, image}: SectionProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Image source={image} style={styles.sectionImage} />
      <View style={styles.sectionRightContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
      </View>
    </View>
  );
};

const GetStartedScreen = () => {
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();

  const handleNextScreen = async () => {
    setLoading(true);
    await login();
    setLoading(false);
  };

  const sections: SectionProps[] = [
    {
      title: 'Subscribe',
      description: 'Opt-in to your favorite web3 protocols.',
      image: require('assets/ui/onboarding/ob-allset-sub.png'),
    },
    {
      title: 'Get Notified',
      description: 'Receive notifications from your favorite web3 services.',
      image: require('assets/ui/onboarding/ob-allset-notif.png'),
    },
    {
      title: 'Chat, Engage, and Connect',
      description:
        'Send and receive messages, reactions, images, gifs, join web3 community groups and so much more...',
      image: require('assets/ui/onboarding/ob-allset-chat.png'),
    },
  ];

  return (
    <OnboardingWrapper
      title="You're all set!"
      backgroundColor={GLOBALS.COLORS.BG_ALLSET}
      footerButtons={[
        {
          title: 'Get Started',
          loading: loading,
          bgColor: GLOBALS.COLORS.BLACK,
          fontColor: GLOBALS.COLORS.WHITE,
          onPress: () => handleNextScreen(),
        },
      ]}>
      <View style={styles.imageContainer}>
        <Image
          source={require('assets/ui/onboarding/ob-allset.png')}
          style={styles.image}
        />
      </View>
      <View style={styles.sectionsWrapper}>
        {sections.map((section, index) => (
          <Section key={index} {...section} />
        ))}
      </View>
    </OnboardingWrapper>
  );
};

export default GetStartedScreen;

const styles = StyleSheet.create({
  sectionImage: {
    width: 31,
    height: 31,
    marginTop: 5,
  },
  sectionTitle: {
    color: GLOBALS.COLORS.BLACK,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.43,
  },
  sectionDescription: {
    color: '#3D3E45',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.43,
  },
  sectionRightContainer: {
    marginLeft: 13,
  },
  sectionContainer: {
    flexDirection: 'row',
    marginHorizontal: 50,
  },
  sectionsWrapper: {
    gap: 24,
    justifyContent: 'flex-end',
    marginVertical: '10%',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
