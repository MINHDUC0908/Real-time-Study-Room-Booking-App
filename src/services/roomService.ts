import { Room } from '../types/room';
import { RoomFilter } from '../types/filter';
import { MOCK_ROOMS } from '../data/mockRooms';

/**
 * Service layer cho dữ liệu phòng.
 * Hiện dùng mock local — có thể swap sang REST API
 * bằng cách thay phần thân hàm mà không đổi interface.
 */

// Lấy tất cả phòng (có thể thêm pagination sau)
export async function fetchAllRooms (): Promise<Room[]> {
    // Mô phỏng latency mạng nhỏ
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_ROOMS;
}

// Lấy thông tin chi tiết một phòng theo ID
export async function fetchRoomById (id: string): Promise<Room | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return MOCK_ROOMS.find((r) => r.id === id) ?? null;
}

/**
 * Lọc danh sách phòng theo bộ filter (pure function, dùng cho useMemo).
 * Áp dụng AND logic: phòng phải thỏa TẤT CẢ điều kiện.
 */
export function filterRooms (rooms: Room[], filter: RoomFilter): Room[] {
    return rooms.filter((room) => {
        // 1. Tìm kiếm theo tên (case-insensitive)
        if (filter.searchQuery.trim()) {
            const query = filter.searchQuery.toLowerCase();
            const nameMatch = room.name.toLowerCase().includes(query);
            const buildingMatch = room.building.toLowerCase().includes(query);
            if (!nameMatch && !buildingMatch) return false;
        }

        // 2. Lọc theo tòa nhà (nếu có chọn)
        if (filter.building.length > 0) {
            if (!filter.building.includes(room.building)) return false;
        }

        // 3. Lọc theo sức chứa
        if (room.capacity < filter.capacityMin || room.capacity > filter.capacityMax) {
            return false;
        }

        // 4. Lọc theo thiết bị (AND logic — phòng phải có TẤT CẢ thiết bị yêu cầu)
        if (filter.equipment.length > 0) {
            const hasAll = filter.equipment.every((eq) => room.equipment.includes(eq));
            if (!hasAll) return false;
        }

        return true;
    });
}
