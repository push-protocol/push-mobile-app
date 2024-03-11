import React, {useRef, useState} from 'react';
import {PanResponder, StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

type RangeInputProps = {
  min: number;
  max: number;
  step: number;
  startValue: number;
  endValue: number;
  defaultStartValue: number;
  defaultEndValue: number;
  onChange: (value: {startVal: number; endVal: number}) => void;
};

const RangeInput = ({
  min,
  max,
  step,
  startValue,
  endValue,
  defaultStartValue,
  defaultEndValue,
  onChange,
}: RangeInputProps) => {
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

  const panResponderLeft = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (_, gestureState) => {
      if (coordinates) {
        const {left, width} = coordinates;
        let x = (gestureState.moveX - left) / width;
        const lowerBound =
          defaultStartValue -
          Math.floor((defaultStartValue - min) / step) * step;
        const upperBound =
          defaultStartValue +
          Math.floor((max - defaultStartValue) / step) * step;

        if (x <= 0) x = lowerBound;
        else if (x >= 1) x = upperBound;
        else {
          const stepCount = Math.floor(
            (x * (max - min) + min - defaultStartValue) / step,
          );
          x = defaultStartValue + stepCount * step;
          if (x < lowerBound) x = lowerBound;
          if (x > upperBound) x = upperBound;
        }
        const decimalPlaces = (step.toString().split('.')[1] || '').length;

        if (Number(x.toFixed(decimalPlaces)) >= endValue) return;
        onChange({
          startVal: Number(x.toFixed(decimalPlaces)),
          endVal: endValue,
        });
      }
    },
    onPanResponderRelease: () => {},
  });

  const panResponderRight = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (_, gestureState) => {
      if (coordinates) {
        const {left, width} = coordinates;
        let x = (gestureState.moveX - left) / width;
        const lowerBound =
          defaultEndValue - Math.floor((defaultEndValue - min) / step) * step;
        const upperBound =
          defaultEndValue + Math.floor((max - defaultEndValue) / step) * step;

        if (x <= 0) x = lowerBound;
        else if (x >= 1) x = upperBound;
        else {
          const stepCount = Math.floor(
            (x * (max - min) + min - defaultEndValue) / step,
          );
          x = defaultEndValue + stepCount * step;
          if (x < lowerBound) x = lowerBound;
          if (x > upperBound) x = upperBound;
        }
        const decimalPlaces = (step.toString().split('.')[1] || '').length;

        if (Number(x.toFixed(decimalPlaces)) <= startValue) return;

        onChange({
          startVal: startValue,
          endVal: Number(x.toFixed(decimalPlaces)),
        });
      }
    },
    onPanResponderRelease: () => {},
  });

  const fractionFilled = (endValue - startValue) / (max - min);
  const fractionStartLeft = (startValue - min) / (max - min);
  const fractionEndLeft = (endValue - min) / (max - min);

  return (
    <>
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>{startValue}</Text>
        <Text style={styles.label}>{endValue}</Text>
      </View>
      <View style={styles.container} ref={sliderRef} onLayout={handleLayout}>
        <View style={styles.sliderTrack}>
          <View
            style={[
              styles.sliderFilledTrack,
              {width: `${fractionFilled * 100}%`},
              {left: `${fractionStartLeft * 100}%`},
            ]}
          />
          <View
            {...panResponderLeft.panHandlers}
            style={[
              styles.sliderThumb,
              {
                // Prevent the thumb from going outside the track
                // by setting the left position to 0 when the value is 0
                // and to the width of the track minus the width of the thumb
                // multiplied by the ratio to get smooth value scale
                left: Math.max(
                  0,
                  fractionStartLeft * (coordinates?.width ?? 0) -
                    24 * fractionStartLeft,
                ),
              },
            ]}
          />
          <View
            {...panResponderRight.panHandlers}
            style={[
              styles.sliderThumb,
              {
                // Prevent the thumb from going outside the track
                // by setting the left position to 0 when the value is 0
                // and to the width of the track minus the width of the thumb
                // multiplied by the ratio to get smooth value scale
                left: Math.max(
                  0,
                  fractionEndLeft * (coordinates?.width ?? 0) -
                    24 * fractionEndLeft,
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
    borderRadius: 2,
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
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 4,
  },
});

export default RangeInput;
