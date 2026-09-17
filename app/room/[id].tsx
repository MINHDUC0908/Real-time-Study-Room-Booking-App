import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_ROOMS } from '../../src/data/mockRooms';
import { useBookingStore } from '../../src/stores/useBookingStore';
import DateSelector from '../../src/components/DateSelector';
import TimeSlotGrid from '../../src/components/TimeSlotGrid';
import QRCheckInModal from '../../src/components/QRCheckInModal';
import { TimeSlot } from '../../src/types/booking';
import { Room, Equipment } from '../../src/types/room';
import { getBookedSlotIds } from '../../src/utils/timeSlot';
import { formatDateISO } from '../../src/utils/dateHelpers';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/theme';

// Nhãn hiển thị cho từng loại thiết bị
const EQUIPMENT_LABELS: Record<Equipment, string> = {
    projector: 'Máy chiếu',
    whiteboard: 'Bảng trắng',
    'high-spec-pc': 'PC cao cấp',
    ac: 'Điều hòa',
};

const EQUIPMENT_ICONS: Record<Equipment, string> = {
    projector: 'projector',
    whiteboard: 'draw',
    'high-spec-pc': 'desktop-tower-monitor',
    ac: 'air-conditioner',
};

export default function RoomDetailScreen () {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Tìm phòng theo ID
    const room = useMemo(() => MOCK_ROOMS.find((r) => r.id === id) ?? null, [id]);

    const { bookings, createBooking } = useBookingStore();

    // State chọn ngày + slot
    const [selectedDate, setSelectedDate] = useState<string>(formatDateISO(new Date()));
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [isBooking, setIsBooking] = useState(false);

    // QR modal state
    const [qrVisible, setQrVisible] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

    // Tính danh sách slot đã đặt cho phòng + ngày hiện tại (memo)
    const bookedSlotIds = useMemo(
        () => getBookedSlotIds(id ?? '', selectedDate, bookings),
        [id, selectedDate, bookings]
    );

    // Xử lý đặt phòng
    const handleBooking = useCallback (async () => {
        if (!selectedSlot || !room) return;

        setIsBooking(true);
        try {
            // Gọi store — đã có double-check conflict bên trong
            const result = await createBooking(room.id, selectedDate, selectedSlot);

            if (result.success && result.booking) {
                setConfirmedBooking(result.booking);
                setQrVisible(true);
                setSelectedSlot(null);  // Reset selection sau khi đặt thành công
            } else {
                Alert.alert(
                    '⚠️ Không thể đặt phòng',
                    result.error ?? 'Đã xảy ra lỗi, vui lòng thử lại.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsBooking(false);
        }
    }, [selectedSlot, room, selectedDate, createBooking]);

    // Điều hướng về tab bookings sau khi xem QR
    const handleViewBookings = useCallback (() => {
        router.push('/(tabs)/bookings');
    }, [router]);

    if (!room) {
        return (
            <View style={styles.notFound}>
                <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={60}
                    color={COLORS.error}
                />
                <Text style={styles.notFoundText}>Không tìm thấy phòng</Text>
            </View>
        );
    }

    const isAvailable = room.status === 'available';

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
                showsVerticalScrollIndicator={false}
            >
                {/* Ảnh phòng */}
                <Image
                    source={{ uri: room.photoUrl }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

                {/* Overlay thông tin cơ bản */}
                <View style={styles.heroOverlay}>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: isAvailable ? COLORS.success : COLORS.error }
                    ]}>
                        <Text style={styles.statusText}>
                            {isAvailable ? '● Còn trống' : '● Đang dùng'}
                        </Text>
                    </View>
                </View>

                {/* Thông tin phòng */}
                <View style={styles.infoSection}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomDesc}>{room.description}</Text>

                    {/* Metadata chips */}
                    <View style={styles.metaRow}>
                        <MetaChip icon="office-building-outline" label={`Tòa ${room.building}`} />
                        <MetaChip icon="stairs" label={`Tầng ${room.floor}`} />
                        <MetaChip icon="account-group-outline" label={`${room.capacity} chỗ`} />
                    </View>

                    {/* Thiết bị */}
                    <Text style={styles.sectionTitle}>Thiết bị</Text>
                    <View style={styles.equipmentGrid}>
                        {room.equipment.map((eq) => (
                            <View key={eq} style={styles.equipmentItem}>
                                <MaterialCommunityIcons
                                    name={EQUIPMENT_ICONS[eq] as any}
                                    size={22}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.equipmentLabel}>
                                    {EQUIPMENT_LABELS[eq]}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Chỉ hiển thị bộ chọn ngày/giờ nếu phòng còn trống */}
                {isAvailable ? (
                    <>
                        {/* Chọn ngày */}
                        <Text style={styles.sectionTitlePadded}>Chọn ngày</Text>
                        <DateSelector
                            selectedDate={selectedDate}
                            onDateChange={(date) => {
                                setSelectedDate(date);
                                setSelectedSlot(null); // Reset slot khi đổi ngày
                            }}
                        />

                        {/* Grid khung giờ */}
                        <View style={{ marginTop: SPACING.lg }}>
                            <TimeSlotGrid
                                roomId={room.id}
                                date={selectedDate}
                                selectedSlotId={selectedSlot?.id ?? null}
                                bookedSlotIds={bookedSlotIds}
                                onSelectSlot={setSelectedSlot}
                            />
                        </View>
                    </>
                ) : (
                    <View style={styles.occupiedBanner}>
                        <MaterialCommunityIcons
                            name="lock-clock"
                            size={32}
                            color={COLORS.error}
                        />
                        <Text style={styles.occupiedText}>
                            Phòng này hiện đang được sử dụng.{'\n'}Vui lòng quay lại sau.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Nút đặt phòng cố định ở dưới */}
            {isAvailable && (
                <View style={[styles.bookingBar, { paddingBottom: insets.bottom + SPACING.md }]}>
                    {selectedSlot ? (
                        <View style={styles.selectedSlotInfo}>
                            <Text style={styles.selectedSlotLabel}>Đã chọn:</Text>
                            <Text style={styles.selectedSlotTime}>{selectedSlot.label}</Text>
                        </View>
                    ) : (
                        <Text style={styles.noSlotText}>Chọn khung giờ để đặt phòng</Text>
                    )}
                    <TouchableOpacity
                        onPress={handleBooking}
                        disabled={!selectedSlot || isBooking}
                        activeOpacity={0.85}
                        style={[
                            styles.bookBtn,
                            (!selectedSlot || isBooking) && styles.bookBtnDisabled,
                        ]}
                    >
                        {isBooking ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.bookBtnText}>Đặt phòng</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* QR Modal sau khi đặt thành công */}
            <QRCheckInModal
                visible={qrVisible}
                booking={confirmedBooking}
                room={room}
                onClose={() => setQrVisible(false)}
                onViewBookings={handleViewBookings}
            />
        </>
    );
}

// Chip metadata nhỏ
const MetaChip = ({ icon, label }: { icon: string; label: string }) => (
    <View style={metaStyles.chip}>
        <MaterialCommunityIcons name={icon as any} size={15} color={COLORS.textSecondary} />
        <Text style={metaStyles.label}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    heroImage: {
        width: '100%',
        height: 220,
    },
    heroOverlay: {
        position: 'absolute',
        top: SPACING.lg,
        right: SPACING.lg,
    },
    statusBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    statusText: {
        color: '#fff',
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
    },
    infoSection: {
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    roomName: {
        fontSize: FONT_SIZE.xxxl,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
    },
    roomDesc: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
        marginTop: SPACING.sm,
    },
    sectionTitlePadded: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    equipmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    equipmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    equipmentLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    occupiedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error + '15',
        borderWidth: 1,
        borderColor: COLORS.error + '40',
        borderRadius: BORDER_RADIUS.lg,
        margin: SPACING.lg,
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    occupiedText: {
        flex: 1,
        color: COLORS.error,
        fontSize: FONT_SIZE.sm,
        lineHeight: 22,
    },
    bookingBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        gap: SPACING.md,
        elevation: 8,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    selectedSlotInfo: {
        flex: 1,
    },
    selectedSlotLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
    },
    selectedSlotTime: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.semibold,
    },
    noSlotText: {
        flex: 1,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
    },
    bookBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xxl,
        borderRadius: BORDER_RADIUS.md,
        minWidth: 120,
        alignItems: 'center',
    },
    bookBtnDisabled: {
        backgroundColor: COLORS.textDisabled,
    },
    bookBtnText: {
        color: '#fff',
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold,
    },
    notFound: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.lg,
    },
    notFoundText: {
        fontSize: FONT_SIZE.xl,
        color: COLORS.textSecondary,
    },
});

const metaStyles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        gap: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
});
