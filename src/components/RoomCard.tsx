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
                activeOpacity={0.85}
                onPress={handlePress}
                style={styles.container}
                accessibilityLabel={`Phòng ${room.name}, ${isAvailable ? 'Còn trống' : 'Đang sử dụng'}`}
            >
                <ImageBackground
                    source={{ uri: room.photoUrl }}
                    style={styles.image}
                    imageStyle={styles.imageStyle}
                    resizeMode="cover"
                >
                    {/* Gradient overlay */}
                    <View style={styles.overlay}>
                        {/* Header: tòa nhà + trạng thái */}
                        <View style={styles.header}>
                            <View style={[styles.buildingBadge, { backgroundColor: buildingColor }]}>
                                <Text style={styles.buildingText}>Tòa {room.building}</Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: isAvailable ? COLORS.success : COLORS.error }
                            ]}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>
                                    {isAvailable ? 'Còn trống' : 'Đang dùng'}
                                </Text>
                            </View>
                        </View>

                        {/* Tên phòng + tầng */}
                        <View style={styles.infoSection}>
                            <Text style={styles.roomName} numberOfLines={1}>
                                {room.name}
                            </Text>
                            <View style={styles.metaRow}>
                                {/* Tầng */}
                                <View style={styles.metaItem}>
                                    <MaterialCommunityIcons
                                        name="office-building-outline"
                                        size={14}
                                        color={COLORS.textSecondary}
                                    />
                                    <Text style={styles.metaText}>Tầng {room.floor}</Text>
                                </View>

                                {/* Sức chứa */}
                                <View style={styles.metaItem}>
                                    <MaterialCommunityIcons
                                        name="account-group-outline"
                                        size={14}
                                        color={COLORS.textSecondary}
                                    />
                                    <Text style={styles.metaText}>{room.capacity} chỗ</Text>
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
                                                color={COLORS.primaryLight}
                                            />
                                            <Text style={styles.equipmentText}>{info.label}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </ImageBackground>
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
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    image: {
        flex: 1,
    },
    imageStyle: {
        borderRadius: BORDER_RADIUS.lg,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(10, 20, 40, 0.65)',
        padding: SPACING.lg,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    buildingBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
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
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
        opacity: 0.9,
    },
    statusText: {
        color: '#fff',
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.semibold,
    },
    infoSection: {
        gap: SPACING.xs,
    },
    roomName: {
        color: COLORS.textPrimary,
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
    },
    metaRow: {
        flexDirection: 'row',
        gap: SPACING.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    metaText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
    },
    equipmentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginTop: SPACING.xs,
    },
    equipmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        gap: 3,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    equipmentText: {
        color: COLORS.primaryLight,
        fontSize: FONT_SIZE.xs,
    },
});
