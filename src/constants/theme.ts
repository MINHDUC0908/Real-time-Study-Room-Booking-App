// Bảng màu và design tokens cho toàn bộ ứng dụng
export const COLORS = {
    // Màu nền chính (dark mode)
    background: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#263347',
    card: '#1E293B',
    border: '#334155',

    // Màu chủ đạo
    primary: '#3B82F6',       // Xanh dương
    primaryDark: '#2563EB',
    primaryLight: '#93C5FD',
    secondary: '#6366F1',     // Tím indigo

    // Màu trạng thái
    success: '#10B981',       // Xanh lá — Available
    successLight: '#D1FAE5',
    error: '#EF4444',         // Đỏ — Occupied / Lỗi
    errorLight: '#FEE2E2',
    warning: '#F59E0B',       // Vàng — Cảnh báo
    warningLight: '#FEF3C7',
    info: '#3B82F6',

    // Màu text
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textDisabled: '#475569',

    // Màu overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
    modalBackground: 'rgba(15, 23, 42, 0.95)',

    // Slot states
    slotAvailable: '#1E293B',
    slotBooked: '#374151',
    slotSelected: '#3B82F6',
    slotDisabled: '#1F2937',

    // Tòa nhà — màu badge
    buildingA: '#8B5CF6',
    buildingB: '#06B6D4',
    buildingC: '#F59E0B',
    buildingV: '#10B981',
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;

export const BORDER_RADIUS = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
} as const;

export const FONT_SIZE = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
} as const;

export const FONT_WEIGHT = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

// Chiều cao cố định của RoomCard — dùng cho getItemLayout FlatList
export const ROOM_CARD_HEIGHT = 200;
