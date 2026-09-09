import { TimeSlot } from '../types/booking';

// Danh sách khung giờ cố định trong ngày (2 tiếng mỗi slot)
export const TIME_SLOTS: TimeSlot[] = [
    { id: 'slot-1', startTime: '07:30', endTime: '09:30', label: '07:30 - 09:30' },
    { id: 'slot-2', startTime: '09:30', endTime: '11:30', label: '09:30 - 11:30' },
    { id: 'slot-3', startTime: '13:00', endTime: '15:00', label: '13:00 - 15:00' },
    { id: 'slot-4', startTime: '15:00', endTime: '17:00', label: '15:00 - 17:00' },
    { id: 'slot-5', startTime: '17:00', endTime: '19:00', label: '17:00 - 19:00' },
    { id: 'slot-6', startTime: '19:00', endTime: '21:00', label: '19:00 - 21:00' },
];

/**
 * Kiểm tra một slot có xung đột với danh sách slot đã đặt không.
 * Hai slot xung đột nếu chúng chồng lên nhau về thời gian.
 * Hàm thuần (pure function) — không có side effect.
 */
export function isSlotConflicting (
    slotId: string,
    bookedSlotIds: string[]
): boolean {
    return bookedSlotIds.includes(slotId);
}

/**
 * Lấy danh sách slot ID đã bị đặt cho một phòng vào một ngày.
 * Chỉ tính các booking có status 'confirmed' hoặc 'checked-in'.
 */
export function getBookedSlotIds (
    roomId: string,
    date: string,
    allBookings: Array<{ roomId: string; date: string; slot: TimeSlot; status: string }>
): string[] {
    return allBookings
        .filter((b) =>
            b.roomId === roomId &&
            b.date === date &&
            (b.status === 'confirmed' || b.status === 'checked-in')
        )
        .map((b) => b.slot.id);
}

/**
 * Kiểm tra slot có khả dụng không (pure function gọi từ store).
 * Trả về true nếu slot CHƯA bị đặt bởi bất kỳ ai.
 */
export function checkSlotAvailable (
    roomId: string,
    date: string,
    slotId: string,
    allBookings: Array<{ roomId: string; date: string; slot: TimeSlot; status: string }>
): boolean {
    const bookedIds = getBookedSlotIds(roomId, date, allBookings);
    return !isSlotConflicting(slotId, bookedIds);
}

/**
 * Tính thời điểm (Date) cần lên lịch thông báo: 15 phút trước slot.startTime.
 * Trả về null nếu thời điểm đó đã qua.
 */
export function getNotificationTriggerDate (
    date: string,
    startTime: string
): Date | null {
    // Ghép ngày + giờ thành Date object
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = startTime.split(':').map(Number);

    const slotStart = new Date(year, month - 1, day, hour, minute, 0);
    // Nhắc trước 15 phút
    const triggerTime = new Date(slotStart.getTime() - 15 * 60 * 1000);

    // Nếu thời điểm nhắc đã qua → không lên lịch
    if (triggerTime <= new Date()) {
        return null;
    }

    return triggerTime;
}

/**
 * Lấy thông tin slot theo ID.
 */
export function getSlotById (slotId: string): TimeSlot | undefined {
    return TIME_SLOTS.find((s) => s.id === slotId);
}
