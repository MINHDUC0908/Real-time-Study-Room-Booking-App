import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ListRenderItemInfo,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoomCard from '../../src/components/RoomCard';
import FilterChip from '../../src/components/FilterChip';
import { Room, Equipment } from '../../src/types/room';
import { useFilterStore } from '../../src/stores/useFilterStore';
import { MOCK_ROOMS } from '../../src/data/mockRooms';
import { filterRooms } from '../../src/services/roomService';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, ROOM_CARD_HEIGHT } from '../../src/constants/theme';

const BUILDINGS: Array<'A' | 'B' | 'C' | 'V'> = ['A', 'B', 'C', 'V'];
const EQUIPMENT_OPTIONS: Array<{ key: Equipment; label: string }> = [
    { key: 'projector', label: 'Máy chiếu' },
    { key: 'whiteboard', label: 'Bảng trắng' },
    { key: 'high-spec-pc', label: 'PC cao cấp' },
    { key: 'ac', label: 'Điều hòa' },
];

// Margin giữa các card = SPACING.sm * 2 (trên + dưới)
const ITEM_HEIGHT = ROOM_CARD_HEIGHT + SPACING.sm * 2;

export default function RoomDiscoveryScreen () {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        filter,
        setSearchQuery,
        toggleBuilding,
        toggleEquipment,
        resetFilter,
        hasActiveFilter,
    } = useFilterStore();

    const [showFilter, setShowFilter] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Danh sách đã lọc — memo để tránh tính toán lại khi render không liên quan
    const filteredRooms = useMemo(
        () => filterRooms(MOCK_ROOMS, filter),
        [filter]
    );

    // Handler navigate vào chi tiết phòng
    const handlePressRoom = useCallback ((room: Room) => {
        router.push(`/room/${room.id}`);
    }, [router]);

    // renderItem bọc useCallback — tránh tạo closure mới mỗi render
    const renderItem = useCallback(({ item }: ListRenderItemInfo<Room>) => (
        <RoomCard room={item} onPress={handlePressRoom} />
    ), [handlePressRoom]);

    // keyExtractor
    const keyExtractor = useCallback ((item: Room) => item.id, []);

    // getItemLayout — tối ưu FlatList vì chiều cao cố định
    const getItemLayout = useCallback (
        (_: ArrayLike<Room> | null | undefined, index: number) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
        }),
        []
    );

    // Debounce search input 300ms
    const handleSearchChange = useCallback ((text: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setSearchQuery(text);
        }, 300);
    }, [setSearchQuery]);

    const activeFilter = hasActiveFilter();

    return (
        <View style={[styles.container, { paddingTop: insets.top > 0 ? 0 : SPACING.sm }]}>
            {/* Thanh tìm kiếm */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons
                        name="magnify"
                        size={20}
                        color={COLORS.textMuted}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm phòng, tòa nhà..."
                        placeholderTextColor={COLORS.textMuted}
                        defaultValue={filter.searchQuery}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setShowFilter(!showFilter)}
                    style={[styles.filterButton, activeFilter && styles.filterButtonActive]}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons
                        name="tune-variant"
                        size={22}
                        color={activeFilter ? COLORS.primary : COLORS.textSecondary}
                    />
                    {activeFilter && <View style={styles.filterDot} />}
                </TouchableOpacity>
            </View>

            {/* Panel Filter */}
            {showFilter && (
                <View style={styles.filterPanel}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Filter tòa nhà */}
                        <Text style={styles.filterLabel}>Tòa nhà</Text>
                        <View style={styles.chipRow}>
                            {BUILDINGS.map((b) => (
                                <FilterChip
                                    key={b}
                                    label={`Tòa ${b}`}
                                    selected={filter.building.includes(b)}
                                    onPress={() => toggleBuilding(b)}
                                />
                            ))}
                        </View>

                        {/* Filter thiết bị */}
                        <Text style={styles.filterLabel}>Thiết bị</Text>
                        <View style={styles.chipRow}>
                            {EQUIPMENT_OPTIONS.map((eq) => (
                                <FilterChip
                                    key={eq.key}
                                    label={eq.label}
                                    selected={filter.equipment.includes(eq.key)}
                                    onPress={() => toggleEquipment(eq.key)}
                                />
                            ))}
                        </View>

                        {/* Nút reset */}
                        {activeFilter && (
                            <TouchableOpacity
                                onPress={resetFilter}
                                style={styles.resetButton}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons
                                    name="refresh"
                                    size={16}
                                    color={COLORS.error}
                                />
                                <Text style={styles.resetText}>Xóa bộ lọc</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            )}

            {/* Header kết quả */}
            <View style={styles.resultHeader}>
                <Text style={styles.resultCount}>
                    {filteredRooms.length} phòng{activeFilter ? ' (đã lọc)' : ''}
                </Text>
                <Text style={styles.availableCount}>
                    {filteredRooms.filter((r) => r.status === 'available').length} còn trống
                </Text>
            </View>

            {/* Danh sách phòng */}
            <FlatList
                data={filteredRooms}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialNumToRender={6}
                windowSize={5}
                maxToRenderPerBatch={8}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + SPACING.lg },
                ]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="magnify-close"
                            size={60}
                            color={COLORS.textDisabled}
                        />
                        <Text style={styles.emptyText}>Không tìm thấy phòng phù hợp</Text>
                        <TouchableOpacity onPress={resetFilter} style={styles.resetButton}>
                            <Text style={styles.resetText}>Xóa bộ lọc</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        height: 46,
        elevation: 1,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: FONT_SIZE.md,
    },
    filterButton: {
        width: 46,
        height: 46,
        backgroundColor: '#FFFFFF',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    filterButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#EFF6FF',
    },
    filterDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: COLORS.primary,
    },
    filterPanel: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        maxHeight: 260,
        elevation: 4,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    filterLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.semibold,
        marginBottom: SPACING.sm,
        marginTop: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
    },
    resultCount: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
    },
    availableCount: {
        color: COLORS.success,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
    },
    listContent: {
        paddingTop: SPACING.xs,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: SPACING.xxxl * 2,
        gap: SPACING.lg,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.md,
        textAlign: 'center',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.error + '15',
        borderWidth: 1,
        borderColor: COLORS.error + '40',
    },
    resetText: {
        color: COLORS.error,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.medium,
    },
});
