import { create } from 'zustand';
import { RoomFilter, DEFAULT_FILTER } from '../types/filter';

/**
 * Store cho bộ lọc danh sách phòng.
 * Không persist — reset mỗi lần mở app (theo yêu cầu).
 * Tách khỏi useBookingStore để gọn và dễ mở rộng.
 */
interface FilterState {
    filter: RoomFilter;

    // Cập nhật từng trường filter riêng lẻ
    setSearchQuery: (query: string) => void;
    toggleBuilding: (building: 'A' | 'B' | 'C' | 'V') => void;
    setCapacityRange: (min: number, max: number) => void;
    toggleEquipment: (equipment: RoomFilter['equipment'][number]) => void;

    // Reset toàn bộ filter về mặc định
    resetFilter: () => void;

    // Kiểm tra có đang apply filter không (để hiển thị badge)
    hasActiveFilter: () => boolean;
}

export const useFilterStore = create<FilterState>()((set, get) => ({
    filter: { ...DEFAULT_FILTER },

    // Cập nhật text tìm kiếm
    setSearchQuery: (query) =>
        set((state) => ({ filter: { ...state.filter, searchQuery: query } })),

    // Toggle chọn/bỏ chọn tòa nhà
    toggleBuilding: (building) =>
        set((state) => {
            const current = state.filter.building;
            const updated = current.includes(building)
                ? current.filter((b) => b !== building)
                : [...current, building];
            return { filter: { ...state.filter, building: updated } };
        }),

    // Cập nhật khoảng sức chứa
    setCapacityRange: (min, max) =>
        set((state) => ({ filter: { ...state.filter, capacityMin: min, capacityMax: max } })),

    // Toggle chọn/bỏ chọn thiết bị
    toggleEquipment: (equipment) =>
        set((state) => {
            const current = state.filter.equipment;
            const updated = current.includes(equipment)
                ? current.filter((e) => e !== equipment)
                : [...current, equipment];
            return { filter: { ...state.filter, equipment: updated } };
        }),

    // Reset filter về mặc định
    resetFilter: () => set({ filter: { ...DEFAULT_FILTER } }),

    // Kiểm tra filter có khác mặc định không
    hasActiveFilter: () => {
        const { filter } = get();
        return (
            filter.searchQuery.trim() !== '' ||
            filter.building.length > 0 ||
            filter.equipment.length > 0 ||
            filter.capacityMin !== DEFAULT_FILTER.capacityMin ||
            filter.capacityMax !== DEFAULT_FILTER.capacityMax
        );
    },
}));
