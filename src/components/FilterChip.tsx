import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

interface FilterChipProps {
    label: string;
    selected: boolean;
    onPress: () => void;
    color?: string;    // Màu accent tùy chỉnh (mặc định = primary)
    style?: ViewStyle;
}

/**
 * FilterChip — chip nhỏ dùng cho filter tòa nhà, thiết bị.
 * Có animation highlight khi selected.
 */
const FilterChip = memo<FilterChipProps>(({ label, selected, onPress, color, style }) => {
    const accentColor = color ?? COLORS.primary;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.chip,
                selected && {
                    backgroundColor: accentColor + '33',  // 20% opacity
                    borderColor: accentColor,
                },
                style,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
        >
            <Text style={[
                styles.label,
                selected && { color: accentColor, fontWeight: FONT_WEIGHT.semibold },
            ]}>
                {selected ? '✓ ' : ''}{label}
            </Text>
        </TouchableOpacity>
    );
});

FilterChip.displayName = 'FilterChip';

export default FilterChip;

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs + 2,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        marginRight: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },
});
