import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE } from '../../src/constants/theme';

export default function TabLayout () {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: { fontWeight: '700', fontSize: FONT_SIZE.lg, color: COLORS.textPrimary },
                headerShadowVisible: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 6,
                    elevation: 4,
                    shadowColor: '#0F172A',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: {
                    fontSize: FONT_SIZE.xs,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Tìm phòng',
                    headerTitle: '🏫 VKU Đặt Phòng',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="magnify" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Đặt của tôi',
                    headerTitle: 'Đặt phòng của tôi',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="calendar-check-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Tài khoản',
                    headerTitle: 'Hồ sơ sinh viên',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
