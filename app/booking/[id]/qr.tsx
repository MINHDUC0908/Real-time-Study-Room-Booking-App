import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Share,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingStore } from '../../../src/stores/useBookingStore';
import { MOCK_ROOMS } from '../../../src/data/mockRooms';
import { formatDateFull } from '../../../src/utils/dateHelpers';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../../src/constants/theme';

/**
 * Màn hình QR check-in dạng full-screen modal.
 * Truy cập qua route /booking/[id]/qr
 */
export default function QRScreen () {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { bookings } = useBookingStore();

    // Tìm booking theo ID
    const booking = useMemo(
        () => bookings.find((b) => b.id === id) ?? null,
        [bookings, id]
    );
    const room = useMemo(
        () => (booking ? MOCK_ROOMS.find((r) => r.id === booking.roomId) ?? null : null),
        [booking]
    );

    const handleShare = async () => {
        if (!booking || !room) return;
        await Share.share({
            message: `[VKU] Phòng: ${room.name} | ${formatDateFull(booking.date)} | ${booking.slot.label} | Mã: ${booking.qrCode.substring(0, 13).toUpperCase()}`,
        });
    };

    if (!booking || !room) {
        return (
            <View style={styles.notFound}>
                <MaterialCommunityIcons name="alert" size={48} color={COLORS.error} />
                <Text style={styles.notFoundText}>Không tìm thấy booking</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const qrData = JSON.stringify({
        bookingId: booking.id,
        qrCode: booking.qrCode,
        roomId: booking.roomId,
        date: booking.date,
        slot: booking.slot.id,
    });

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.lg },
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.successBadge}>
                    <MaterialCommunityIcons name="check-circle" size={28} color={COLORS.success} />
                </View>
                <Text style={styles.title}>Mã QR Check-in</Text>
                <Text style={styles.subtitle}>Xuất trình mã này khi vào phòng</Text>
            </View>

            {/* QR Code */}
            <View style={styles.qrCard}>
                <QRCode
                    value={qrData}
                    size={220}
                    color={COLORS.textPrimary}
                    backgroundColor={COLORS.surface}
                />
                <Text style={styles.bookingCode}>
                    {booking.qrCode.substring(0, 13).toUpperCase()}
                </Text>
            </View>

            {/* Thông tin */}
            <View style={styles.infoCard}>
                <InfoRow icon="door-open" label="Phòng" value={room.name} />
                <InfoRow icon="office-building-outline" label="Tòa nhà" value={`Tòa ${room.building}`} />
                <InfoRow icon="calendar-outline" label="Ngày" value={formatDateFull(booking.date)} />
                <InfoRow icon="clock-outline" label="Khung giờ" value={booking.slot.label} />
                <InfoRow
                    icon="check-decagram-outline"
                    label="Trạng thái"
                    value={booking.status === 'confirmed' ? 'Đã xác nhận' : 'Đã check-in'}
                    valueColor={booking.status === 'confirmed' ? COLORS.primary : COLORS.success}
                />
            </View>

            {/* Actions */}
            <TouchableOpacity
                onPress={handleShare}
                style={styles.shareBtn}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="share-variant-outline" size={20} color={COLORS.primary} />
                <Text style={styles.shareBtnText}>Chia sẻ thông tin</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.closeBtn}
                activeOpacity={0.8}
            >
                <Text style={styles.closeBtnText}>Đóng</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const InfoRow = ({
    icon,
    label,
    value,
    valueColor,
}: {
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
}) => (
    <View style={infoRowStyles.row}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.textMuted} />
        <View style={infoRowStyles.content}>
            <Text style={infoRowStyles.label}>{label}</Text>
            <Text style={[infoRowStyles.value, valueColor ? { color: valueColor } : {}]}>
                {value}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        alignItems: 'center',
        padding: SPACING.lg,
        gap: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        gap: SPACING.sm,
    },
    successBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    qrCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        gap: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        width: '100%',
        elevation: 3,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
    },
    bookingCode: {
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        fontSize: FONT_SIZE.lg,
        color: COLORS.textSecondary,
        letterSpacing: 2,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        width: '100%',
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xxl,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: COLORS.primary,
        width: '100%',
        justifyContent: 'center',
    },
    shareBtnText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold,
    },
    closeBtn: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xl,
    },
    closeBtnText: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.sm,
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
    backBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.md,
    },
    backBtnText: {
        color: '#fff',
        fontWeight: FONT_WEIGHT.semibold,
    },
});

const infoRowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    value: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.medium,
    },
});
