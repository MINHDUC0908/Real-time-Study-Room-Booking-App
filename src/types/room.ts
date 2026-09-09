// Thiết bị hỗ trợ trong phòng
export type Equipment = 'projector' | 'whiteboard' | 'high-spec-pc' | 'ac';

// Thông tin phòng học/phòng máy
export interface Room {
    id: string;
    name: string;
    building: 'A' | 'B' | 'C' | 'V';
    floor: number;
    capacity: number;
    equipment: Equipment[];
    photoUrl: string;
    status: 'available' | 'occupied';
    description?: string;
}
