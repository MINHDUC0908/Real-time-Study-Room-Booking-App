// Bảng màu sáng (Light theme), hiện đại, thanh lịch cho môi trường trường đại học VKU
export const COLORS = {
    // Màu nền chính (light mode sạch sẽ, tươi sáng)
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    card: '#FFFFFF',
    border: '#E2E8F0',

    // Màu chủ đạo (Xanh đại học VKU hiện đại, uy tín)
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#EFF6FF',
    secondary: '#0284C7',

    // Màu trạng thái
    success: '#16A34A',
    successLight: '#DCFCE7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    info: '#2563EB',

    // Màu text (sắc nét, độ tương phản cao, dễ đọc)
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textDisabled: '#CBD5E1',

    // Màu overlay
    overlay: 'rgba(15, 23, 42, 0.4)',
    modalBackground: 'rgba(15, 23, 42, 0.5)',

    // Slot states
    slotAvailable: '#FFFFFF',
    slotBooked: '#F1F5F9',
    slotSelected: '#2563EB',
    slotDisabled: '#F8FAFC',

    // Tòa nhà — màu badge đặc trưng, hài hòa
    buildingA: '#7C3AED',
    buildingB: '#0284C7',
    buildingC: '#EA580C',
    buildingV: '#16A34A',
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
export const ROOM_CARD_HEIGHT = 224;
