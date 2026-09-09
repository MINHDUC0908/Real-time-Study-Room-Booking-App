import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ListRenderItemInfo,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingStore } from '../../src/stores/useBookingStore';
import { Booking } from '../../src/types/booking';
import { MOCK_ROOMS } from '../../src/data/mockRooms';
import { formatDateFull } from '../../src/utils/dateHelpers';
import QRCheckInModal from '../../src/components/QRCheckInModal';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/theme';

// Màu cho từng trạng thái booking
const STATUS_CONFIG = {
    confirmed: { color: COLORS.primary, label: 'Đã xác nhận', icon: 'calendar-check' },
    'checked-in': { color: COLORS.success, label: 'Đã check-in', icon: 'check-decagram' },
    cancelled: { color: COLORS.error, label: 'Đã hủy', icon: 'calendar-remove' },
    expired: { color: COLORS.textDisabled, label: 'Hết hạn', icon: 'calendar-clock' },
} as const;

export default function BookingsScreen () {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    // Dùng selector cụ thể (primitive/stable ref) để tránh getSnapshot infinite loop
    // React 18 useSyncExternalStore yêu cầu snapshot ổn định — không return new array trong selector
    const cancelBooking = useBookingStore((state) => state.cancelBooking);
    const allBookings = useBookingStore((state) => state.bookings);
    const userId = useBookingStore((state) => state.user?.id);

    const [qrVisible, setQrVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Tính derived data bằng useMemo — KHÔNG đặt logic filter/sort trong selector Zustand
    const myBookings = useMemo(() => {
        if (!userId) return [];
        return [...allBookings]
            .filter((b) => b.userId === userId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [userId, allBookings]);

    // Xem QR của một booking
    const handleViewQR = useCallback ((booking: Booking) => {
        setSelectedBooking(booking);
        setQrVisible(true);
    }, []);

    // Xác nhận hủy booking
    const handleCancel = useCallback ((booking: Booking) => {
        const room = MOCK_ROOMS.find((r) => r.id === booking.roomId);
        Alert.alert(
            'Hủy đặt phòng',
            `Bạn có chắc muốn hủy đặt phòng ${room?.name ?? booking.roomId} lúc ${booking.slot.label}?`,
            [
                { text: 'Giữ lại', style: 'cancel' },
                {
                    text: 'Hủy đặt phòng',
                    style: 'destructive',
                    onPress: () => cancelBooking(booking.id),
                },
            ]
        );
    }, [cancelBooking]);

    // Refresh kéo xuống (mock — chỉ delay nhỏ)
    const handleRefresh = useCallback (async () => {
        setRefreshing(true);
        await new Promise((r) => setTimeout(r, 600));
        setRefreshing(false);
    }, []);

    const renderItem = useCallback (({ item }: ListRenderItemInfo<Booking>) => {
        const room = MOCK_ROOMS.find((r) => r.id === item.roomId);
        const statusConf = STATUS_CONFIG[item.status];
        const canCancel = item.status === 'confirmed';
        const canViewQR = item.status === 'confirmed' || item.status === 'checked-in';

        return (
            <View style={styles.bookingCard}>
                {/* Status bar bên trái */}
                <View style={[styles.statusBar, { backgroundColor: statusConf.color }]} />

                <View style={styles.cardContent}>
                    {/* Header: tên phòng + badge trạng thái */}
                    <View style={styles.cardHeader}>
                        <View style={styles.roomInfo}>
                            <MaterialCommunityIcons
                                name="door-open"
                                size={18}
                                color={COLORS.primary}
                            />
                            <Text style={styles.roomName} numberOfLines={1}>
                                {room?.name ?? item.roomId}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusConf.color + '22' }]}>
                            <MaterialCommunityIcons
                                name={statusConf.icon as any}
                                size={12}
                                color={statusConf.color}
                            />
                            <Text style={[styles.statusText, { color: statusConf.color }]}>
                                {statusConf.label}
                            </Text>
                        </View>
                    </View>

                    {/* Ngày + giờ */}
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons
                            name="calendar-outline"
                            size={15}
                            color={COLORS.textMuted}
                        />
                        <Text style={styles.infoText}>{formatDateFull(item.date)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons
                            name="clock-outline"
                            size={15}
                            color={COLORS.textMuted}
                        />
                        <Text style={styles.infoText}>{item.slot.label}</Text>
                    </View>

                    {/* Action buttons */}
                    {(canViewQR || canCancel) && (
                        <View style={styles.actionRow}>
                            {canViewQR && (
                                <TouchableOpacity
                                    onPress={() => handleViewQR(item)}
                                    style={[styles.actionBtn, styles.qrBtn]}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons
                                        name="qrcode"
                                        size={16}
                                        color={COLORS.primary}
                                    />
                                    <Text style={[styles.actionText, { color: COLORS.primary }]}>
                                        Xem QR
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {canCancel && (
                                <TouchableOpacity
                                    onPress={() => handleCancel(item)}
                                    style={[styles.actionBtn, styles.cancelBtn]}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons
                                        name="close-circle-outline"
                                        size={16}
                                        color={COLORS.error}
                                    />
                                    <Text style={[styles.actionText, { color: COLORS.error }]}>
                                        Hủy
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    }, [handleViewQR, handleCancel]);

    const selectedRoom = selectedBooking
        ? MOCK_ROOMS.find((r) => r.id === selectedBooking.roomId) ?? null
        : null;

    return (
        <View style={[styles.container, { paddingTop: insets.top > 0 ? 0 : SPACING.sm }]}>
            {/* Summary stats */}
            <View style={styles.statsRow}>
                <StatCard
                    label="Đang đặt"
                    value={myBookings.filter((b) => b.status === 'confirmed').length}
                    color={COLORS.primary}
                />
                <StatCard
                    label="Đã check-in"
                    value={myBookings.filter((b) => b.status === 'checked-in').length}
                    color={COLORS.success}
                />
                <StatCard
                    label="Đã hủy"
                    value={myBookings.filter((b) => b.status === 'cancelled').length}
                    color={COLORS.error}
                />
            </View>

            <FlatList
                data={myBookings}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + SPACING.lg },
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="calendar-blank-outline"
                            size={72}
                            color={COLORS.textDisabled}
                        />
                        <Text style={styles.emptyTitle}>Chưa có lịch đặt phòng</Text>
                        <Text style={styles.emptySubtitle}>
                            Tìm và đặt phòng học tại tab "Tìm phòng"
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            style={styles.goSearchBtn}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.goSearchText}>Tìm phòng ngay</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* QR Modal */}
            <QRCheckInModal
                visible={qrVisible}
                booking={selectedBooking}
                room={selectedRoom}
                onClose={() => setQrVisible(false)}
            />
        </View>
    );
}

// Sub-component thống kê nhỏ
const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={[statStyles.card, { borderColor: color + '40' }]}>
        <Text style={[statStyles.value, { color }]}>{value}</Text>
        <Text style={statStyles.label}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    bookingCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusBar: {
        width: 4,
    },
    cardContent: {
        flex: 1,
        padding: SPACING.lg,
        gap: SPACING.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roomInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flex: 1,
    },
    roomName: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.semibold,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
    },
    actionRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    qrBtn: {
        backgroundColor: COLORS.primary + '15',
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    cancelBtn: {
        backgroundColor: COLORS.error + '15',
        borderWidth: 1,
        borderColor: COLORS.error + '40',
    },
    actionText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.medium,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: SPACING.xxxl,
        gap: SPACING.lg,
        marginTop: SPACING.xxxl,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.xl,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
    },
    emptySubtitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    goSearchBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xxl,
        borderRadius: BORDER_RADIUS.md,
    },
    goSearchText: {
        color: '#fff',
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold,
    },
});

const statStyles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1.5,
    },
    value: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
    },
    label: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        marginTop: 2,
    },
});
