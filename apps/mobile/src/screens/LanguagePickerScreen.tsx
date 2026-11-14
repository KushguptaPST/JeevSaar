import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Volume2, Check } from 'lucide-react-native';
import { LANGUAGE_LIST, LanguageInfo, SupportedLanguage } from '@reportsaathi/shared';
import { Button } from '../design/components';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../design/tokens';
import { triggerHaptic } from '../services/haptics';
import { useAppStore } from '../store/useAppStore';

export const LanguagePickerScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { language, setLanguage, isFirstLaunch, completeFirstLaunch } = useAppStore();
  const isFromSettings = route?.params?.fromSettings;

  const handleSelectLanguage = (langCode: SupportedLanguage) => {
    triggerHaptic('impactLight');
    setLanguage(langCode);
  };

  const handleContinue = () => {
    triggerHaptic('impactMedium');
    if (isFromSettings) {
      navigation.goBack();
    } else {
      completeFirstLaunch();
      navigation.navigate('Consent');
    }
  };

  const renderLanguageCard = ({ item }: { item: LanguageInfo }) => {
    const isSelected = language === item.code;

    return (
      <Pressable
        onPress={() => handleSelectLanguage(item.code)}
        style={[styles.langCard, isSelected && styles.langCardSelected]}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${item.nativeName}, ${item.nameEnglish}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.scriptBadge}>
            <Text style={styles.scriptText}>{item.scriptName}</Text>
          </View>
          <View style={styles.speakerIcon}>
            <Volume2 size={20} color={isSelected ? COLORS.primary : COLORS.textMuted} />
          </View>
        </View>

        <Text style={[styles.nativeText, isSelected && styles.nativeTextSelected]}>
          {item.nativeName}
        </Text>
        <Text style={styles.englishText}>{item.nameEnglish}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.greetingSample} numberOfLines={1}>
            {item.sampleGreeting}
          </Text>
          {isSelected && (
            <View style={styles.checkCircle}>
              <Check size={14} color={COLORS.textInverse} strokeWidth={3} />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('languagePicker.title')}</Text>
          <Text style={styles.subtitle}>{t('languagePicker.subtitle')}</Text>
        </View>

        <FlatList
          data={LANGUAGE_LIST}
          keyExtractor={(item) => item.code}
          renderItem={renderLanguageCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomBar}>
          <Button
            label={t('languagePicker.selectAndContinue')}
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  langCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: MIN_TOUCH_TARGET * 1.8,
  },
  langCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  scriptBadge: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  scriptText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  speakerIcon: {
    padding: 2,
  },
  nativeText: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  nativeTextSelected: {
    color: COLORS.primaryDark,
  },
  englishText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.xs,
  },
  greetingSample: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: SPACING.sm,
    fontStyle: 'italic',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

