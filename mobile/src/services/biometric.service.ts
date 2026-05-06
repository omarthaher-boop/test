import * as LocalAuthentication from 'expo-local-authentication';

export const biometricService = {
  async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    return LocalAuthentication.supportedAuthenticationTypesAsync();
  },

  async hasFaceId(): Promise<boolean> {
    const types = await this.getSupportedTypes();
    return types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  },

  async authenticate(reason: string): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Abbrechen',
      fallbackLabel: 'PIN verwenden',
      disableDeviceFallback: false,
    });
    return result.success;
  },

  async cancelAuthentication(): Promise<void> {
    await LocalAuthentication.cancelAuthenticate();
  },
};
