import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { colors, spacing, borderRadius } from '../../theme';

interface GdprConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const GdprConsentModal: React.FC<GdprConsentModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
          </View>
          <Typography variant="h2" align="center" style={styles.title}>
            Datenschutz & Einwilligung
          </Typography>
          <Typography variant="bodySmall" align="center" color={colors.textSecondary}>
            Bitte lies dir unsere Datenschutzerklärung durch und stimme zu, bevor du die App nutzt.
          </Typography>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <DataSection
            icon="location"
            title="Standortdaten"
            text="Wir erfassen deinen GPS-Standort ausschließlich während aktiver Fahrten. Die Daten werden verschlüsselt gespeichert und nicht an Dritte weitergegeben."
          />
          <DataSection
            icon="car"
            title="Fahrtdaten"
            text="Startort, Zielort, Strecke, Dauer und Fahrtzweck werden gespeichert, um dir eine vollständige Fahrtdokumentation bereitzustellen."
          />
          <DataSection
            icon="person"
            title="Nutzerdaten"
            text="Name, Geburtsdatum, Kennzeichen und E-Mail werden für dein Konto benötigt. Dein Passwort wird sicher gehashed gespeichert."
          />
          <DataSection
            icon="trash"
            title="Datenlöschung (DSGVO Art. 17)"
            text="Du kannst alle deine Daten jederzeit unter Profil → Konto löschen vollständig und unwiderruflich entfernen."
          />

          <TouchableOpacity
            onPress={() => Linking.openURL('https://yourapp.com/privacy')}
            style={styles.privacyLink}
          >
            <Ionicons name="open-outline" size={16} color={colors.primary} />
            <Typography variant="bodySmall" color={colors.primary} style={styles.linkText}>
              Vollständige Datenschutzerklärung lesen
            </Typography>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title="Zustimmen & Fortfahren"
            onPress={onAccept}
            variant="primary"
            size="lg"
            style={styles.acceptBtn}
          />
          <Button
            title="Ablehnen"
            onPress={onDecline}
            variant="ghost"
            size="md"
          />
          <Typography variant="caption" align="center" style={styles.legalNote}>
            Durch die Zustimmung erklärst du dich mit der Verarbeitung deiner
            Daten gemäß unserer Datenschutzerklärung einverstanden.
          </Typography>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const DataSection: React.FC<{ icon: string; title: string; text: string }> = ({
  icon, title, text,
}) => (
  <View style={styles.section}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon as never} size={20} color={colors.primary} />
    </View>
    <View style={styles.sectionText}>
      <Typography variant="body" weight="semibold" style={styles.sectionTitle}>
        {title}
      </Typography>
      <Typography variant="bodySmall">{text}</Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  section: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionText: { flex: 1 },
  sectionTitle: { marginBottom: spacing.xs },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  linkText: { marginLeft: 4 },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  acceptBtn: { width: '100%' },
  legalNote: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
