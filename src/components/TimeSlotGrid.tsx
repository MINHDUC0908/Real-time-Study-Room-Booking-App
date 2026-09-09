import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TIME_SLOTS } from '../utils/timeSlot';
import { TimeSlot } from '../types/booking';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

interface TimeSlotGridProps {
    roomId: string;
    date: string;
    selectedSlotId: string | null;
    bookedSlotIds: string[];      // Danh sách slot đã bị đặt
    onSelectSlot: (slot: TimeSlot) => void;
    isLoading?: boolean;
}

/**
 * TimeSlotGrid — hiển thị grid khung giờ, đánh dấu đã đặt/còn trống/đang chọn.
 */
const TimeSlotGrid = memo<TimeSlotGridProps>(({
    bookedSlotIds,
    selectedSlotId,
    onSelectSlot,
    isLoading,
}) => {
    const handlePress = useCallback((slot: TimeSlot) => {
        onSelectSlot(slot);
    }, [onSelectSlot]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={styles.loadingText}>Đang kiểm tra lịch...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
            <View style={styles.grid}>
                {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedSlotIds.includes(slot.id);
                    const isSelected = selectedSlotId === slot.id;

                    return (
                        <TouchableOpacity
                            key={slot.id}
                            onPress={() => !isBooked && handlePress(slot)}
                            disabled={isBooked}
                            activeOpacity={isBooked ? 1 : 0.7}
                            style={[
                                styles.slotCard,
                                isBooked && styles.slotBooked,
                                isSelected && styles.slotSelected,
                            ]}
                            accessibilityLabel={`${slot.label}, ${isBooked ? 'Đã đặt' : 'Còn trống'}`}
                            accessibilityState={{ disabled: isBooked, selected: isSelected }}
                        >
                            {/* Icon trạng thái */}
                            <View style={styles.slotIconWrapper}>
                                {isBooked ? (
                                    <MaterialCommunityIcons
                                        name="lock-outline"
                                        size={18}
                                        color={COLORS.textDisabled}
                                    />
                                ) : isSelected ? (
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={18}
                                        color="#fff"
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={18}
                                        color={COLORS.primary}
                                    />
                                )}
                            </View>

                            {/* Thời gian */}
                            <Text style={[
                                styles.slotTime,
                                isBooked && styles.slotTimeBooked,
                                isSelected && styles.slotTimeSelected,
                            ]}>
                                {slot.label}
                            </Text>

                            {/* Label trạng thái */}
                            <Text style={[
                                styles.slotStatus,
                                isBooked && styles.slotStatusBooked,
                                isSelected && styles.slotStatusSelected,
                            ]}>
                                {isBooked ? 'Đã đặt' : isSelected ? 'Đang chọn' : 'Còn trống'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
});

TimeSlotGrid.displayName = 'TimeSlotGrid';

export default TimeSlotGrid;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
        marginBottom: SPACING.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    slotCard: {
        width: '47%',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        padding: SPACING.md,
        alignItems: 'center',
        gap: SPACING.xs,
    },
    slotBooked: {
        backgroundColor: COLORS.slotDisabled,
        borderColor: COLORS.border,
        opacity: 0.6,
    },
    slotSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    slotIconWrapper: {
        marginBottom: 2,
    },
    slotTime: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
        textAlign: 'center',
    },
    slotTimeBooked: {
        color: COLORS.textDisabled,
    },
    slotTimeSelected: {
        color: '#fff',
    },
    slotStatus: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.success,
    },
    slotStatusBooked: {
        color: COLORS.textDisabled,
    },
    slotStatusSelected: {
        color: 'rgba(255,255,255,0.85)',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: SPACING.xxxl,
        gap: SPACING.md,
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
    },
});
