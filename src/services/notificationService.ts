import { Platform } from 'react-native';
import { getNotificationTriggerDate } from '../utils/timeSlot';

import Constants, { ExecutionEnvironment } from 'expo-constants';

// Kiểm tra môi trường Expo Go hoặc Web để tránh require module native gây cảnh báo/crash
const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    (Constants as any).appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;

if (!isExpoGo && Platform.OS !== 'web') {
    try {
        // Chỉ nạp khi chạy native development build thật
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        Notifications = require('expo-notifications');

        Notifications?.setNotificationHandler({
            handleNotification: async () => ({
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch (_err) {
        Notifications = null;
    }
}

/**
 * Xin quyền thông báo từ hệ điều hành.
 * Gọi một lần khi user đặt phòng lần đầu.
 * Trả về true nếu được cấp quyền.
 */
export async function requestNotificationPermission (): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    if (!Notifications) return false;   // Expo Go — bỏ qua

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus === 'granted') return true;

        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch (_err) {
        return false;
    }
}

/**
 * Lên lịch thông báo nhắc nhở 15 phút trước giờ vào phòng.
 * @param roomName  - Tên phòng hiển thị trong nội dung notification
 * @param date      - Ngày đặt phòng "YYYY-MM-DD"
 * @param startTime - Giờ bắt đầu slot "HH:MM"
 * Trả về notificationId để hủy sau, hoặc null nếu không lên lịch được.
 */
export async function scheduleBookingReminder (
    roomName: string,
    date: string,
    startTime: string
): Promise<string | null> {
    if (!Notifications) {
        console.log('[Notification] Bỏ qua — chạy trong Expo Go');
        return null;
    }

    try {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return null;

        // Tính thời điểm trigger: 15 phút trước giờ bắt đầu
        const triggerDate = getNotificationTriggerDate(date, startTime);

        // Thời điểm nhắc đã qua → không lên lịch
        if (!triggerDate) {
            console.log('[Notification] Bỏ qua — thời điểm nhắc đã qua');
            return null;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '📚 Nhắc nhở đặt phòng VKU',
                body: `Sắp đến giờ vào phòng ${roomName} lúc ${startTime}, đừng quên check-in!`,
                data: { roomName, date, startTime },
                sound: 'default',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });

        console.log(`[Notification] Đã lên lịch: ${notificationId} lúc ${triggerDate.toISOString()}`);
        return notificationId;
    } catch (error) {
        console.error('[Notification] Lỗi khi lên lịch:', error);
        return null;
    }
}

/**
 * Hủy một notification đã lên lịch theo ID.
 * Gọi khi user hủy booking.
 */
export async function cancelBookingReminder (notificationId: string): Promise<void> {
    if (!Notifications) return;

    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log(`[Notification] Đã hủy: ${notificationId}`);
    } catch (error) {
        console.error('[Notification] Lỗi khi hủy:', error);
    }
}
