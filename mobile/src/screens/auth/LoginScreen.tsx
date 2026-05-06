import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { biometricService } from '../../services/biometric.service';
import { colors, spacing, borderRadius } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthStack';

const schema = z.object({
  email: z.string().email('Ungültige E-Mail'),
  password: z.string().min(1, 'Bitte Passwort eingeben'),
});

type FormData = z.infer<typeof schema>;

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasFaceId, setHasFaceId] = useState(false);
  const { setAuth, biometricEnabled } = useAuthStore();

  useEffect(() => {
    biometricService.isAvailable().then((available) => {
      setBiometricAvailable(available);
      if (available) biometricService.hasFaceId().then(setHasFaceId);
    });
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const login = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login({
        email: data.email.toLowerCase(),
        password: data.password,
      });
      const { user, tokens } = res.data.data;
      await setAuth(user, tokens.accessToken, tokens.refreshToken);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        Alert.alert(
          'E-Mail nicht verifiziert',
          'Bitte bestätige zunächst deine E-Mail-Adresse.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Erneut senden', onPress: () => navigation.navigate('VerifyEmail', { email: data.email }) },
          ],
        );
      } else {
        Alert.alert('Fehler', err?.response?.data?.message ?? 'Anmeldung fehlgeschlagen.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithBiometric = async () => {
    const success = await biometricService.authenticate(
      'Melde dich mit biometrischen Daten an',
    );
    if (!success) {
      Alert.alert('Authentifizierung fehlgeschlagen', 'Bitte melde dich mit Passwort an.');
    }
    // On success, the auth interceptor refreshes silently — the store
    // is already populated from app initialization.
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="car-sport" size={40} color={colors.primary} />
            </View>
            <Typography variant="h2" align="center">Willkommen zurück</Typography>
            <Typography variant="bodySmall" align="center" color={colors.textSecondary}>
              Melde dich an, um deine Fahrten zu verwalten
            </Typography>
          </View>

          {/* Biometric Button */}
          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity onPress={loginWithBiometric} style={styles.biometricBtn} activeOpacity={0.8}>
              <Card variant="flat" style={styles.biometricCard}>
                <Ionicons
                  name={hasFaceId ? 'scan-outline' : 'finger-print-outline'}
                  size={32}
                  color={colors.primary}
                />
                <Typography variant="bodySmall" color={colors.primary} weight="medium">
                  {hasFaceId ? 'Mit Face ID anmelden' : 'Mit Fingerabdruck anmelden'}
                </Typography>
              </Card>
            </TouchableOpacity>
          )}

          {/* Divider */}
          {biometricAvailable && biometricEnabled && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Typography variant="caption" color={colors.textMuted} style={styles.dividerText}>
                oder mit Passwort
              </Typography>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="E-Mail-Adresse"
                  placeholder="max@beispiel.de"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Passwort"
                  placeholder="Dein Passwort"
                  value={value}
                  onChangeText={onChange}
                  isPassword
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              title="Anmelden"
              onPress={handleSubmit(login)}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Typography variant="bodySmall" color={colors.textSecondary}>
              Noch kein Konto?{' '}
            </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Typography variant="bodySmall" color={colors.primary} weight="semibold">
                Registrieren
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  biometricBtn: { marginBottom: spacing.lg },
  biometricCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { paddingHorizontal: spacing.xs },
  form: { gap: spacing.xs },
  submitBtn: { marginTop: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
