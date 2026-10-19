import * as XLSX from 'xlsx';
import {
  Booking,
  EventData,
  Seat,
  StudentClass,
  StaffUser,
  AuditLog,
  PaymentRecord,
  CheckInRecord,
  SystemSetting,
} from '../types';
import { Language } from '../i18n';
import {
  formatThaiDate,
  formatThaiTime,
  formatThaiDateTime,
  getNowThaiDateTime,
} from './dateUtils';

/**
 * Export table manifest to an Excel file (.xlsx)
 */
export const exportManifestToExcel = (
  event: EventData,
  bookings: Booking[],
  seats: Seat[],
  lang: Language = 'th'
) => {
  const isTh = lang === 'th';
  const confirmedBookings = bookings.filter((b) => b.booking_status === 'Confirmed');

  // Headers
  const headers = [
    isTh ? 'หมายเลขโต๊ะ' : 'Table Number',
    isTh ? 'รหัสการจอง' : 'Booking Code',
    isTh ? 'ชื่อผู้ปกครอง' : 'Parent First Name',
    isTh ? 'นามสกุลผู้ปกครอง' : 'Parent Last Name',
    isTh ? 'เบอร์โทรศัพท์' : 'Phone Number',
    isTh ? 'อีเมล' : 'Email',
    isTh ? 'ชื่อนักเรียน' : 'Student First Name',
    isTh ? 'นามสกุลนักเรียน' : 'Student Last Name',
    isTh ? 'ระดับชั้น' : 'Level',
    isTh ? 'ห้อง' : 'Room',
    isTh ? 'หลักสูตร' : 'Program',
    isTh ? 'ประเภทการจอง' : 'Booking Type',
    isTh ? 'ที่นั่งที่ระบุ' : 'Seat Labels',
    isTh ? 'จำนวนที่นั่ง' : 'Seat Count',
    isTh ? 'ยอดชำระสุทธิ (บาท)' : 'Total Amount (THB)',
    isTh ? 'สถานะชำระเงิน' : 'Payment Status',
    isTh ? 'สถานะการจอง' : 'Booking Status',
    isTh ? 'สถานะเช็คอิน' : 'Check-in Status',
    isTh ? 'วันที่บันทึก' : 'Created At',
  ];

  const rows: any[][] = [];

  // Title rows
  rows.push([isTh ? 'โรงเรียนสาธิตอุดมศึกษา' : 'Satit Udomseuksa School']);
  rows.push([
    isTh
      ? `เอกสารสรุปผังโต๊ะและรายชื่อผู้เข้าร่วมงาน - ${event.event_name_th} (${event.event_year})`
      : `Table Manifest & Attendee Roster - ${event.event_name_en} (${event.event_year})`
  ]);
  rows.push([
    isTh
      ? `วันที่จัดงาน: ${formatThaiDate(event.event_date)} | เวลา: ${formatThaiTime(event.start_time)} - ${formatThaiTime(event.end_time)} | สถานที่: ${event.venue}`
      : `Date: ${event.event_date} | Time: ${event.start_time} - ${event.end_time} | Venue: ${event.venue === 'สนามกีฬาโรงเรียน' ? 'School Sports Stadium' : event.venue}`
  ]);
  rows.push([
    isTh
      ? `พิมพ์/ส่งออกเมื่อ: ${getNowThaiDateTime()} | จำนวนโต๊ะทั้งหมด: ${event.total_tables || 120} โต๊ะ`
      : `Exported: ${new Date().toLocaleString('en-US')} | Total Tables: ${event.total_tables || 120}`
  ]);
  rows.push([]); // Empty spacing row
  rows.push(headers);

  // Iterate over all 120 tables
  const totalTables = event.total_tables || 120;
  for (let tableNum = 1; tableNum <= totalTables; tableNum++) {
    const tableBookings = confirmedBookings.filter((b) => b.table_number === tableNum);

    if (tableBookings.length === 0) {
      rows.push([
        tableNum,
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        isTh ? 'โต๊ะว่าง (8 ที่นั่ง)' : 'All 8 Seats Vacant',
        'A, B, C, D, E, F, G, H',
        0,
        0,
        '-',
        '-',
        '-',
        '-',
      ]);
    } else {
      for (const b of tableBookings) {
        rows.push([
          tableNum,
          b.booking_code,
          b.parent_first_name,
          b.parent_last_name,
          b.phone,
          b.email || '-',
          b.student_first_name,
          b.student_last_name,
          b.level_name,
          b.room,
          b.program === 'EP' ? 'English Program' : 'Thai Program',
          b.is_whole_table ? (isTh ? 'เหมาทั้งโต๊ะ (8 ที่)' : 'Whole Table (8 Seats)') : (isTh ? 'จองรายที่นั่ง' : 'Individual Seats'),
          b.is_whole_table ? 'A, B, C, D, E, F, G, H' : b.seat_labels.join(', '),
          b.seat_count,
          b.total_amount,
          b.payment_status,
          b.booking_status,
          b.check_in_status ? (isTh ? 'เข้างานแล้ว' : 'Checked-in') : (isTh ? 'ยังไม่เข้างาน' : 'Not Checked-in'),
          b.created_at,
        ]);
      }
    }
  }

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Define column widths
  ws['!cols'] = [
    { wch: 12 }, // Table Number
    { wch: 14 }, // Booking Code
    { wch: 20 }, // Parent First Name
    { wch: 20 }, // Parent Last Name
    { wch: 15 }, // Phone
    { wch: 22 }, // Email
    { wch: 18 }, // Student First Name
    { wch: 18 }, // Student Last Name
    { wch: 12 }, // Level
    { wch: 8 },  // Room
    { wch: 16 }, // Program
    { wch: 22 }, // Booking Type
    { wch: 16 }, // Seats
    { wch: 12 }, // Seat Count
    { wch: 18 }, // Total Amount
    { wch: 16 }, // Payment Status
    { wch: 14 }, // Booking Status
    { wch: 16 }, // Check-in Status
    { wch: 20 }, // Created At
  ];

  XLSX.utils.book_append_sheet(wb, ws, isTh ? 'ผังโต๊ะและรายชื่อ' : 'Table Manifest');

  const fileName = `Table_Manifest_${event.event_id}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export single ticket details to an Excel file (.xlsx)
 */
export const exportTicketToExcel = (
  booking: Booking,
  event: EventData,
  lang: Language = 'th'
) => {
  const isTh = lang === 'th';

  const rows = [
    [isTh ? 'โรงเรียนสาธิตอุดมศึกษา' : 'Satit Udomseuksa School'],
    [isTh ? 'ใบยืนยันการจองและบัตรเข้างาน (Official Admission Pass)' : 'Official Admission Pass & Ticket Details'],
    [],
    [isTh ? 'รหัสการจอง (Booking Code)' : 'Booking Code', `#${booking.booking_code}`],
    [isTh ? 'กิจกรรม (Event)' : 'Event', isTh ? event.event_name_th : event.event_name_en],
    [isTh ? 'ปีจัดงาน (Year)' : 'Year', isTh ? `${event.event_year + 543} (พ.ศ.)` : event.event_year],
    [isTh ? 'วันที่จัดงาน (Date)' : 'Date', isTh ? formatThaiDate(event.event_date) : event.event_date],
    [isTh ? 'เวลา (Time)' : 'Time', isTh ? `${formatThaiTime(event.start_time)} - ${formatThaiTime(event.end_time)}` : `${event.start_time} - ${event.end_time}`],
    [isTh ? 'สถานที่ (Venue)' : 'Venue', event.venue === 'สนามกีฬาโรงเรียน' ? (isTh ? 'สนามกีฬาโรงเรียน' : 'School Sports Stadium') : event.venue],
    [],
    [isTh ? 'ข้อมูลผู้ปกครองและนักเรียน' : 'Attendee & Student Information'],
    [isTh ? 'ชื่อ-นามสกุลผู้ปกครอง' : 'Parent Name', `${booking.parent_first_name} ${booking.parent_last_name}`],
    [isTh ? 'เบอร์โทรศัพท์' : 'Phone', booking.phone],
    [isTh ? 'อีเมล' : 'Email', booking.email || '-'],
    [isTh ? 'ชื่อ-นามสกุลนักเรียน' : 'Student Name', `${booking.student_first_name} ${booking.student_last_name}`],
    [isTh ? 'ระดับชั้น / ห้อง' : 'Grade / Room', `${booking.level_name} ${isTh ? 'ห้อง' : 'Room'} ${booking.room}`],
    [isTh ? 'หลักสูตร' : 'Program', booking.program === 'EP' ? 'English Program' : 'Thai Program'],
    [],
    [isTh ? 'รายละเอียดที่นั่งและการเงิน' : 'Seating & Payment Summary'],
    [isTh ? 'หมายเลขโต๊ะ' : 'Table Number', `${isTh ? 'โต๊ะที่' : 'Table'} ${booking.table_number}`],
    [isTh ? 'ประเภทการจอง' : 'Booking Type', booking.is_whole_table ? (isTh ? 'เหมาทั้งโต๊ะ (8 ที่นั่ง A–H)' : 'Whole Table (8 Seats A–H)') : (isTh ? 'จองรายที่นั่ง' : 'Individual Seats')],
    [isTh ? 'ที่นั่งที่ระบุ' : 'Designated Seats', booking.seat_labels.join(', ')],
    [isTh ? 'จำนวนที่นั่ง' : 'Seat Count', `${booking.seat_count} ${isTh ? 'ที่นั่ง' : 'Seats'}`],
    [isTh ? 'ยอดชำระสุทธิ' : 'Total Amount', `${booking.total_amount.toLocaleString()} ${isTh ? 'บาท' : 'THB'}`],
    [isTh ? 'สถานะการชำระเงิน' : 'Payment Status', booking.payment_status],
    [isTh ? 'วันที่ทำรายการ' : 'Booking Date', isTh ? formatThaiDateTime(booking.created_at) : booking.created_at],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 30 },
    { wch: 45 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, isTh ? 'บัตรเข้างาน' : 'Ticket Pass');

  const fileName = `Ticket_${booking.booking_code}_${event.event_id}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export all bookings list to an Excel file (.xlsx)
 */
export const exportBookingsListToExcel = (
  bookings: Booking[],
  event: EventData,
  lang: Language = 'th'
) => {
  const isTh = lang === 'th';

  const headers = [
    isTh ? 'รหัสการจอง' : 'Booking Code',
    isTh ? 'โต๊ะ' : 'Table',
    isTh ? 'ที่นั่ง' : 'Seats',
    isTh ? 'จำนวนที่' : 'Seat Count',
    isTh ? 'เหมาโต๊ะ' : 'Whole Table',
    isTh ? 'ชื่อผู้ปกครอง' : 'Parent First Name',
    isTh ? 'นามสกุลผู้ปกครอง' : 'Parent Last Name',
    isTh ? 'เบอร์โทร' : 'Phone',
    isTh ? 'ชื่อนักเรียน' : 'Student First Name',
    isTh ? 'นามสกุลนักเรียน' : 'Student Last Name',
    isTh ? 'ระดับชั้น' : 'Level',
    isTh ? 'ห้อง' : 'Room',
    isTh ? 'หลักสูตร' : 'Program',
    isTh ? 'ยอดเงิน (บาท)' : 'Amount (THB)',
    isTh ? 'สถานะชำระเงิน' : 'Payment Status',
    isTh ? 'สถานะจอง' : 'Booking Status',
    isTh ? 'เช็คอิน' : 'Checked-in',
    isTh ? 'ผู้บันทึก' : 'Created By',
    isTh ? 'วันที่สร้าง' : 'Created At',
  ];

  const dataRows = bookings.map((b) => [
    b.booking_code,
    b.table_number,
    b.seat_labels.join(', '),
    b.seat_count,
    b.is_whole_table ? (isTh ? 'เหมา' : 'Yes') : (isTh ? 'ไม่' : 'No'),
    b.parent_first_name,
    b.parent_last_name,
    b.phone,
    b.student_first_name,
    b.student_last_name,
    b.level_name,
    b.room,
    b.program,
    b.total_amount,
    b.payment_status,
    b.booking_status,
    b.check_in_status ? (isTh ? 'ใช่' : 'Yes') : (isTh ? 'ยัง' : 'No'),
    b.created_by,
    isTh ? formatThaiDateTime(b.created_at) : b.created_at,
  ]);

  const rows = [
    [isTh ? `รายงานรายการจองทั้งหมด - ${event.event_name_th}` : `All Bookings Report - ${event.event_name_en}`],
    [isTh ? `ส่งออกข้อมูลเมื่อ: ${getNowThaiDateTime()}` : `Export Date: ${new Date().toLocaleString('en-US')}`],
    [],
    headers,
    ...dataRows,
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
    { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 18 },
    { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 14 }, { wch: 16 },
    { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, isTh ? 'รายการจอง' : 'Bookings');

  const fileName = `Bookings_${event.event_id}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export complete multi-sheet database workbook (.xlsx) containing all 10 sheets:
 * Dashboard, Events, Bookings, Seats, Payments, Students_Classes, Staff, Audit_Log, Check_In, Settings
 * Ready to open directly in Microsoft Excel or Google Sheets (File > Open / Import)
 */
