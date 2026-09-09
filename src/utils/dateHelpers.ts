// Các hàm trợ giúp xử lý ngày tháng

const WEEKDAY_VI = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const MONTH_VI = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];

/**
 * Tạo mảng 7 ngày kể từ hôm nay (dùng cho DateSelector).
 * Trả về mảng các object { date: "YYYY-MM-DD", label: "Thứ X", dayNum: N, monthLabel: "ThX" }
 */
export function getNext7Days (): Array<{
    date: string;
    label: string;
    dayNum: number;
    monthLabel: string;
    isToday: boolean;
}> {
    const result = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);

        result.push({
            date: formatDateISO(d),
            label: i === 0 ? 'Hôm nay' : WEEKDAY_VI[d.getDay()],
            dayNum: d.getDate(),
            monthLabel: MONTH_VI[d.getMonth()],
            isToday: i === 0,
        });
    }

    return result;
}

/**
 * Format Date → "YYYY-MM-DD"
 */
export function formatDateISO (date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Format "YYYY-MM-DD" → "10/09/2026"
 */
export function formatDateDisplay (isoDate: string): string {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
}

/**
 * Format "YYYY-MM-DD" → "Thứ 4, 10 Th9"
 */
export function formatDateFull (isoDate: string): string {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${WEEKDAY_VI[date.getDay()]}, ${d} ${MONTH_VI[m - 1]}`;
}

/**
 * Sinh UUID v4 đơn giản dùng cho qrCode của booking.
 */
export function generateUUID (): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * So sánh hai chuỗi ngày ISO "YYYY-MM-DD".
 * Trả về true nếu date1 <= date2.
 */
export function isDateBeforeOrEqual (date1: string, date2: string): boolean {
    return date1 <= date2;
}
