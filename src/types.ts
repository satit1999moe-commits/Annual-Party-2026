export type Role = 'Super Admin' | 'Event Admin' | 'Ticket Staff' | 'Finance' | 'Check-in Staff' | 'Parent';

export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

export type PaymentStatus =
  | 'รอการชำระเงิน' // Pending (ภายใน 4 ชั่วโมง หลุดจองหากไม่ชำระ)
  | 'ชำระเงินแล้ว' // Paid & Verified
  | 'รอชำระเงิน' // Legacy alias
  | 'ส่งหลักฐานแล้ว' // Legacy alias
  | 'รอตรวจสอบ' // Legacy alias
  | 'ไม่ผ่านการตรวจสอบ' // Legacy alias
  | 'ยกเลิก'; // Cancelled

export type SeatStatus = 'Available' | 'Booked' | 'Locked' | 'Held';

export interface EventData {
  event_id: string;
  event_year: number;
  event_name_th: string;
  event_name_en: string;
  promo_title: string;
  theme: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  total_tables: number;
  seats_per_table: number;
  seat_price: number;
  table_price: number;
  sales_open_at: string;
  sales_close_at: string;
  event_status: 'Active' | 'Closed' | 'Draft';
  refund_policy: string;
  created_at: string;
  updated_at: string;
}

export interface Seat {
  event_id: string;
  table_number: number;
  seat_label: string; // A, B, C, D, E, F, G, H
  seat_status: SeatStatus;
  booking_uuid?: string;
  updated_at: string;
}

export interface Booking {
  booking_uuid: string;
  booking_code: string; // 4-digit code: e.g. 0001, 0042
  event_id: string;
  parent_first_name: string;
  parent_last_name: string;
  phone: string;
  email: string;
  contact_note?: string;
  student_first_name: string;
  student_last_name: string;
  level_id: string;
  level_name: string;
  room: string;
  program: 'TP' | 'EP'; // TP = Thai Program, EP = English Program
  table_number: number;
  seat_count: number;
  seat_labels: string[]; // e.g. ['A', 'B'] or ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  is_whole_table: boolean;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  slip_file_url?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  qr_token: string;
  check_in_status?: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  checked_in_count?: number;
  last_check_in_at?: string;
}

export interface PaymentRecord {
  payment_id: string;
  booking_uuid: string;
  amount: number;
  payment_method: 'PromptPay' | 'Bank Transfer' | 'Cash' | 'Credit Card';
  payment_reference?: string;
  slip_file_url?: string;
  payment_status: PaymentStatus;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  notes?: string;
}

export interface StudentClass {
  level_id: string;
  level_name: string;
  room: string;
  program: 'TP' | 'EP';
  active_status: boolean;
}

export interface StaffUser {
  staff_id: string;
  username: string; // e.g. '0833759527'
  password?: string;
  display_name: string; // e.g. 'นายพสิษฐ์ สัตบุตร'
  phone?: string;
  email: string;
  role: Role;
  active_status: boolean;
  active_devices?: string[]; // array of registered device IDs (up to 10)
  max_devices?: number; // 10
  last_login_at?: string;
}

export interface AuditLog {
  log_id: string;
  event_id: string;
  booking_uuid?: string;
  booking_code?: string;
  action: string;
  old_value?: string;
  new_value?: string;
  actor_id: string;
  actor_name: string;
  timestamp: string;
  reason?: string;
}

export interface CheckInRecord {
  checkin_id: string;
  booking_uuid: string;
  booking_code: string;
  checked_in_at: string;
  checked_in_by: string;
  checkin_status: 'Completed' | 'Duplicate_Attempt';
  notes?: string;
}

export interface SystemSetting {
  setting_key: string;
  setting_value: string;
  updated_by: string;
  updated_at: string;
}

export interface DashboardStats {
  totalTables: number;
  vacantTables: number;
  partialTables: number;
  fullTables: number;
  totalSeats: number;
  bookedSeats: number;
  vacantSeats: number;
  occupancyRate: number;
  totalBookings: number;
  totalRevenueBooked: number;
  totalRevenuePaid: number;
  totalRevenuePending: number;
  pendingSlipsCount: number;
  checkedInCount: number;
  checkInRate: number;
  staffSales: Array<{ staffName: string; count: number; totalAmount: number }>;
  programSales: Array<{ program: string; count: number; amount: number }>;
  levelSales: Array<{ levelName: string; count: number; amount: number }>;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  webAppUrl: string;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
  pendingSyncQueueCount: number;
}
