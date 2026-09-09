import { Equipment } from './room';

// Bộ lọc danh sách phòng
export interface RoomFilter {
    searchQuery: string;
    building: ('A' | 'B' | 'C' | 'V')[];   // Tòa nhà được chọn (rỗng = tất cả)
    capacityMin: number;                      // Sức chứa tối thiểu
    capacityMax: number;                      // Sức chứa tối đa
    equipment: Equipment[];                   // Thiết bị yêu cầu (AND logic)
}

// Giá trị mặc định cho filter
export const DEFAULT_FILTER: RoomFilter = {
    searchQuery: '',
    building: [],
    capacityMin: 2,
    capacityMax: 50,
    equipment: [],
};
