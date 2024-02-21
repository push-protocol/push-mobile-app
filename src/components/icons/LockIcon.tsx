import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

interface LockIconProps {
  color: string;
}

function LockIcon({color, ...props}: LockIconProps) {
  return (
    <Svg width={49} height={49} viewBox="0 0 49 49" fill="none" {...props}>
      <Path
        d="M32.3 43.876h-15a7.5 7.5 0 01-7.5-7.5v-15a3.75 3.75 0 013.75-3.75h22.5a3.75 3.75 0 013.75 3.75v15a7.5 7.5 0 01-7.5 7.5z"
        stroke={color}
        strokeWidth={2.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M24.8 35.353c0-1.282.608-2.559 1.744-3.156a3.75 3.75 0 00-1.744-7.07 3.75 3.75 0 00-1.744 7.07c1.135.597 1.744 1.874 1.744 3.156zm0 0v1.023M17.3 16.751v-5a7.5 7.5 0 1115 0v5"
        stroke={color}
        strokeWidth={2.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default LockIcon;
