import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  User,
  Upload,
  CheckCircle,
  FileText,
  Building2,
  AlertCircle,
  FileCheck,
} from 'lucide-react-native';
import { pick } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppointmentItem, TimeSlot } from '@reportsaathi/shared';
import { Button, Card, StatusChip } from '../design/components';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../design/tokens';
import { apiService } from '../services/api';
import { triggerHaptic } from '../services/haptics';
import { scheduleAppointmentReminder } from '../services/notifications';
import { MOBILE_CONFIG } from '../config';

export const BookAppointmentScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const linkedReportId = route?.params?.linkedReportId;

  const [activeView, setActiveView] = useState<'BOOK' | 'MY_APPOINTMENTS'>('BOOK');
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const hospital = MOBILE_CONFIG.hospital;
  const [selectedDept, setSelectedDept] = useState(hospital.departments[0]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Patient Info
  const [patientName, setPatientName] = useState('Kush Kumar Gupta');
  const [patientAge, setPatientAge] = useState('45');
  const [patientPhone, setPatientPhone] = useState('9876543210');
  const [selectedDocType, setSelectedDocType] = useState(hospital.acceptedDocumentTypes[0].id);

  // Uploaded Document
  const [uploadedDoc, setUploadedDoc] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  // Booking result
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // User's past appointments list
  const [myAppointments, setMyAppointments] = useState<AppointmentItem[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Fetch slots when date or department changes
  useEffect(() => {
    fetchSlots();
  }, [selectedDate, selectedDept.id]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const data = await apiService.getAppointmentSlots(selectedDate);
      setSlots(data.slots || []);
      const firstAvailable = data.slots.find((s: TimeSlot) => s.available);
      if (firstAvailable) {
        setSelectedSlot(firstAvailable.time);
      }
    } catch (e) {
      console.warn('Failed to load slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchMyAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const data = await apiService.getAppointments();
      setMyAppointments(data.appointments || []);
    } catch (e) {
      console.warn('Failed to load appointments:', e);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handlePickDocument = async () => {
    triggerHaptic('impactLight');
    try {
      const result = await pick({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
      });
      if (result && result[0]) {
        const doc = result[0];
        setUploadedDoc({
          uri: doc.uri,
          name: doc.name || 'document.pdf',
          type: doc.type || 'application/pdf',
        });
      }
    } catch (e) {
      // Fallback to image library if document picker cancelled
      try {
        const img = await launchImageLibrary({ mediaType: 'photo' });
        if (img.assets && img.assets[0]) {
          const a = img.assets[0];
          setUploadedDoc({
            uri: a.uri || '',
            name: a.fileName || 'photo_id.jpg',
            type: a.type || 'image/jpeg',
          });
        }
      } catch (err) {
        // ignore
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!uploadedDoc) {
      Alert.alert('Document Required', 'Please upload a valid ID or medical report to proceed.');
      return;
    }

    setSubmitting(true);
    triggerHaptic('impactMedium');

    const formData = new FormData();
    formData.append('departmentId', selectedDept.id);
    formData.append('departmentName', selectedDept.name);
    formData.append('date', selectedDate);
    formData.append('timeSlot', selectedSlot);
    formData.append('patientName', patientName);
    formData.append('patientAge', patientAge);
    formData.append('patientPhone', patientPhone);
    formData.append('documentType', selectedDocType);
    if (linkedReportId) {
      formData.append('linkedReportId', linkedReportId);
    }

    formData.append('file', {
      uri: uploadedDoc.uri,
      name: uploadedDoc.name,
      type: uploadedDoc.type,
    } as any);

    try {
      const booking = await apiService.bookAppointment(formData);
      setConfirmedBooking(booking);
      setStep(5); // Confirmation screen
      triggerHaptic('notificationSuccess');

      // Schedule local notification reminder for the evening before
      await scheduleAppointmentReminder(
        booking.bookingRef,
        hospital.name,
        selectedDept.name,
        selectedDate,
        selectedSlot
      );
    } catch (err: any) {
      triggerHaptic('notificationError');
      Alert.alert(
        'Booking Failed',
        err?.response?.data?.message || 'Slot may have just been booked. Please pick another time.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header & Hospital Info */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('appointments.title')}</Text>
          <View style={styles.hospitalRow}>
            <Building2 size={16} color={COLORS.primary} />
            <Text style={styles.hospitalName}>{hospital.name}</Text>
          </View>
        </View>

        {/* View Switcher: Book vs My Appointments */}
        <View style={styles.tabBar}>
          <Pressable
            onPress={() => {
              triggerHaptic('impactLight');
              setActiveView('BOOK');
            }}
            style={[styles.tabButton, activeView === 'BOOK' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeView === 'BOOK' && styles.tabTextActive]}>
              Book Slot
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              triggerHaptic('impactLight');
              setActiveView('MY_APPOINTMENTS');
              fetchMyAppointments();
            }}
            style={[styles.tabButton, activeView === 'MY_APPOINTMENTS' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeView === 'MY_APPOINTMENTS' && styles.tabTextActive]}>
              {t('appointments.myAppointments')}
            </Text>
          </Pressable>
        </View>

        {activeView === 'BOOK' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {step === 1 && (
              <View>
                <Text style={styles.stepTitle}>Step 1: Choose Department</Text>
                <Text style={styles.stepSubtitle}>Select clinical specialty for consultation</Text>

                {hospital.departments.map((dept) => {
                  const isSelected = selectedDept.id === dept.id;
                  return (
                    <Pressable
                      key={dept.id}
                      onPress={() => {
                        triggerHaptic('impactLight');
                        setSelectedDept(dept);
                      }}
                      style={[styles.selectionCard, isSelected && styles.selectionCardActive]}
                    >
                      <View style={styles.cardTextCol}>
                        <Text style={[styles.selectionTitle, isSelected && styles.selectionTitleActive]}>
                          {dept.name}
                        </Text>
                        <Text style={styles.selectionDesc}>{dept.description}</Text>
                      </View>
                      {isSelected && <CheckCircle size={20} color={COLORS.primary} />}
                    </Pressable>
                  );
                })}

                <Button
                  label="Next: Select Date & Time"
                  onPress={() => setStep(2)}
                  style={{ marginTop: SPACING.md }}
                />
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.stepTitle}>Step 2: Date & Available Slot</Text>
                <Text style={styles.stepSubtitle}>Hospital Working Hours: {hospital.workingHours.start} - {hospital.workingHours.end}</Text>

                <View style={styles.dateSelectorRow}>
                  <Text style={styles.dateSelectorLabel}>Appointment Date:</Text>
                  <Text style={styles.dateSelectorValue}>{selectedDate}</Text>
                </View>

                <Text style={styles.slotHeading}>Available 30-Minute Slots:</Text>

                {loadingSlots ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
                ) : (
                  <View style={styles.slotsGrid}>
                    {slots.map((s) => {
                      const isSelected = selectedSlot === s.time;
                      return (
                        <Pressable
                          key={s.time}
                          disabled={!s.available}
                          onPress={() => {
                            triggerHaptic('impactLight');
                            setSelectedSlot(s.time);
                          }}
                          style={[
                            styles.slotPill,
                            isSelected && styles.slotPillSelected,
                            !s.available && styles.slotPillDisabled,
                          ]}
                        >
                          <Clock size={13} color={isSelected ? COLORS.textInverse : s.available ? COLORS.primary : COLORS.textMuted} />
                          <Text
                            style={[
                              styles.slotPillText,
                              isSelected && styles.slotPillTextSelected,
                              !s.available && styles.slotPillTextDisabled,
                            ]}
                          >
                            {s.time}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <View style={styles.buttonRow}>
                  <Button label="Back" variant="outline" onPress={() => setStep(1)} style={{ flex: 1 }} />
                  <Button
                    label="Next: Patient Details"
                    onPress={() => setStep(3)}
                    disabled={!selectedSlot}
                    style={{ flex: 2, marginLeft: SPACING.sm }}
                  />
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.stepTitle}>Step 3: Patient Information</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Patient Full Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Enter patient full name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Age (Years) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientAge}
                    onChangeText={setPatientAge}
                    keyboardType="number-pad"
                    placeholder="e.g. 45"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile Phone *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientPhone}
                    onChangeText={setPatientPhone}
                    keyboardType="phone-pad"
                    placeholder="10-digit mobile number"
                  />
                </View>

                <View style={styles.buttonRow}>
                  <Button label="Back" variant="outline" onPress={() => setStep(2)} style={{ flex: 1 }} />
                  <Button
                    label="Next: Document Upload"
                    onPress={() => setStep(4)}
                    disabled={!patientName || !patientPhone}
                    style={{ flex: 2, marginLeft: SPACING.sm }}
                  />
                </View>
              </View>
            )}

            {step === 4 && (
              <View>
                <Text style={styles.stepTitle}>Step 4: Upload Required Document</Text>
                <Text style={styles.stepSubtitle}>{t('appointments.docHelp')}</Text>

                <View style={styles.docTypeOptions}>
                  {hospital.acceptedDocumentTypes.map((dt) => {
                    const isSelected = selectedDocType === dt.id;
                    return (
                      <Pressable
                        key={dt.id}
                        onPress={() => {
                          triggerHaptic('impactLight');
                          setSelectedDocType(dt.id);
                        }}
                        style={[styles.docTypeChip, isSelected && styles.docTypeChipActive]}
                      >
                        <Text style={[styles.docTypeLabel, isSelected && styles.docTypeLabelActive]}>
                          {dt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Card style={styles.uploadBox}>
                  {uploadedDoc ? (
                    <View style={styles.uploadedDocInfo}>
                      <FileCheck size={36} color={COLORS.primary} />
                      <Text style={styles.uploadedFilename}>{uploadedDoc.name}</Text>
                      <Button
                        label="Change File"
                        variant="outline"
                        size="medium"
                        onPress={handlePickDocument}
                        style={{ marginTop: SPACING.sm }}
                      />
                    </View>
                  ) : (
                    <Pressable onPress={handlePickDocument} style={styles.uploadPrompt}>
                      <Upload size={36} color={COLORS.primary} />
                      <Text style={styles.uploadPromptTitle}>Attach Document (PDF or Photo)</Text>
                      <Text style={styles.uploadPromptSub}>Max 10 MB &bull; Clear and readable</Text>
                    </Pressable>
                  )}
                </Card>

                <View style={styles.buttonRow}>
                  <Button label="Back" variant="outline" onPress={() => setStep(3)} style={{ flex: 1 }} />
                  <Button
                    label="Confirm Booking"
                    onPress={handleConfirmBooking}
                    loading={submitting}
                    disabled={!uploadedDoc || submitting}
                    style={{ flex: 2, marginLeft: SPACING.sm }}
                  />
                </View>
              </View>
            )}

            {step === 5 && confirmedBooking && (
              <View style={styles.confirmationBox}>
                <View style={styles.successIconCircle}>
                  <CheckCircle size={52} color={COLORS.primary} />
                </View>
                <Text style={styles.successTitle}>Booking Submitted!</Text>
                <Text style={styles.successSubtitle}>
                  Your appointment request has been received by the hospital desk.
                </Text>

                <Card style={styles.receiptCard}>
                  <Text style={styles.receiptRefLabel}>Booking Reference Number</Text>
                  <Text style={styles.receiptRefValue}>{confirmedBooking.bookingRef}</Text>

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Hospital:</Text>
                    <Text style={styles.receiptVal}>{hospital.name}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Department:</Text>
                    <Text style={styles.receiptVal}>{selectedDept.name}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Date & Time:</Text>
                    <Text style={styles.receiptVal}>
                      {selectedDate} at {selectedSlot}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptField}>Status:</Text>
                    <StatusChip status="needs attention" customLabel="Pending Verification" />
                  </View>
                </Card>

                <Text style={styles.reminderNotice}>{t('appointments.reminderNote')}</Text>

                <Button
                  label="Done & Return to Home"
                  onPress={() => navigation.navigate('Home')}
                  style={{ width: '100%', marginTop: SPACING.lg }}
                />
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={myAppointments}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={loadingAppointments} onRefresh={fetchMyAppointments} colors={[COLORS.primary]} />
            }
            renderItem={({ item }) => (
              <Card style={styles.appointmentItemCard}>
                <View style={styles.appointmentItemHeader}>
                  <View>
                    <Text style={styles.appointmentRef}>{item.bookingRef}</Text>
                    <Text style={styles.appointmentDept}>{item.departmentName}</Text>
                  </View>
                  <StatusChip
                    status={item.status === 'CONFIRMED' ? 'normal' : item.status === 'REJECTED' ? 'urgent' : 'low'}
                    customLabel={item.status.replace('_', ' ')}
                  />
                </View>

                <View style={styles.appointmentItemDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{item.date} at {item.timeSlot}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <User size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{item.patientName}</Text>
                  </View>
                </View>

                {item.rejectionReason ? (
                  <View style={styles.rejectionBanner}>
                    <AlertCircle size={15} color="#991B1B" />
                    <Text style={styles.rejectionText}>Reason: {item.rejectionReason}</Text>
                  </View>
                ) : null}
              </Card>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !loadingAppointments ? (
                <View style={styles.emptyContainer}>
                  <Calendar size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>{t('appointments.noAppointments')}</Text>
                </View>
              ) : undefined
            }
          />
        )}
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
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderRadius: RADIUS.md - 2,
    minHeight: MIN_TOUCH_TARGET - 8,
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: SPACING.huge,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  selectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md + 2,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  selectionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  cardTextCol: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectionTitleActive: {
    color: COLORS.primaryDark,
  },
  selectionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  dateSelectorValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  slotHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    minHeight: 38,
  },
  slotPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotPillDisabled: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    opacity: 0.5,
  },
  slotPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  slotPillTextSelected: {
    color: COLORS.textInverse,
  },
  slotPillTextDisabled: {
    color: COLORS.textMuted,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    height: MIN_TOUCH_TARGET,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  docTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
  },
  docTypeChip: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docTypeChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  docTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  docTypeLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  uploadBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.primaryBorder,
    marginBottom: SPACING.md,
  },
  uploadPrompt: {
    alignItems: 'center',
  },
  uploadPromptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  uploadPromptSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  uploadedDocInfo: {
    alignItems: 'center',
  },
  uploadedFilename: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  confirmationBox: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  receiptCard: {
    width: '100%',
    padding: SPACING.lg,
  },
  receiptRefLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  receiptRefValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginBottom: SPACING.md,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  receiptField: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  receiptVal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reminderNotice: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  appointmentItemCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  appointmentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  appointmentRef: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  appointmentDept: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appointmentItemDetails: {
    gap: 4,
    marginTop: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  rejectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  rejectionText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
});

