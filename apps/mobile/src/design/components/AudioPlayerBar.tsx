import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react-native';
import { triggerHaptic } from '../../services/haptics';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../tokens';

export interface AudioPlayerBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart?: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  progressPercent: number; // 0 to 100
  currentTimeFormatted?: string;
  durationFormatted?: string;
  isSticky?: boolean;
  title?: string;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  onPlayPause,
  onRestart,
  speed,
  onChangeSpeed,
  progressPercent,
  currentTimeFormatted = '0:00',
  durationFormatted = '1:30',
  isSticky = false,
  title = 'Listen to Spoken Explanation',
}) => {
  const speeds = [0.75, 1.0, 1.25];

  const handleNextSpeed = () => {
    triggerHaptic('impactLight');
    const idx = speeds.indexOf(speed);
    const nextIdx = (idx + 1) % speeds.length;
    onChangeSpeed(speeds[nextIdx]);
  };

  const handlePlayPause = () => {
    triggerHaptic('impactMedium');
    onPlayPause();
  };

  return (
    <View
      style={[
        styles.container,
        isSticky ? styles.stickyContainer : styles.cardContainer,
      ]}
      accessible={true}
      accessibilityRole="toolbar"
      accessibilityLabel={`Audio Player. ${isPlaying ? 'Playing' : 'Paused'}. Progress ${Math.round(progressPercent)}%`}
    >
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Volume2 size={18} color={COLORS.primary} strokeWidth={2.5} style={styles.iconSpeaker} />
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Speed Selector Button */}
        <Pressable
          onPress={handleNextSpeed}
          style={styles.speedButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Playback speed ${speed} times. Tap to change.`}
        >
          <Text style={styles.speedText}>{speed}x</Text>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progressPercent))}%` }]} />
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{currentTimeFormatted}</Text>
        <Text style={styles.timeText}>{durationFormatted}</Text>
      </View>

      {/* Large Controls Row */}
      <View style={styles.controlsRow}>
        {onRestart && (
          <Pressable
            onPress={() => {
              triggerHaptic('impactLight');
              onRestart();
            }}
            style={styles.restartButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Restart audio from beginning"
          >
            <RotateCcw size={20} color={COLORS.textSecondary} />
          </Pressable>
        )}

        <Pressable
          onPress={handlePlayPause}
          style={[styles.bigPlayButton, isPlaying && styles.bigPlayButtonActive]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause spoken explanation' : 'Play spoken explanation'}
        >
          {isPlaying ? (
            <Pause size={24} color={COLORS.textInverse} strokeWidth={2.5} />
          ) : (
            <Play size={24} color={COLORS.textInverse} strokeWidth={2.5} style={{ marginLeft: 3 }} />
          )}
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause Audio' : 'Listen Now'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    marginBottom: SPACING.lg,
  },
  stickyContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconSpeaker: {
    marginRight: SPACING.xs + 2,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  speedButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  restartButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: MIN_TOUCH_TARGET / 2,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.pill,
    minHeight: MIN_TOUCH_TARGET,
    flex: 1,
  },
  bigPlayButtonActive: {
    backgroundColor: COLORS.primaryDark,
  },
  playButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
});

