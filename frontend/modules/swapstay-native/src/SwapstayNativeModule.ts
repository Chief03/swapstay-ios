import { NativeModulesProxy } from 'expo-modules-core';
import { SwapstayNativeModule } from './index';

// Get the native module
const SwapstayNative = NativeModulesProxy.SwapstayNative as SwapstayNativeModule;

export default SwapstayNative;