export const exportAllDatabaseSheetsToExcel = (
  event: EventData,
  bookings: Booking[],
  seats: Seat[],
  payments: PaymentRecord[] = [],
  classes: StudentClass[] = [],
  staff: StaffUser[] = [],
  auditLogs: AuditLog[] = [],
  checkIns: CheckInRecord[] = [],
  settings: SystemSetting[] = [],
  lang: Language = 'th'
): void => {
  const isTh = lang === 'th';
  const wb = XLSX.utils.book_new();

  // 1. DASHBOARD SHEET
  const totalRevenue = bookings.reduce((sum, b) => (b.booking_status === 'Confirmed' ? sum + (b.total_amount || 0) : sum), 0);
  const paidRevenue = bookings.reduce((sum, b) => (b.payment_status === 'ชำระเงินแล้ว' ? sum + (b.total_amount || 0) : sum), 0);
  const pendingRevenue = bookings.reduce((sum, b) => (b.payment_status === 'รอชำระเงิน' || b.payment_status === 'ส่งหลักฐานแล้ว' ? sum + (b.total_amount || 0) : sum), 0);
  const confirmedCount = bookings.filter((b) => b.booking_status === 'Confirmed').length;
  const bookedSeatsCount = seats.filter((s) => s.seat_status === 'Booked').length;
  const totalSeatsCount = seats.length || 960;

  const dashboardRows = [
    [isTh ? 'โรงเรียนสาธิตอุดมศึกษา' : 'Satit Udomseuksa School'],
    [isTh ? `สรุปภาพรวมฐานข้อมูลระบบจองบัตร - ${event.event_name_th} (${event.event_year + 543})` : `Master Database Dashboard - ${event.event_name_en} (${event.event_year})`],
    [isTh ? `สร้างเมื่อ: ${getNowThaiDateTime()}` : `Generated: ${new Date().toLocaleString('en-US')}`],
    [],
    [isTh ? 'ตัวชี้วัดสำคัญ (Key Metrics)' : 'Key Metrics', isTh ? 'ค่าปัจจุบัน' : 'Current Value', isTh ? 'หน่วย' : 'Unit'],
    [isTh ? 'จำนวนรายการจองทั้งหมด' : 'Total Bookings', bookings.length, isTh ? 'รายการ' : 'Bookings'],
    [isTh ? 'รายการจองที่ยืนยันแล้ว' : 'Confirmed Bookings', confirmedCount, isTh ? 'รายการ' : 'Bookings'],
    [isTh ? 'ที่นั่งที่จองแล้ว' : 'Booked Seats', bookedSeatsCount, `${isTh ? 'จาก' : 'of'} ${totalSeatsCount} ${isTh ? 'ที่นั่ง' : 'Seats'}`],
    [isTh ? 'อัตราการจองที่นั่ง' : 'Occupancy Rate', `${Math.round((bookedSeatsCount / (totalSeatsCount || 1)) * 100)}%`, '%'],
    [isTh ? 'รายได้รวมทั้งหมด' : 'Total Booked Revenue', totalRevenue, isTh ? 'บาท' : 'THB'],
    [isTh ? 'รายได้ที่ชำระเงินแล้ว' : 'Verified Paid Revenue', paidRevenue, isTh ? 'บาท' : 'THB'],
    [isTh ? 'ยอดรอชำระเงิน' : 'Pending Revenue', pendingRevenue, isTh ? 'บาท' : 'THB'],
    [isTh ? 'จำนวนโต๊ะทั้งหมด' : 'Total Tables', event.total_tables || 120, isTh ? 'โต๊ะ' : 'Tables'],
    [isTh ? 'ราคาบัตรเดี่ยว' : 'Seat Price', event.seat_price, isTh ? 'บาท' : 'THB'],
    [isTh ? 'ราคาเหมาโต๊ะ' : 'Table Price', event.table_price, isTh ? 'บาท' : 'THB'],
  ];
  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardRows);
  wsDashboard['!cols'] = [{ wch: 32 }, { wch: 25 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

  // 2. EVENTS SHEET
  const eventHeaders = [
    'event_id', 'event_year', 'event_name_th', 'event_name_en', 'promo_title', 'theme',
    'event_date', 'start_time', 'end_time', 'venue', 'total_tables', 'seats_per_table',
    'seat_price', 'table_price', 'sales_open_at', 'sales_close_at', 'event_status', 'refund_policy', 'created_at', 'updated_at'
  ];
  const eventRows = [
    eventHeaders,
    [
      event.event_id, event.event_year, event.event_name_th, event.event_name_en, event.promo_title, event.theme,
      event.event_date, event.start_time, event.end_time, event.venue, event.total_tables, event.seats_per_table,
      event.seat_price, event.table_price, event.sales_open_at, event.sales_close_at, event.event_status, event.refund_policy, event.created_at, event.updated_at
    ]
  ];
  const wsEvents = XLSX.utils.aoa_to_sheet(eventRows);
  wsEvents['!cols'] = eventHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsEvents, 'Events');

  // 3. BOOKINGS SHEET
  const bookingHeaders = [
    'booking_uuid', 'booking_code', 'event_id', 'parent_first_name', 'parent_last_name',
    'phone', 'email', 'student_first_name', 'student_last_name', 'level_id', 'level_name',
    'room', 'program', 'table_number', 'seat_count', 'seat_labels', 'is_whole_table', 'booking_status',
    'payment_status', 'total_amount', 'slip_file_url', 'notes', 'created_by', 'created_at',
    'updated_by', 'updated_at', 'cancelled_at', 'cancellation_reason'
  ];
  const bookingDataRows = bookings.map((b) => [
    b.booking_uuid, b.booking_code, b.event_id, b.parent_first_name, b.parent_last_name,
    b.phone, b.email || '', b.student_first_name, b.student_last_name, b.level_id, b.level_name,
    b.room, b.program, b.table_number, b.seat_count, b.seat_labels.join(';'), b.is_whole_table ? 'YES' : 'NO', b.booking_status,
    b.payment_status, b.total_amount, b.slip_file_url || '', b.notes || '', b.created_by,
    b.created_at, b.updated_by || '', b.updated_at || '', b.cancelled_at || '', b.cancellation_reason || ''
  ]);
  const wsBookings = XLSX.utils.aoa_to_sheet([bookingHeaders, ...bookingDataRows]);
  wsBookings['!cols'] = bookingHeaders.map(() => ({ wch: 16 }));
  XLSX.utils.book_append_sheet(wb, wsBookings, 'Bookings');

  // 4. SEATS SHEET
  const seatHeaders = ['event_id', 'table_number', 'seat_label', 'seat_status', 'booking_uuid', 'updated_at'];
  const seatDataRows = seats.map((s) => [
    s.event_id, s.table_number, s.seat_label, s.seat_status, s.booking_uuid || '', s.updated_at
  ]);
  const wsSeats = XLSX.utils.aoa_to_sheet([seatHeaders, ...seatDataRows]);
  wsSeats['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSeats, 'Seats');

  // 5. PAYMENTS SHEET
  const paymentHeaders = [
    'payment_id', 'booking_uuid', 'amount', 'payment_method', 'payment_reference',
    'slip_file_url', 'payment_status', 'verified_by', 'verified_at', 'created_at'
  ];
  const paymentDataRows = payments.map((p) => [
    p.payment_id, p.booking_uuid, p.amount, p.payment_method, p.payment_reference || '',
    p.slip_file_url || '', p.payment_status, p.verified_by || '', p.verified_at || '', p.created_at
  ]);
  const wsPayments = XLSX.utils.aoa_to_sheet([paymentHeaders, ...paymentDataRows]);
  wsPayments['!cols'] = paymentHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Payments');

  // 6. STUDENTS_CLASSES SHEET
  const classHeaders = ['level_id', 'level_name', 'room', 'program', 'active_status'];
  const classDataRows = classes.map((c) => [
    c.level_id, c.level_name, c.room, c.program, c.active_status ? 'Active' : 'Inactive'
  ]);
  const wsClasses = XLSX.utils.aoa_to_sheet([classHeaders, ...classDataRows]);
  wsClasses['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsClasses, 'Students_Classes');

  // 7. STAFF SHEET
  const staffHeaders = ['staff_id', 'username', 'display_name', 'phone', 'email', 'role', 'active_status'];
  const staffDataRows = staff.map((s) => [
    s.staff_id, s.username, s.display_name, s.phone || '', s.email, s.role, s.active_status ? 'Active' : 'Inactive'
  ]);
  const wsStaff = XLSX.utils.aoa_to_sheet([staffHeaders, ...staffDataRows]);
  wsStaff['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 24 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsStaff, 'Staff');

  // 8. AUDIT_LOG SHEET
  const auditHeaders = ['log_id', 'event_id', 'booking_uuid', 'booking_code', 'action', 'old_value', 'new_value', 'actor_id', 'actor_name', 'timestamp', 'reason'];
  const auditDataRows = auditLogs.map((l) => [
    l.log_id, l.event_id, l.booking_uuid || '', l.booking_code || '', l.action,
    l.old_value || '', l.new_value || '', l.actor_id, l.actor_name, l.timestamp, l.reason || ''
  ]);
  const wsAudit = XLSX.utils.aoa_to_sheet([auditHeaders, ...auditDataRows]);
  wsAudit['!cols'] = auditHeaders.map(() => ({ wch: 16 }));
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit_Log');

  // 9. CHECK_IN SHEET
  const checkinHeaders = ['checkin_id', 'booking_uuid', 'booking_code', 'checked_in_at', 'checked_in_by', 'checkin_status', 'notes'];
  const checkinDataRows = checkIns.map((c) => [
    c.checkin_id, c.booking_uuid, c.booking_code, c.checked_in_at, c.checked_in_by, c.checkin_status, c.notes || ''
  ]);
  const wsCheckIn = XLSX.utils.aoa_to_sheet([checkinHeaders, ...checkinDataRows]);
  wsCheckIn['!cols'] = [{ wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, wsCheckIn, 'Check_In');

  // 10. SETTINGS SHEET
  const settingHeaders = ['setting_key', 'setting_value', 'updated_by', 'updated_at'];
  const settingDataRows = settings.map((s) => [s.setting_key, s.setting_value, s.updated_by, s.updated_at]);
  const wsSettings = XLSX.utils.aoa_to_sheet([settingHeaders, ...settingDataRows]);
  wsSettings['!cols'] = [{ wch: 28 }, { wch: 35 }, { wch: 18 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings');

  // Save workbook file
  const fileName = `Satit_Database_Master_All_Sheets_${event.event_id}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

