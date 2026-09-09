import { Booking, TimeSlot } from '../types/booking';
import { generateUUID, formatDateISO } from '../utils/dateHelpers';

/**
 * Service layer cho nghiệp vụ đặt phòng.
 * Tạo, kiểm tra, cập nhật booking — logic tái sử dụng ngoài store.
 */

// Tạo một booking mới với đầy đủ thông tin
export function createBookingRecord (
    roomId: string,
    userId: string,
    date: string,
    slot: TimeSlot
): Booking {
    return {
        id: `booking-${generateUUID()}`,
        roomId,
        userId,
        date,
        slot,
        status: 'confirmed',
        qrCode: generateUUID(),  // mã QR duy nhất
        createdAt: new Date().toISOString(),
    };
}

// Lấy danh sách booking active (confirmed hoặc checked-in) của một user
export function getActiveBookings (
    bookings: Booking[],
    userId: string
): Booking[] {
    const today = formatDateISO(new Date());
    return bookings.filter((b) =>
        b.userId === userId &&
        (b.status === 'confirmed' || b.status === 'checked-in') &&
        b.date >= today   // chỉ lấy booking hôm nay trở đi
    );
}

// Lấy booking theo ID
export function findBookingById (
    bookings: Booking[],
    bookingId: string
): Booking | undefined {
    return bookings.find((b) => b.id === bookingId);
}
