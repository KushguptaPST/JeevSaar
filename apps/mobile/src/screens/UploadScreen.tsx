import React, { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera, Image as ImageIcon, FileText, AlertTriangle, ArrowRight } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import { Button, Card } from '../design/components';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../design/tokens';
import { triggerHaptic } from '../services/haptics';

export const UploadScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
    size?: number;
    isPdf?: boolean;
  } | null>(null);

  const [showQualityWarning, setShowQualityWarning] = useState(false);

  const handleCamera = async () => {
    triggerHaptic('impactLight');
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri || '',
          name: asset.fileName || 'report_camera.jpg',
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
          isPdf: false,
        });
        // Check for low resolution or blurriness indicator
        if ((asset.width && asset.width < 800) || (asset.height && asset.height < 800)) {
          setShowQualityWarning(true);
        } else {
          setShowQualityWarning(false);
        }
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const handleGallery = async () => {
    triggerHaptic('impactLight');
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri || '',
          name: asset.fileName || 'report_gallery.jpg',
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
          isPdf: false,
        });
        setShowQualityWarning(false);
      }
    } catch (err) {
      console.warn('Gallery error:', err);
    }
  };

  const handlePickPdf = async () => {
    triggerHaptic('impactLight');
    try {
      const results = await pick({
        type: ['application/pdf'],
      });

      if (results && results[0]) {
        const doc = results[0];
        setSelectedFile({
          uri: doc.uri,
          name: doc.name || 'lab_report.pdf',
          type: 'application/pdf',
          size: doc.size ?? undefined,
          isPdf: true,
        });
        setShowQualityWarning(false);
      }
    } catch (err) {
      // User cancelled or fallback
      console.warn('Document picker notice:', err);
    }
  };

  const handleProceed = () => {
    if (!selectedFile) return;
    triggerHaptic('impactMedium');
    navigation.navigate('Processing', { file: selectedFile });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{t('upload.title')}</Text>
          <Text style={styles.subtitle}>{t('upload.subtitle')}</Text>

          {/* Three Selection Options */}
          <View style={styles.optionsGrid}>
            <Pressable
              onPress={handleCamera}
              style={styles.optionCard}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('upload.camera')}
            >
              <View style={styles.optionIconCircle}>
                <Camera size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.optionLabel}>{t('upload.camera')}</Text>
            </Pressable>

            <Pressable
              onPress={handleGallery}
              style={styles.optionCard}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('upload.gallery')}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <ImageIcon size={26} color="#0369A1" />
              </View>
              <Text style={styles.optionLabel}>{t('upload.gallery')}</Text>
            </Pressable>

            <Pressable
              onPress={handlePickPdf}
              style={styles.optionCard}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('upload.pdf')}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <FileText size={26} color="#B45309" />
              </View>
              <Text style={styles.optionLabel}>{t('upload.pdf')}</Text>
            </Pressable>
          </View>

          {/* Preview Card */}
          {selectedFile && (
            <Card style={styles.previewCard}>
              <Text style={styles.previewHeading}>{t('upload.previewTitle')}</Text>
              <Text style={styles.previewFilename}>{selectedFile.name}</Text>

              {selectedFile.isPdf ? (
                <View style={styles.pdfPreviewPlaceholder}>
                  <FileText size={48} color={COLORS.primary} />
                  <Text style={styles.pdfPreviewText}>PDF Document Ready</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: selectedFile.uri }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
              )}

              {showQualityWarning && (
                <View style={styles.warningBox}>
                  <AlertTriangle size={18} color="#B45309" />
                  <Text style={styles.warningText}>{t('upload.blurWarning')}</Text>
                </View>
              )}

              <Button
                label={t('upload.proceedButton')}
                onPress={handleProceed}
                variant="primary"
                icon={<ArrowRight size={20} color={COLORS.textInverse} />}
                iconPosition="right"
                style={{ marginTop: SPACING.md }}
              />
            </Card>
          )}
        </ScrollView>
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
  scrollContent: {
    paddingVertical: SPACING.xl,
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
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  optionsGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET + 16,
  },
  optionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  previewCard: {
    marginTop: SPACING.sm,
  },
  previewHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  previewFilename: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    marginBottom: SPACING.sm,
  },
  pdfPreviewPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pdfPreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginTop: SPACING.sm,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginTop: SPACING.xs,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: SPACING.xs + 2,
    flex: 1,
  },
});

