import React from 'react';
import {Animated} from 'react-native';
import Globals from 'src/Globals';

interface CustomScrollProps {
  indicatorSize: number;
  sectionHeight: number;
  listHeight: number;
  indicatorPos: Animated.Value;
}

const CustomScroll = ({
  indicatorSize,
  indicatorPos,
  listHeight,
  sectionHeight,
}: CustomScrollProps) => {
  if (sectionHeight > listHeight) {
    return null;
  }
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 5,
          backgroundColor: Globals.COLORS.PINK,
          height: indicatorSize,
          right: 4,
          borderRadius: 8,
          bottom: 0,
        },
        {
          transform: [
            {
              translateY: Animated.multiply(
                indicatorPos,
                (-1 * Math.min(sectionHeight, listHeight)) /
                  (listHeight + 0.001),
              ),
            },
          ],
        },
      ]}
    />
  );
};

export {CustomScroll};
