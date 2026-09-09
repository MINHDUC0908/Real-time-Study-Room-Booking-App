import React, { memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import { getNext7Days } from '../utils/dateHelpers';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

interface DateSelectorProps {
    selectedDate: string;   // "YYYY-MM-DD"
    onDateChange: (date: string) => void;
}

// Lấy 7 ngày từ hôm nay một lần (memo ngoài component)
const DAYS = getNext7Days();

/**
 * DateSelector — thanh chọn ngày ngang, hiển thị 7 ngày.
 * Dùng FlatList horizontal để smooth scroll.
 */
const DateSelector = memo<DateSelectorProps>(({ selectedDate, onDateChange }) => {
    return (
        <FlatList
            horizontal
            data={DAYS}
            keyExtractor={(item) => item.date}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
                const isSelected = item.date === selectedDate;
                return (
                    <TouchableOpacity
                        onPress={() => onDateChange(item.date)}
                        style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                            {item.label}
                        </Text>
                        <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                            {item.dayNum}
                        </Text>
                        <Text style={[styles.monthLabel, isSelected && styles.monthLabelSelected]}>
                            {item.monthLabel}
                        </Text>
                        {isSelected && <View style={styles.selectedDot} />}
                    </TouchableOpacity>
                );
            }}
        />
    );
});

DateSelector.displayName = 'DateSelector';

export default DateSelector;

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    dayItem: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        minWidth: 64,
        gap: 2,
    },
    dayItemSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    dayLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.medium,
    },
    dayLabelSelected: {
        color: 'rgba(255,255,255,0.85)',
    },
    dayNum: {
        fontSize: FONT_SIZE.xl,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
    },
    dayNumSelected: {
        color: '#fff',
    },
    monthLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
    },
    monthLabelSelected: {
        color: 'rgba(255,255,255,0.75)',
    },
    selectedDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#fff',
        marginTop: 2,
    },
});
