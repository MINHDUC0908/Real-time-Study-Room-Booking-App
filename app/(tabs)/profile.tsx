import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingStore } from '../../src/stores/useBookingStore';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/theme';

export default function ProfileScreen () {
    const insets = useSafeAreaInsets();
    const { user, setUser, bookings } = useBookingStore();
    const [editMode, setEditMode] = useState(false);
    const [nameInput, setNameInput] = useState(user?.name ?? '');

    const totalBookings = bookings.filter((b) => b.userId === user?.id).length;
    const activeBookings = bookings.filter(
        (b) => b.userId === user?.id && b.status === 'confirmed'
    ).length;
    const checkedIn = bookings.filter(
        (b) => b.userId === user?.id && b.status === 'checked-in'
    ).length;

    const handleSaveName = () => {
        if (!nameInput.trim()) {
            Alert.alert('Lỗi', 'Tên không được để trống');
            return;
        }
        if (user) {
            setUser({ ...user, name: nameInput.trim() });
        }
        setEditMode(false);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingBottom: insets.bottom + SPACING.xxxl },
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Avatar section */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </Text>
                </View>

                {editMode ? (
                    <View style={styles.editNameRow}>
                        <TextInput
                            style={styles.nameInput}
                            value={nameInput}
                            onChangeText={setNameInput}
                            autoFocus
                            placeholder="Nhập tên..."
                            placeholderTextColor={COLORS.textMuted}
                        />
                        <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                            <MaterialCommunityIcons name="check" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => setEditMode(true)}
                        style={styles.nameRow}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.userName}>{user?.name ?? 'Sinh viên'}</Text>
                        <MaterialCommunityIcons
                            name="pencil-outline"
                            size={18}
                            color={COLORS.textMuted}
                        />
                    </TouchableOpacity>
                )}

                <Text style={styles.studentId}>MSSV: {user?.studentId ?? 'N/A'}</Text>
            </View>

            {/* Thống kê */}
            <View style={styles.statsCard}>
                <Text style={styles.sectionTitle}>Thống kê sử dụng</Text>
                <View style={styles.statsRow}>
                    <StatItem label="Tổng đặt phòng" value={totalBookings} />
                    <View style={styles.divider} />
                    <StatItem label="Đang đặt" value={activeBookings} color={COLORS.primary} />
                    <View style={styles.divider} />
                    <StatItem label="Đã check-in" value={checkedIn} color={COLORS.success} />
                </View>
            </View>

            {/* Thông tin ứng dụng */}
            <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Về ứng dụng</Text>
                <InfoRow icon="school-outline" label="Trường" value="VKU - Đại học CNTT&TT Việt Hàn" />
                <InfoRow icon="map-marker-outline" label="Địa chỉ" value="470 Trần Đại Nghĩa, Đà Nẵng" />
                <InfoRow icon="code-tags" label="Phiên bản" value="1.0.0 (MVP)" />
                <InfoRow icon="shield-lock-outline" label="Bảo mật" value="Dữ liệu lưu cục bộ" />
            </View>

            {/* Lưu ý sử dụng */}
            <View style={styles.noteCard}>
                <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary} />
                <Text style={styles.noteText}>
                    Đây là bản demo học thuật. Dữ liệu đặt phòng được lưu cục bộ trên thiết bị và
                    sẽ không đồng bộ với hệ thống thật của trường VKU.
                </Text>
            </View>
        </ScrollView>
    );
}

const StatItem = ({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color?: string;
}) => (
    <View style={statStyles.item}>
        <Text style={[statStyles.value, color ? { color } : {}]}>{value}</Text>
        <Text style={statStyles.label}>{label}</Text>
    </View>
);

const InfoRow = ({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) => (
    <View style={infoStyles.row}>
        <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.textMuted} />
        <View style={infoStyles.content}>
            <Text style={infoStyles.label}>{label}</Text>
            <Text style={infoStyles.value}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.lg,
        gap: SPACING.lg,
    },
    avatarSection: {
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.xl,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        borderWidth: 3,
        borderColor: COLORS.primary + '50',
    },
    avatarText: {
        fontSize: 36,
        color: '#fff',
        fontWeight: FONT_WEIGHT.bold,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    userName: {
        fontSize: FONT_SIZE.xxl,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
    },
    studentId: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
    },
    editNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    nameInput: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
        color: COLORS.textPrimary,
        fontSize: FONT_SIZE.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        minWidth: 200,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
    },
    statsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.border,
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.sm,
    },
    noteCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary + '15',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        gap: SPACING.md,
        alignItems: 'flex-start',
    },
    noteText: {
        flex: 1,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});

const statStyles = StyleSheet.create({
    item: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    value: {
        fontSize: FONT_SIZE.xxl,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
    },
    label: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
});

const infoStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.medium,
    },
});
