import type { Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps, HostComponent } from 'react-native';
import type { ColorValue } from 'react-native/Libraries/StyleSheet/StyleSheet';
interface NativeProps extends ViewProps {
    exclusive?: WithDefault<boolean, true>;
    foreground?: boolean;
    borderless?: boolean;
    enabled?: WithDefault<boolean, true>;
    rippleColor?: ColorValue;
    rippleRadius?: Int32;
    touchSoundDisabled?: WithDefault<boolean, false>;
}
declare const _default: HostComponent<NativeProps>;
export default _default;
