import React, {useRef, useState} from 'react';
import {PanResponder, StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

type SliderInputProps = {
  min: number;
  max: number;
  step: number;
  val: number;
  defaultValue: number;
  onChange: (value: {x: number}) => void;
};

const SliderInput = ({
  min,
  max,
  step,
  val,
  defaultValue,
  onChange,
}: SliderInputProps) => {
  const sliderRef = useRef<View>(null);
  const [coordinates, setCoordinates] = useState<{
    left: number;
    width: number;
  }>();

  const handleLayout = () => {
    if (sliderRef.current) {
      sliderRef.current.measure((x, y, width, height, pageX, pageY) => {
        setCoordinates({left: pageX, width});
      });
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (_, gestureState) => {
      if (coordinates) {
        const {left, width} = coordinates;
        let x = (gestureState.moveX - left) / width;
        const lowerBound =
          defaultValue - Math.floor((defaultValue - min) / step) * step;
        const upperBound =
          defaultValue + Math.floor((max - defaultValue) / step) * step;

        if (x <= 0) x = lowerBound;
        else if (x >= 1) x = upperBound;
        else {
          const stepCount = Math.floor(
            (x * (max - min) + min - defaultValue) / step,
          );
          x = defaultValue + stepCount * step;
          if (x < lowerBound) x = lowerBound;
          if (x > upperBound) x = upperBound;
        }
        const decimalPlaces = (step.toString().split('.')[1] || '').length;
        onChange({x: Number(x.toFixed(decimalPlaces))});
      }
    },
    onPanResponderRelease: () => {},
  });

  const fractionFilled = (val - min) / (max - min);

  return (
    <>
      <Text style={styles.label}>{val}</Text>
      <View style={styles.container} ref={sliderRef} onLayout={handleLayout}>
        <View style={styles.sliderTrack}>
          <View
            style={[
              styles.sliderFilledTrack,
              {width: `${fractionFilled * 100}%`},
            ]}
          />
          <View
            {...panResponder.panHandlers}
            style={[
              styles.sliderThumb,
              {
                // Prevent the thumb from going outside the track
                // by setting the left position to 0 when the value is 0
                // and to the width of the track minus the width of the thumb
                // multiplied by the ratio to get smooth value scale
                left: Math.max(
                  0,
                  fractionFilled * (coordinates?.width ?? 0) -
                    24 * fractionFilled,
                ),
              },
            ]}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    overflow: 'visible',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#BAC4D6',
    flex: 1,
    borderRadius: 2,
  },
  sliderFilledTrack: {
    height: '100%',
    backgroundColor: Globals.COLORS.PINK,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Globals.COLORS.WHITE,
    borderWidth: 1,
    borderColor: '#BAC4D6',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: -10,
  },
  thumbText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  label: {
    color: '#494D5F',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22.5,
    letterSpacing: -0.3,
    textAlign: 'left',
    marginVertical: 4,
  },
});

export default SliderInput;
