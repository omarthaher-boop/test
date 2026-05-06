import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../api/user';
import { biometricService } from '../../services/biometric.service';
import { colors, spacing, borderRadius } from '../../theme';
import { formatBirthDate } from '../../utils/formatters';

const schema = z.object({
  name: z.string().min(2, 'Mindestens 2 Zeichen'),
  licensePlate: z.string().min(2).max(12),
});

type FormData = z.infer<typeof schema>;

export const ProfileScreen: React.FC = () => {
  const { user, setUser, logout, biometricEnabled, setBiometricEnabled } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    biometricService.isAvailable().then(setBiometricAvailable);
  }, []);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      licensePlate: user?.licensePlate ?? '',
    },
  });

  const saveProfile = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await userApi.updateMe({
        name: data.name,
        licensePlate: data.licensePlate.toUpperCase(),
      });
      setUser(res.data.data);
      setEditing(false);
    } catch {
      Alert.alert('Fehler', 'Profil konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    reset({ name: user?.name ?? '', licensePlate: user?.licensePlate ?? '' });
    setEditing(false);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const success = await biometricService.authenticate('Biometrie aktivieren');
      if (!success) return;
    }
    setBiometricEnabled(value);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Konto löschen',
      'Alle deine Daten (Fahrten, Profil, Standortdaten) werden unwiderruflich gelöscht (DSGVO Art. 17). Bist du sicher?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Konto löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await userApi.deleteMe();
              await logout();
            } catch {
              Alert.alert('Fehler', 'Konto konnte nicht gelöscht werden.');
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant="h2" style={styles.pageTitle}>Profil</Typography>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Typography variant="h2" color={colors.primary}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Typography>
          </View>
          <Typography variant="h3">{user?.name}</Typography>
          <View style={styles.emailRow}>
            <Ionicons
              name={user?.emailVerified ? 'checkmark-circle' : 'alert-circle'}
              size={16}
              color={user?.emailVerified ? colors.secondary : colors.warning}
            />
            <Typography variant="bodySmall" color={colors.textSecondary}>{user?.email}</Typography>
          </View>
        </View>

        {/* Profile Info / Edit */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Typography variant="h3">Persönliche Daten</Typography>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Ionicons name="pencil-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Name"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                    error={errors.name?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="licensePlate"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Autokennzeichen"
                    value={value}
                    onChangeText={(t) => onChange(t.toUpperCase())}
                    autoCapitalize="characters"
                    error={errors.licensePlate?.message}
                  />
                )}
              />
              <View style={styles.editActions}>
                <Button title="Abbrechen" onPress={cancelEdit} variant="ghost" size="sm" style={styles.halfBtn} />
                <Button title="Speichern" onPress={handleSubmit(saveProfile)} loading={saving} size="sm" style={styles.halfBtn} />
              </View>
            </>
          ) : (
            <>
              <ProfileField label="Name" value={user?.name ?? '—'} />
              <ProfileField label="Geburtsdatum" value={user?.birthDate ? formatBirthDate(user.birthDate) : '—'} />
              <ProfileField label="Kennzeichen" value={user?.licensePlate ?? '—'} />
              <ProfileField label="E-Mail" value={user?.email ?? '—'} />
            </>
          )}
        </Card>

        {/* Security */}
        <Card style={styles.card}>
          <Typography variant="h3" style={styles.cardTitle}>Sicherheit</Typography>
          {biometricAvailable && (
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
                <View>
                  <Typography variant="body" weight="medium">Biometrie</Typography>
                  <Typography variant="caption" color={colors.textMuted}>Face ID / Fingerabdruck</Typography>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={biometricEnabled ? colors.primary : colors.textMuted}
              />
            </View>
          )}
          <SettingButton
            icon="lock-closed-outline"
            label="Passwort ändern"
            onPress={() => Alert.alert('Info', 'Passwort-Änderung per E-Mail senden.')}
          />
        </Card>

        {/* Actions */}
        <Card style={styles.card}>
          <Typography variant="h3" style={styles.cardTitle}>Aktionen</Typography>
          <SettingButton icon="log-out-outline" label="Abmelden" onPress={handleLogout} color={colors.warning} />
          <SettingButton icon="trash-outline" label="Konto & Daten löschen (DSGVO)" onPress={handleDeleteAccount} color={colors.danger} />
        </Card>

        <Typography variant="caption" align="center" style={styles.version}>
          TripTracker v1.0.0 · DSGVO-konform
        </Typography>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.field}>
    <Typography variant="caption" color={colors.textMuted}>{label}</Typography>
    <Typography variant="body" weight="medium">{value}</Typography>
  </View>
);

const SettingButton: React.FC<{ icon: string; label: string; onPress: () => void; color?: string }> = ({
  icon, label, onPress, color,
}) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.settingLeft}>
      <Ionicons name={icon as never} size={20} color={color ?? colors.text} />
      <Typography variant="body" color={color ?? colors.text}>{label}</Typography>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  pageTitle: { marginBottom: spacing.xs },
  avatarSection: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  card: { gap: spacing.sm },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: { marginBottom: spacing.sm },
  field: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  editActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  halfBtn: { flex: 1 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  version: { marginTop: spacing.xl },
});
