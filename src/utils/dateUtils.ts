/**
 * Thai Date & Time Formatting Utilities
 * Standardizes Buddhist Era (พ.ศ. = ค.ศ. + 543) and Thai locale representations
 */

const THAI_MONTHS_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

const THAI_DAYS_FULL = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
];

/**
 * Convert CE year to Thai Buddhist Era (พ.ศ.)
 */
export function toBuddhistYear(year: number): number {
  return year > 2400 ? year : year + 543;
}

/**
 * Parses date input string (e.g., '2026-12-18', '2026-10-12 10:15:00', ISO string) or Date
 */
function parseDateInput(input: string | Date | number | undefined | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'string') {
    // Check if it's already a clean ISO or YYYY-MM-DD
    const normalized = input.includes(' ') && !input.includes('T') ? input.replace(' ', 'T') : input;
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;

    // Manual parse for YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
    const parts = input.trim().split(/[\sT]+/);
    if (parts[0]) {
      const dateParts = parts[0].split('-');
      if (dateParts.length === 3) {
        const y = parseInt(dateParts[0], 10);
        const m = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        let hour = 0;
        let minute = 0;
        let second = 0;
        if (parts[1]) {
          const timeParts = parts[1].split(':');
          hour = parseInt(timeParts[0] || '0', 10);
          minute = parseInt(timeParts[1] || '0', 10);
          second = parseInt(timeParts[2] || '0', 10);
        }
        const created = new Date(y, m, day, hour, minute, second);
        return isNaN(created.getTime()) ? null : created;
      }
    }
  }
  return null;
}

/**
 * Format date in Thai Buddhist format
 * @example formatThaiDate('2026-12-18') => '18 ธันวาคม 2569'
 * @example formatThaiDate('2026-12-18', 'short') => '18 ธ.ค. 2569'
 * @example formatThaiDate('2026-12-18', 'full') => 'วันศุกร์ที่ 18 ธันวาคม พ.ศ. 2569'
 */
export function formatThaiDate(
  input: string | Date | number | undefined | null,
  formatType: 'short' | 'medium' | 'long' | 'full' = 'long'
): string {
  const d = parseDateInput(input);
  if (!d) return String(input || '-');

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const beYear = toBuddhistYear(d.getFullYear());

  if (formatType === 'short') {
    return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${String(beYear).slice(-2)}`;
  }

  if (formatType === 'medium') {
    return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${beYear}`;
  }

  if (formatType === 'full') {
    const dayName = THAI_DAYS_FULL[d.getDay()];
    return `${dayName}ที่ ${day} ${THAI_MONTHS_FULL[monthIdx]} พ.ศ. ${beYear}`;
  }

  // default 'long'
  return `${day} ${THAI_MONTHS_FULL[monthIdx]} ${beYear}`;
}

/**
 * Format time in Thai standard format with 'น.'
 * @example formatThaiTime('18:00') => '18:00 น.'
 * @example formatThaiTime('18:00:00') => '18:00 น.'
 * @example formatThaiTime(new Date()) => '14:41 น.'
 */
export function formatThaiTime(input: string | Date | number | undefined | null, includeSeconds = false): string {
  if (!input) return '-';

  if (typeof input === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(input.trim())) {
    const parts = input.trim().split(':');
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    if (includeSeconds && parts[2]) {
      const ss = parts[2].padStart(2, '0');
      return `${hh}:${mm}:${ss} น.`;
    }
    return `${hh}:${mm} น.`;
  }

  const d = parseDateInput(input);
  if (!d) return String(input);

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (includeSeconds) {
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss} น.`;
  }
  return `${hh}:${mm} น.`;
}

/**
 * Format both Date and Time in Thai
 * @example formatThaiDateTime('2026-10-12 10:15:00') => '12 ต.ค. 2569 เวลา 10:15 น.'
 */
export function formatThaiDateTime(
  input: string | Date | number | undefined | null,
  isShort = true
): string {
  const d = parseDateInput(input);
  if (!d) return String(input || '-');

  const datePart = formatThaiDate(d, isShort ? 'medium' : 'long');
  const timePart = formatThaiTime(d);
  return `${datePart} เวลา ${timePart}`;
}

/**
 * Current Timestamp in Thai format
 */
export function getNowThaiDateTime(): string {
  return formatThaiDateTime(new Date(), false);
}

export interface PaymentCountdownResult {
  isExpired: boolean;
  remainingMs: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedTh: string;
  formattedEn: string;
}

/**
 * Calculates payment countdown for pending bookings (default 4 hours / 240 minutes)
 * If unpaid after 4 hours, seats are automatically released (หลุดจอง)
 */
export function getPaymentCountdown(
  createdAt: string | Date | number | undefined | null,
  timeoutHours: number = 4
): PaymentCountdownResult {
  const d = parseDateInput(createdAt);
  if (!d) {
    return {
      isExpired: false,
      remainingMs: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedTh: '-',
      formattedEn: '-',
    };
  }

  const expiryTime = d.getTime() + timeoutHours * 60 * 60 * 1000;
  const now = Date.now();
  const diffMs = expiryTime - now;

  if (diffMs <= 0) {
    return {
      isExpired: true,
      remainingMs: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedTh: 'หมดเวลาชำระเงิน (หลุดจองแล้ว)',
      formattedEn: 'Payment expired (Seats released)',
    };
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const remainingHours = Math.floor(totalSecs / 3600);
  const remainingMinutes = Math.floor((totalSecs % 3600) / 60);
  const remainingSeconds = totalSecs % 60;

  let formattedTh = '';
  let formattedEn = '';

  if (remainingHours > 0) {
    formattedTh = `${remainingHours} ชม. ${remainingMinutes} นาที`;
    formattedEn = `${remainingHours}h ${remainingMinutes}m`;
  } else {
    formattedTh = `${remainingMinutes} นาที ${remainingSeconds} วิ`;
    formattedEn = `${remainingMinutes}m ${remainingSeconds}s`;
  }

  return {
    isExpired: false,
    remainingMs: diffMs,
    remainingHours,
    remainingMinutes,
    remainingSeconds,
    formattedTh,
    formattedEn,
  };
}

export function isBookingPaymentExpired(
  createdAt: string | Date | number | undefined | null,
  timeoutHours: number = 4
): boolean {
  const d = parseDateInput(createdAt);
  if (!d) return false;
  return Date.now() > d.getTime() + timeoutHours * 60 * 60 * 1000;
}
