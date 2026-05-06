import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth';
import { colors, spacing, borderRadius } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
  route: RouteProp<AuthStackParamList, 'VerifyEmail'>;
};

export const EmailVerifyScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  const resendEmail = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setSent(true);
    } catch (err: any) {
      Alert.alert('Fehler', err?.response?.data?.message ?? 'Erneutes Senden fehlgeschlagen.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={56} color={colors.primary} />
        </View>

        <Typography variant="h2" align="center" style={styles.title}>
          E-Mail bestätigen
        </Typography>

        <Typography variant="body" align="center" color={colors.textSecondary} style={styles.subtitle}>
          Wir haben eine Bestätigungs-E-Mail an{'\n'}
          <Typography variant="body" weight="semibold" color={colors.text}>
            {email}
          </Typography>{'\n'}
          gesendet. Bitte klicke auf den Link in der E-Mail.
        </Typography>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Typography variant="bodySmall" color={colors.textSecondary} style={styles.infoText}>
            Der Link ist 24 Stunden gültig. Prüfe auch deinen Spam-Ordner.
          </Typography>
        </View>

        {sent ? (
          <View style={styles.sentBox}>
            <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
            <Typography variant="bodySmall" color={colors.secondary} weight="medium">
              E-Mail wurde erneut gesendet
            </Typography>
          </View>
        ) : (
          <Button
            title="E-Mail erneut senden"
            onPress={resendEmail}
            loading={resending}
            variant="outline"
            style={styles.resendBtn}
          />
        )}

        <Button
          title="Zurück zur Anmeldung"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  iconContainer: {
    width: 112,
    height: 112,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginBottom: -spacing.sm },
  subtitle: { lineHeight: 24 },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  infoText: { flex: 1 },
  sentBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  resendBtn: { alignSelf: 'stretch' },
});
