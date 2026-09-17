import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Room, Equipment } from '../types/room';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ROOM_CARD_HEIGHT } from '../constants/theme';

interface RoomCardProps {
    room: Room;
    onPress: (room: Room) => void;
}

// Ánh xạ icon cho từng loại thiết bị
const EQUIPMENT_ICONS: Record<Equipment, { icon: string; label: string }> = {
    projector: { icon: 'projector', label: 'Máy chiếu' },
    whiteboard: { icon: 'draw', label: 'Bảng trắng' },
    'high-spec-pc': { icon: 'desktop-tower-monitor', label: 'PC cao cấp' },
    ac: { icon: 'air-conditioner', label: 'Điều hòa' },
};

// Màu badge tòa nhà
const BUILDING_COLORS: Record<string, string> = {
    A: COLORS.buildingA,
    B: COLORS.buildingB,
    C: COLORS.buildingC,
    V: COLORS.buildingV,
};

/**
 * RoomCard — component hiển thị thông tin tóm tắt một phòng.
 * Bọc React.memo để tránh re-render không cần thiết khi props không thay đổi.
 * Chiều cao cố định ROOM_CARD_HEIGHT để FlatList dùng được getItemLayout.
 */
const RoomCard = memo<RoomCardProps>(
    ({ room, onPress }) => {
        // useCallback để tránh tạo hàm mới mỗi lần render
        const handlePress = useCallback(() => {
            onPress(room);
        }, [room, onPress]);

        const isAvailable = room.status === 'available';
        const buildingColor = BUILDING_COLORS[room.building] ?? COLORS.primary;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={styles.container}
                accessibilityLabel={`Phòng ${room.name}, ${isAvailable ? 'Còn trống' : 'Đang sử dụng'}`}
            >
                {/* Ảnh phòng với badge */}
                <ImageBackground
                    source={{ uri: room.photoUrl }}
                    style={styles.image}
                    imageStyle={styles.imageStyle}
                    resizeMode="cover"
                >
                    <View style={styles.imageBadges}>
                        <View style={[styles.buildingBadge, { backgroundColor: buildingColor }]}>
                            <Text style={styles.buildingText}>Tòa {room.building}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: isAvailable ? COLORS.successLight : COLORS.errorLight }
                        ]}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: isAvailable ? COLORS.success : COLORS.error }
                            ]} />
                            <Text style={[
                                styles.statusText,
                                { color: isAvailable ? COLORS.success : COLORS.error }
                            ]}>
                                {isAvailable ? 'Còn trống' : 'Đang dùng'}
                            </Text>
                        </View>
                    </View>
                </ImageBackground>

                {/* Phần thông tin phòng phía dưới ảnh */}
                <View style={styles.contentSection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.roomName} numberOfLines={1}>
                            {room.name}
                        </Text>
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="office-building-marker-outline"
                                    size={14}
                                    color={COLORS.textSecondary}
                                />
                                <Text style={styles.metaText}>Tầng {room.floor}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="account-group-outline"
                                    size={14}
                                    color={COLORS.textSecondary}
                                />
                                <Text style={styles.metaText}>{room.capacity} chỗ</Text>
                            </View>
                        </View>
                    </View>

                    {/* Danh sách thiết bị */}
                    <View style={styles.equipmentRow}>
                        {room.equipment.slice(0, 4).map((eq) => {
                            const info = EQUIPMENT_ICONS[eq];
                            return (
                                <View key={eq} style={styles.equipmentChip}>
                                    <MaterialCommunityIcons
                                        name={info.icon as any}
                                        size={12}
                                        color={COLORS.primary}
                                    />
                                    <Text style={styles.equipmentText}>{info.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </TouchableOpacity>
        );
    },
    // Custom comparison — chỉ re-render nếu id hoặc status thay đổi
    (prevProps, nextProps) =>
        prevProps.room.id === nextProps.room.id &&
        prevProps.room.status === nextProps.room.status &&
        prevProps.onPress === nextProps.onPress
);

RoomCard.displayName = 'RoomCard';

export default RoomCard;

const styles = StyleSheet.create({
    container: {
        height: ROOM_CARD_HEIGHT,
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    image: {
        height: 120,
        width: '100%',
    },
    imageStyle: {
        borderTopLeftRadius: BORDER_RADIUS.lg - 1,
        borderTopRightRadius: BORDER_RADIUS.lg - 1,
    },
    imageBadges: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.sm,
    },
    buildingBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        elevation: 1,
    },
    buildingText: {
        color: '#fff',
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.semibold,
    },
    contentSection: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        justifyContent: 'space-between',
        flex: 1,
        backgroundColor: COLORS.surface,
    },
    titleRow: {
        gap: 2,
    },
    roomName: {
        color: COLORS.textPrimary,
        fontSize: FONT_SIZE.md + 1,
        fontWeight: FONT_WEIGHT.bold,
    },
    metaRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: 2,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.medium,
    },
    equipmentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginTop: 4,
    },
    equipmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
        gap: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    equipmentText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.xs - 1,
        fontWeight: FONT_WEIGHT.medium,
    },
});
