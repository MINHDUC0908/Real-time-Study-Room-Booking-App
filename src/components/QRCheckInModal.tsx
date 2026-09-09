import React, { memo, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Share,
    Platform,
    ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { Room } from '../types/room';
import { formatDateFull } from '../utils/dateHelpers';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

interface QRCheckInModalProps {
    visible: boolean;
    booking: Booking | null;
    room: Room | null;
    onClose: () => void;
    onViewBookings?: () => void;   // Điều hướng sang tab Đặt phòng của tôi
}

/**
 * QRCheckInModal — modal hiển thị mã QR check-in sau khi đặt phòng thành công.
 * Có nút chia sẻ, đóng modal, và điều hướng sang tab bookings.
 */
const QRCheckInModal = memo<QRCheckInModalProps>(({
    visible,
    booking,
    room,
    onClose,
    onViewBookings,
}) => {
    // Chia sẻ thông tin đặt phòng
    const handleShare = useCallback (async () => {
        if (!booking || !room) return;
        try {
            await Share.share({
                message: `[VKU Đặt Phòng] Phòng: ${room.name} | Ngày: ${formatDateFull(booking.date)} | Giờ: ${booking.slot.label} | Mã: ${booking.qrCode}`,
            });
        } catch (_) {
            // Bỏ qua lỗi share
        }
    }, [booking, room]);

    const handleViewBookings = useCallback(() => {
        onClose();
        onViewBookings?.();
    }, [onClose, onViewBookings]);

    if (!booking || !room) return null;

    const qrData = JSON.stringify({
        bookingId: booking.id,
        qrCode: booking.qrCode,
        roomId: booking.roomId,
        date: booking.date,
        slot: booking.slot.id,
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.successIcon}>
                            <MaterialCommunityIcons name="check-circle" size={32} color={COLORS.success} />
                        </View>
                        <Text style={styles.title}>Đặt phòng thành công!</Text>
                        <Text style={styles.subtitle}>Quét mã QR khi vào phòng</Text>
                    </View>

                    {/* QR Code */}
                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={qrData}
                            size={200}
                            color={COLORS.textPrimary}
                            backgroundColor={COLORS.surface}
                        />
                    </View>

                    {/* Thông tin đặt phòng */}
                    <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
                        <InfoRow icon="office-building-outline" label="Phòng" value={room.name} />
                        <InfoRow
                            icon="calendar-outline"
                            label="Ngày"
                            value={formatDateFull(booking.date)}
                        />
                        <InfoRow
                            icon="clock-outline"
                            label="Khung giờ"
                            value={booking.slot.label}
                        />
                        <InfoRow
                            icon="identifier"
                            label="Mã đặt phòng"
                            value={booking.qrCode.substring(0, 13).toUpperCase()}
                            valueStyle={{ color: COLORS.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}
                        />
                    </ScrollView>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            onPress={handleShare}
                            style={[styles.button, styles.buttonSecondary]}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="share-outline" size={18} color={COLORS.primary} />
                            <Text style={[styles.buttonText, { color: COLORS.primary }]}>Chia sẻ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleViewBookings}
                            style={[styles.button, styles.buttonPrimary]}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="calendar-check" size={18} color="#fff" />
                            <Text style={[styles.buttonText, { color: '#fff' }]}>Xem lịch đặt</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Nút đóng */}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                        <Text style={styles.closeText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
});

QRCheckInModal.displayName = 'QRCheckInModal';

// Sub-component nhỏ cho từng dòng thông tin
const InfoRow = ({
    icon,
    label,
    value,
    valueStyle,
}: {
    icon: string;
    label: string;
    value: string;
    valueStyle?: object;
}) => (
    <View style={infoStyles.row}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.textMuted} />
        <View style={infoStyles.content}>
            <Text style={infoStyles.label}>{label}</Text>
            <Text style={[infoStyles.value, valueStyle]}>{value}</Text>
        </View>
    </View>
);

export default QRCheckInModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xxl,
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        gap: SPACING.sm,
    },
    successIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.success + '22',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZE.xl,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    qrWrapper: {
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginBottom: SPACING.xl,
    },
    infoContainer: {
        width: '100%',
        maxHeight: 160,
        marginBottom: SPACING.lg,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        width: '100%',
        marginBottom: SPACING.md,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
    },
    buttonSecondary: {
        backgroundColor: COLORS.primary + '22',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    buttonText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
    },
    closeButton: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xl,
    },
    closeText: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.sm,
    },
});

const infoStyles = StyleSheet.create({
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
