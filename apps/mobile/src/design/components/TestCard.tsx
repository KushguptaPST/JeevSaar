import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronDown, ChevronUp, Volume2, ShieldAlert } from 'lucide-react-native';
import { TestExplanationItem } from '@reportsaathi/shared';
import { triggerHaptic } from '../../services/haptics';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../tokens';
import { StatusChip } from './StatusChip';

export interface TestCardProps {
  test: TestExplanationItem;
  onPlayAudioSnippet?: (test: TestExplanationItem) => void;
  isPlayingSnippet?: boolean;
}

export const TestCard: React.FC<TestCardProps> = ({
  test,
  onPlayAudioSnippet,
  isPlayingSnippet = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    triggerHaptic('impactLight');
    setExpanded(!expanded);
  };

  const displayName =
    test.name === test.nameEnglish || !test.nameEnglish
      ? test.name
      : `${test.name} (${test.nameEnglish})`;

  return (
    <View style={styles.card}>
      {/* Header Row: Test Name + Status Chip */}
      <View style={styles.headerRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.testName}>{displayName}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Your Result: </Text>
            <Text style={styles.valueHighlight}>
              {test.value} {test.unit}
            </Text>
          </View>
          {test.printedRange ? (
            <Text style={styles.rangeText}>
              Printed Range on Report: {test.printedRange} {test.unit}
            </Text>
          ) : null}
        </View>

        <View style={styles.chipWrapper}>
          <StatusChip status={test.status} />
        </View>
      </View>

      {/* Primary Plain-Language Explanation */}
      <View style={styles.explanationBox}>
        <Text style={styles.sectionHeading}>What this means in simple words:</Text>
        <Text style={styles.explanationText}>{test.whatYourResultMeans}</Text>
      </View>

      {/* Expandable Section: What it measures & General precautions */}
      {expanded && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>What this test measures:</Text>
            <Text style={styles.detailBody}>{test.whatItMeasures}</Text>
          </View>

          {test.generalPrecautions && test.generalPrecautions.length > 0 && (
            <View style={styles.detailSection}>
              <View style={styles.precautionsHeader}>
                <ShieldAlert size={15} color={COLORS.primary} />
                <Text style={styles.precautionsTitle}>General Precautions:</Text>
              </View>
              {test.generalPrecautions.map((p, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>&bull;</Text>
                  <Text style={styles.bulletText}>{p}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Action Footer: Play Audio Snippet + Expand / Collapse */}
      <View style={styles.footerRow}>
        {onPlayAudioSnippet && (
          <Pressable
            onPress={() => {
              triggerHaptic('impactLight');
              onPlayAudioSnippet(test);
            }}
            style={[styles.audioSnippetButton, isPlayingSnippet && styles.audioSnippetPlaying]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Listen to explanation for ${test.name}`}
          >
            <Volume2 size={16} color={isPlayingSnippet ? COLORS.textInverse : COLORS.primary} />
            <Text style={[styles.audioSnippetText, isPlayingSnippet && styles.audioSnippetTextPlaying]}>
              {isPlayingSnippet ? 'Playing' : 'Listen'}
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={toggleExpand}
          style={styles.expandButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less details' : 'Show more details'}
        >
          <Text style={styles.expandText}>{expanded ? 'Show less' : 'Details & precautions'}</Text>
          {expanded ? (
            <ChevronUp size={18} color={COLORS.primary} />
          ) : (
            <ChevronDown size={18} color={COLORS.primary} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  nameContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  testName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  valueLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  valueHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rangeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chipWrapper: {
    alignSelf: 'flex-start',
  },
  explanationBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  detailsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailSection: {
    marginBottom: SPACING.sm,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailBody: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  precautionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  precautionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
  },
  bulletDot: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 6,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.xs,
  },
  audioSnippetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    minHeight: 36,
  },
  audioSnippetPlaying: {
    backgroundColor: COLORS.primary,
  },
  audioSnippetText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  audioSnippetTextPlaying: {
    color: COLORS.textInverse,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: SPACING.xs,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 2,
  },
});

