import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TripFilters } from '../../components/trip/TripFilters';
import { exportService } from '../../services/export.service';
import { useAuthStore } from '../../store/authStore';
import { TripFilter, DateRange } from '../../types';
import { colors, spacing, borderRadius } from '../../theme';
import { format, subMonths, startOfMonth, startOfYear, endOfDay, startOfDay } from 'date-fns';

const getExportParams = (filter: TripFilter, custom?: DateRange) => {
  const now = new Date();
  switch (filter) {
    case 'month':
      return { from: format(startOfMonth(now), "yyyy-MM-dd'T'HH:mm:ss"), to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss") };
    case '3months':
      return { from: format(subMonths(now, 3), "yyyy-MM-dd'T'HH:mm:ss"), to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss") };
    case '6months':
      return { from: format(subMonths(now, 6), "yyyy-MM-dd'T'HH:mm:ss"), to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss") };
    case 'year':
      return { from: format(startOfYear(now), "yyyy-MM-dd'T'HH:mm:ss"), to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss") };
    case 'custom':
      if (!custom) return {};
      return { from: format(startOfDay(custom.from), "yyyy-MM-dd'T'HH:mm:ss"), to: format(endOfDay(custom.to), "yyyy-MM-dd'T'HH:mm:ss") };
    default:
      return {};
  }
};

export const ExportScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<TripFilter>('month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [emailAddress, setEmailAddress] = useState(user?.email ?? '');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const params = getExportParams(filter, customRange);

  const handleFilterChange = (f: TripFilter, range?: DateRange) => {
    setFilter(f);
    if (range) setCustomRange(range);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    const setter = format === 'pdf' ? setLoadingPdf : setLoadingCsv;
    setter(true);
    try {
      await exportService.downloadAndShare(format, params);
    } catch {
      Alert.alert('Fehler', 'Export fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setter(false);
    }
  };

  const handleEmailExport = async () => {
    if (!emailAddress.includes('@')) {
      Alert.alert('Ungültige E-Mail', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setLoadingEmail(true);
    try {
      await exportService.sendByEmail('pdf', emailAddress, params);
      Alert.alert('Gesendet ✓', `Der Export wurde an ${emailAddress} gesendet.`);
    } catch {
      Alert.alert('Fehler', 'E-Mail konnte nicht gesendet werden.');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Typography variant="h2" style={styles.title}>Export</Typography>
        <Typography variant="bodySmall" color={colors.textSecondary}>
          Exportiere deine Fahrtenliste als PDF oder CSV
        </Typography>

        {/* Date range filter */}
        <Card style={styles.card}>
          <Typography variant="h3" style={styles.sectionTitle}>Zeitraum</Typography>
          <TripFilters
            activeFilter={filter}
            customRange={customRange}
            onFilterChange={handleFilterChange}
          />
        </Card>

        {/* Export options */}
        <Card style={styles.card}>
          <Typography variant="h3" style={styles.sectionTitle}>Format</Typography>

          <ExportOption
            icon="document-text"
            color="#EF4444"
            title="PDF exportieren"
            subtitle="Fahrtenbuch als formatiertes PDF"
            onPress={() => handleExport('pdf')}
            loading={loadingPdf}
          />

          <View style={styles.separator} />

          <ExportOption
            icon="grid"
            color="#10B981"
            title="CSV exportieren"
            subtitle="Tabellendaten für Excel / Numbers"
            onPress={() => handleExport('csv')}
            loading={loadingCsv}
          />
        </Card>

        {/* Email export */}
        <Card style={styles.card}>
          <Typography variant="h3" style={styles.sectionTitle}>Per E-Mail senden</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary} style={styles.emailHint}>
            Der PDF-Export wird direkt an die angegebene Adresse gesendet.
          </Typography>

          <View style={styles.emailInput}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.emailField}
              placeholder="E-Mail-Adresse"
              placeholderTextColor={colors.textMuted}
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Button
            title="PDF senden"
            onPress={handleEmailExport}
            loading={loadingEmail}
            icon={<Ionicons name="send-outline" size={18} color={colors.textInverse} />}
            style={styles.sendBtn}
          />
        </Card>

        {/* What's included */}
        <Card style={styles.card}>
          <Typography variant="h3" style={styles.sectionTitle}>Enthaltene Felder</Typography>
          {EXPORT_FIELDS.map((f) => (
            <View key={f} style={styles.fieldRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
              <Typography variant="bodySmall">{f}</Typography>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const ExportOption: React.FC<{
  icon: string; color: string; title: string; subtitle: string;
  onPress: () => void; loading: boolean;
}> = ({ icon, color, title, subtitle, onPress, loading }) => (
  <Button
    title={title}
    onPress={onPress}
    loading={loading}
    variant="outline"
    style={styles.exportOptionBtn}
    textStyle={{ color: colors.text }}
    icon={
      <View style={[styles.exportIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as never} size={20} color={color} />
      </View>
    }
  />
);

const EXPORT_FIELDS = [
  'Name & Autokennzeichen',
  'Datum & Uhrzeit (Start/Stop)',
  'Startort & Zielort',
  'Gefahrene Kilometer',
  'Kürzeste Route (Google Maps)',
  'Fahrtdauer',
  'Fahrtzweck',
  'Notiz',
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { marginBottom: spacing.xs },
  card: { gap: spacing.sm },
  sectionTitle: { marginBottom: spacing.sm },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  emailHint: { marginBottom: spacing.sm },
  emailInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.sm,
  },
  emailField: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  sendBtn: { width: '100%' },
  exportOptionBtn: {
    justifyContent: 'flex-start',
    borderColor: colors.border,
  },
  exportIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: 3,
  },
});
