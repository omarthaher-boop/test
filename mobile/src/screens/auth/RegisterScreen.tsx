import React, { useState } from 'react';
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
import { GdprConsentModal } from '../../components/auth/GdprConsentModal';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthStack';

const schema = z.object({
  name: z.string().min(2, 'Mindestens 2 Zeichen'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: JJJJ-MM-TT'),
  licensePlate: z.string().min(2, 'Kennzeichen eingeben').max(12),
  email: z.string().email('Ungültige E-Mail'),
  password: z.string().min(8, 'Mindestens 8 Zeichen'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showGdpr, setShowGdpr] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const { setGdprConsented } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      birthDate: '',
      licensePlate: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: FormData) => {
    setPendingData(data);
    setShowGdpr(true);
  };

  const handleGdprAccept = async () => {
    if (!pendingData) return;
    setShowGdpr(false);
    setLoading(true);

    try {
      await authApi.register({
        name: pendingData.name,
        birthDate: pendingData.birthDate,
        licensePlate: pendingData.licensePlate.toUpperCase(),
        email: pendingData.email.toLowerCase(),
        password: pendingData.password,
        gdprConsentedAt: new Date().toISOString(),
      });

      setGdprConsented(true);
      navigation.replace('VerifyEmail', { email: pendingData.email });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Registrierung fehlgeschlagen.';
      Alert.alert('Fehler', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGdprDecline = () => {
    setShowGdpr(false);
    Alert.alert(
      'Einwilligung abgelehnt',
      'Ohne Zustimmung zur Datenschutzerklärung kann die App nicht genutzt werden.',
    );
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
              <Ionicons name="car-sport" size={36} color={colors.primary} />
            </View>
            <Typography variant="h2" align="center">Konto erstellen</Typography>
            <Typography variant="bodySmall" align="center" color={colors.textSecondary}>
              Dokumentiere deine Fahrten einfach und sicher
            </Typography>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Vollständiger Name"
                  placeholder="Max Mustermann"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Geburtsdatum"
                  placeholder="1990-01-15 (JJJJ-MM-TT)"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.birthDate?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="licensePlate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Autokennzeichen"
                  placeholder="M AB 1234"
                  value={value}
                  onChangeText={(t) => onChange(t.toUpperCase())}
                  autoCapitalize="characters"
                  error={errors.licensePlate?.message}
                />
              )}
            />

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
                  placeholder="Mindestens 8 Zeichen"
                  value={value}
                  onChangeText={onChange}
                  isPassword
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Passwort bestätigen"
                  placeholder="Passwort wiederholen"
                  value={value}
                  onChangeText={onChange}
                  isPassword
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              title="Konto erstellen"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Typography variant="bodySmall" color={colors.textSecondary}>
              Bereits ein Konto?{' '}
            </Typography>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Typography variant="bodySmall" color={colors.primary} weight="semibold">
                Anmelden
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GdprConsentModal
        visible={showGdpr}
        onAccept={handleGdprAccept}
        onDecline={handleGdprDecline}
      />
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  form: { gap: spacing.xs },
  submitBtn: { marginTop: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
