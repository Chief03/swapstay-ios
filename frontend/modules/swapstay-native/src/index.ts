// TypeScript interface for the native module
export interface SwapstayNativeModule {
  verifyStudent(email: string): Promise<boolean>;
  calculateSwapMatch(listing1: any, listing2: any): Promise<number>;
  getDeviceInfo(): Promise<{ platform: string; version: string; model: string }>;
  triggerHaptic(type: 'light' | 'medium' | 'heavy'): Promise<void>;
  formatDate(timestamp: number): Promise<string>;
}

// Export the native module
export { default } from './SwapstayNativeModule';