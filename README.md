# 🏫 VKU Study Room Booking

> Ứng dụng đặt phòng học/phòng máy Đại học VKU — Mini Project React Native + Expo + TypeScript + Zustand

---

## 📋 Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| 🔍 Tìm phòng | FlatList với 20+ phòng, tìm kiếm debounce 300ms |
| 🎛️ Bộ lọc | Tòa nhà (A/B/C/V), thiết bị (AND logic), persist state qua tabs |
| 📅 Chọn ngày | DateSelector ngang 7 ngày |
| ⏰ Chọn khung giờ | Grid 6 slot/ngày, highlight đã đặt/còn trống |
| ⚡ Chống xung đột | Double-check tại thời điểm submit, hiển thị lỗi nếu slot vừa bị chiếm |
| 📲 QR Check-in | Modal hiển thị QR sau khi đặt thành công, có nút share |
| 🔔 Notifications | Nhắc trước 15 phút, tự hủy khi cancel booking |
| 💾 Persist | Zustand + AsyncStorage — dữ liệu giữ nguyên sau khi tắt app |

---

## 🏗️ Kiến trúc

```
study-room-booking/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx             # Room Discovery (FlatList + filter)
│   │   ├── bookings.tsx          # Đặt phòng của tôi
│   │   └── profile.tsx           # Hồ sơ sinh viên
│   ├── room/[id].tsx             # Chi tiết phòng + chọn khung giờ
│   ├── booking/[id]/qr.tsx       # QR check-in full screen
│   └── _layout.tsx               # Root layout (ThemeProvider)
├── src/
│   ├── components/
│   │   ├── RoomCard.tsx          # React.memo + custom comparison
│   │   ├── FilterChip.tsx        # Chip lọc có chọn/bỏ chọn
│   │   ├── TimeSlotGrid.tsx      # Grid khung giờ với conflict visual
│   │   ├── DateSelector.tsx      # FlatList horizontal 7 ngày
│   │   └── QRCheckInModal.tsx    # Modal QR + thông tin booking
│   ├── stores/
│   │   ├── useBookingStore.ts    # Zustand chính + AsyncStorage persist
│   │   └── useFilterStore.ts     # Filter state (non-persist)
│   ├── services/
│   │   ├── roomService.ts        # Data access — swap mock↔API dễ dàng
│   │   ├── bookingService.ts     # Tạo/query booking records
│   │   └── notificationService.ts # Schedule/cancel notifications
│   ├── types/
│   │   ├── room.ts               # Room, Equipment
│   │   ├── booking.ts            # Booking, TimeSlot
│   │   └── filter.ts             # RoomFilter, DEFAULT_FILTER
│   ├── data/
│   │   └── mockRooms.ts          # 20 phòng mẫu VKU
│   ├── utils/
│   │   ├── timeSlot.ts           # Pure functions: conflict check, TIME_SLOTS
│   │   └── dateHelpers.ts        # Format ngày, UUID, getNext7Days
│   └── constants/
│       └── theme.ts              # COLORS, SPACING, BORDER_RADIUS, FONT_*
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js ≥ 18
- Expo Go app trên điện thoại (iOS/Android)
- npm ≥ 9

### Các bước

```bash
# 1. Vào thư mục project
cd study-room-booking

# 2. Cài dependencies (đã cài sẵn)
npm install

# 3. Khởi động Expo dev server
npx expo start

