// Khung giờ đặt phòng
export interface TimeSlot {
    id: string;
    startTime: string;  // "07:30"
    endTime: string;    // "09:30"
    label: string;      // "07:30 - 09:30"
}

// Thông tin một lần đặt phòng
export interface Booking {
    id: string;
    roomId: string;
    userId: string;
    date: string;           // ISO date "2026-09-10"
    slot: TimeSlot;
    status: 'confirmed' | 'checked-in' | 'cancelled' | 'expired';
    qrCode: string;         // mã UUID duy nhất cho QR check-in
    createdAt: string;      // ISO datetime
    notificationId?: string; // ID của notification đã lên lịch (để hủy nếu cần)
}
