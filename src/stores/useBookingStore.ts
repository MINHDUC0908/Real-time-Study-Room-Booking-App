import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, TimeSlot } from '../types/booking';
import { createBookingRecord, getActiveBookings } from '../services/bookingService';
import { checkSlotAvailable, getBookedSlotIds } from '../utils/timeSlot';
import { scheduleBookingReminder, cancelBookingReminder } from '../services/notificationService';
import { MOCK_ROOMS } from '../data/mockRooms';

// Thông tin user đang đăng nhập (đơn giản hóa, không auth thật)
interface User {
    id: string;
    name: string;
    studentId: string;
}

// Định nghĩa toàn bộ state và actions của store
interface BookingState {
    // --- Session ---
    user: User | null;
    setUser: (user: User | null) => void;

    // --- Dữ liệu đặt phòng ---
    bookings: Booking[];

    /**
     * Tạo booking mới với cơ chế double-check xung đột.
     * Trả về { success: true, booking } nếu thành công,
     * hoặc { success: false, error } nếu slot đã bị chiếm.
     */
    createBooking: (
        roomId: string,
        date: string,
        slot: TimeSlot
    ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;

    // Hủy booking + hủy notification tương ứng
    cancelBooking: (bookingId: string) => Promise<void>;

    // Cập nhật trạng thái check-in
    checkIn: (bookingId: string) => void;

    // --- Query helpers (selector function) ---

    // Lấy tất cả booking của một phòng vào một ngày cụ thể
    getBookingsForRoom: (roomId: string, date: string) => Booking[];

    // Kiểm tra slot có còn trống không
    isSlotAvailable: (roomId: string, date: string, slotId: string) => boolean;

    // Lấy danh sách booking active (còn hiệu lực) của user hiện tại
    getMyActiveBookings: () => Booking[];
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            // --- Khởi tạo ---
            user: null,
            bookings: [],

            // Cập nhật thông tin user
            setUser: (user) => set({ user }),

            // Tạo booking mới với double-check xung đột
            createBooking: async (roomId, date, slot) => {
                const { user, bookings } = get();

                // Kiểm tra user đã đăng nhập chưa
                if (!user) {
                    return { success: false, error: 'Vui lòng đăng nhập để đặt phòng.' };
                }

                // DOUBLE-CHECK: Kiểm tra lại tại thời điểm submit
                // tránh trường hợp 2 người cùng chọn slot và submit đồng thời
                const isAvailable = checkSlotAvailable(roomId, date, slot.id, bookings);
                if (!isAvailable) {
                    return {
                        success: false,
                        error: 'Khung giờ vừa được đặt bởi người khác, vui lòng chọn lại.',
                    };
                }

                // Tạo bản ghi booking mới
                const newBooking = createBookingRecord(roomId, user.id, date, slot);

                // Lấy tên phòng để hiển thị trong notification
                const room = MOCK_ROOMS.find((r) => r.id === roomId);
                const roomName = room?.name ?? roomId;

                // Lên lịch thông báo nhắc nhở (bất đồng bộ, không block UI)
                const notificationId = await scheduleBookingReminder(roomName, date, slot.startTime);

                // Gắn notificationId vào booking nếu có
                const bookingWithNotif: Booking = notificationId
                    ? { ...newBooking, notificationId }
                    : newBooking;

                // Cập nhật store
                set((state) => ({
                    bookings: [...state.bookings, bookingWithNotif],
                }));

                return { success: true, booking: bookingWithNotif };
            },

            // Hủy booking và notification liên quan
            cancelBooking: async (bookingId) => {
                const { bookings } = get();
                const booking = bookings.find((b) => b.id === bookingId);

                // Hủy notification nếu đã lên lịch
                if (booking?.notificationId) {
                    await cancelBookingReminder(booking.notificationId);
                }

                // Cập nhật trạng thái booking thành 'cancelled'
                set((state) => ({
                    bookings: state.bookings.map((b) =>
                        b.id === bookingId ? { ...b, status: 'cancelled' } : b
                    ),
                }));
            },

            // Cập nhật trạng thái check-in khi user quét QR
            checkIn: (bookingId) => {
                set((state) => ({
                    bookings: state.bookings.map((b) =>
                        b.id === bookingId ? { ...b, status: 'checked-in' } : b
                    ),
                }));
            },

            // Lấy booking của phòng theo ngày (dùng trong TimeSlotGrid)
            getBookingsForRoom: (roomId, date) => {
                return get().bookings.filter(
                    (b) =>
                        b.roomId === roomId &&
                        b.date === date &&
                        (b.status === 'confirmed' || b.status === 'checked-in')
                );
            },

            // Kiểm tra slot còn trống — gọi pure function từ utils
            isSlotAvailable: (roomId, date, slotId) => {
                return checkSlotAvailable(roomId, date, slotId, get().bookings);
            },

            // Lấy booking active của user hiện tại
            getMyActiveBookings: () => {
                const { user, bookings } = get();
                if (!user) return [];
                return getActiveBookings(bookings, user.id);
            },
        }),
        {
            name: 'vku-booking-storage',  // key trong AsyncStorage
            storage: createJSONStorage(() => AsyncStorage),
            // Chỉ persist những fields cần thiết (user session + bookings)
            partialize: (state) => ({
                user: state.user,
                bookings: state.bookings,
            }),
        }
    )
);