# 4. Quét QR code bằng Expo Go (Android) hoặc Camera (iOS)
```

### Chạy trên emulator/simulator
```bash
npx expo start --android   # Android emulator
npx expo start --ios       # iOS simulator (chỉ trên macOS)
```

---

## 🧪 Hướng dẫn test

### Test danh sách phòng + filter
1. Mở tab **Tìm phòng**
2. Gõ vào ô tìm kiếm — xem kết quả cập nhật sau ~300ms (debounce)
3. Nhấn icon 🎛️ để mở filter
4. Chọn **Tòa B** → chỉ thấy phòng máy
5. Thêm filter **PC cao cấp** → list thu hẹp (AND logic)
6. Chuyển sang tab khác rồi quay lại → filter vẫn giữ nguyên (Zustand state)

### Test đặt phòng & chống xung đột
1. Nhấn vào bất kỳ phòng nào status "Còn trống"
2. Chọn ngày, chọn một khung giờ (ví dụ **07:30 - 09:30**)
3. Nhấn **Đặt phòng** → QR Modal hiện ra
4. Đóng modal, quay lại chi tiết phòng đó, cùng ngày
5. Khung giờ vừa đặt sẽ chuyển thành **Đã đặt** (màu xám, disabled)
6. Thử nhấn "Đặt phòng" lại khi chọn slot đó → lỗi "Khung giờ vừa được đặt bởi người khác"

### Test persist AsyncStorage
1. Đặt một phòng thành công
2. Tắt hoàn toàn app Expo Go
3. Mở lại → vào tab **Đặt của tôi** → booking vẫn còn

### Test notifications (thiết bị thật)
1. Đặt phòng ở slot **gần giờ hiện tại** (ví dụ slot tiếp theo 15+ phút nữa)
2. Notification sẽ xuất hiện đúng 15 phút trước giờ bắt đầu
3. Hủy booking → notification cũng bị hủy

### Test QR check-in
1. Vào tab **Đặt của tôi**
2. Nhấn **Xem QR** trên một booking confirmed
3. QR Modal hiện ra với mã QR đầy đủ
4. Nhấn **Chia sẻ** → share sheet mở ra

---

## ⚙️ Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React Native | 0.86.3 | Framework mobile |
| Expo SDK | 57 | Toolchain + native modules |
| Expo Router | 57 | File-based routing |
| TypeScript | 6.x (strict) | Type safety |
| Zustand | 5.x | State management |
| AsyncStorage | 2.x | Persist middleware |
| expo-notifications | 57 | Local notifications |
| react-native-qrcode-svg | 6.x | QR code rendering |
| @expo/vector-icons | - | Icon library (MaterialCommunityIcons) |

---

## 🎯 Điểm nổi bật kỹ thuật

### 1. FlatList tối ưu (Room Discovery)
```tsx
<FlatList
    data={filteredRooms}
    renderItem={renderItem}          // useCallback — không tạo closure mới
    keyExtractor={keyExtractor}      // useCallback
    getItemLayout={getItemLayout}    // Chiều cao cố định 200px → scroll không lag
    initialNumToRender={6}           // Chỉ render 6 items đầu
    windowSize={5}                   // Buffer window = 5x viewport
    maxToRenderPerBatch={8}
    removeClippedSubviews={true}     // Unmount items ngoài viewport
/>
```

### 2. Double-check conflict (chống race condition)
```ts
// Trong useBookingStore.createBooking:
const isAvailable = checkSlotAvailable(roomId, date, slot.id, bookings);
if (!isAvailable) {
    return { success: false, error: 'Khung giờ vừa được đặt bởi người khác...' };
}
// → Tạo booking nguyên tử, không có window race
```

### 3. Repository Pattern (service layer)
```ts
// roomService.ts — swap mock → API chỉ cần đổi implementation
export async function fetchAllRooms(): Promise<Room[]> {
    // Thay bằng: return fetch('/api/rooms').then(r => r.json())
    return MOCK_ROOMS;
}
```

### 4. React.memo với custom comparator
```tsx
const RoomCard = memo<RoomCardProps>(
    ({ room, onPress }) => { ... },
    (prev, next) =>
        prev.room.id === next.room.id &&
        prev.room.status === next.room.status &&
        prev.onPress === next.onPress
);
```

---

## 📝 Lưu ý

- Đây là **bản demo học thuật**, dữ liệu lưu cục bộ (AsyncStorage)
- Notifications chỉ hoạt động đầy đủ trên **thiết bị thật** (Expo Go)
- Trên simulator iOS/Android có thể cần cấp quyền notification thủ công trong Settings

---

*Xây dựng bởi sinh viên VKU — Mini Project Lập trình Đa nền tảng (10%)*
