import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useBookingStore } from '../src/stores/useBookingStore';

// User mặc định cho demo (trong ứng dụng thật sẽ có màn hình đăng nhập)
const DEFAULT_USER = {
    id: 'user-demo-001',
    name: 'Nguyễn Văn An',
    studentId: '21IT001',
};

export default function RootLayout () {
    // Dùng selector riêng lẻ — tránh subscribe toàn bộ store gây re-render thừa
    const user = useBookingStore((state) => state.user);
    const setUser = useBookingStore((state) => state.setUser);

    // Thiết lập user demo nếu chưa có
    useEffect(() => {
        if (!user) {
            setUser(DEFAULT_USER);
        }
    }, []);

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#0F172A' },
                    headerTintColor: '#F1F5F9',
                    headerTitleStyle: { fontWeight: '600' },
                    contentStyle: { backgroundColor: '#0F172A' },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="room/[id]"
                    options={{
                        title: 'Chi tiết phòng',
                        headerBackTitle: 'Quay lại',
                    }}
                />
                <Stack.Screen
                    name="booking/[id]/qr"
                    options={{
                        title: 'Mã QR Check-in',
                        presentation: 'modal',
                        headerBackTitle: 'Đóng',
                    }}
                />
            </Stack>
        </>
    );
}
