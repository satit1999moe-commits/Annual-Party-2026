import React from 'react';
import { Booking, EventData } from '../types';
import { Language } from '../i18n';
import { Printer, X, ShieldCheck, Phone, FileSpreadsheet } from 'lucide-react';
import { exportTicketToExcel } from '../utils/excelExport';
import { formatThaiDate, formatThaiTime, formatThaiDateTime } from '../utils/dateUtils';

interface PrintableTicketProps {
  booking: Booking;
  event: EventData;
  onClose: () => void;
  lang?: Language;
}

export const PrintableTicket: React.FC<PrintableTicketProps> = ({
  booking,
  event,
  onClose,
  lang = 'th',
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportTicketToExcel(booking, event, lang);
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Control Toolbar (Hidden in print) */}
      <div className="popup-window-container w-full max-w-2xl my-auto space-y-4 print:space-y-0 print:max-w-none print:w-full print:m-0 print:p-0" onClick={(e) => e.stopPropagation()}>
        <div className="print:hidden bg-[#0a192f] text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl border border-[#172b4d]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">
              {lang === 'th' ? 'พิมพ์ใบยืนยันการจอง / บัตรเข้างาน' : 'Print Booking Pass / Admission Ticket'}
            </span>
            <span className="text-xs bg-white/10 text-amber-400 font-mono px-3 py-1 rounded-lg font-bold border border-white/10">
              #{booking.booking_code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
              title={lang === 'th' ? 'ดาวน์โหลดไฟล์ Excel (.xlsx)' : 'Download Excel file (.xlsx)'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{lang === 'th' ? 'ส่งออก Excel (.xlsx)' : 'Export Excel (.xlsx)'}</span>
            </button>

            {/* Print / Export PDF Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
              title={lang === 'th' ? 'พิมพ์หรือบันทึกเป็น PDF (ขนาด A4)' : 'Print or save as PDF (A4 size)'}
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'th' ? 'พิมพ์เอกสาร A4 / PDF' : 'Print A4 / PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label={lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
              title={lang === 'th' ? 'ปิดหน้าต่าง (Esc / X)' : 'Close (Esc / X)'}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
            >
              <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Document Canvas (A4 Sheet Frame) */}
        <div className="a4-ticket-sheet relative bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border-2 border-slate-300 print:shadow-none print:m-0">
          {/* Prominent Floating Close Button on paper canvas */}
          <button
            onClick={onClose}
            aria-label={lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
            title={lang === 'th' ? 'ปิดหน้าต่าง (X)' : 'Close (X)'}
            className="print:hidden absolute top-4 right-4 p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-full border border-slate-300 transition-colors shadow-2xs cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="border-b-2 border-[#0f223d] pb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0f223d] text-white font-mono font-bold text-lg flex items-center justify-center shrink-0">
                S
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0f223d]">
                  {lang === 'th' ? 'โรงเรียนสาธิตอุดมศึกษา' : 'Satit Udomseuksa School'}
                </h1>
                <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                  {lang === 'th' ? 'SATIT UDOMSEUKSA SCHOOL' : 'Bilingual & International Academic Program'}
                </p>
                <p className="text-[11px] font-semibold text-[#0f223d] mt-0.5">
                  {lang === 'th'
                    ? 'ใบยืนยันการจองและบัตรเข้างานเลี้ยงประจำปี (OFFICIAL CONFIRMATION PASS)'
                    : 'Annual Gala Banquet Pass & Official Table Confirmation'}
                </p>
              </div>
            </div>

            {/* 4-Digit Booking Code Stamp */}
            <div className="text-right border-2 border-slate-900 rounded-xl px-3.5 py-1.5 bg-slate-50 shrink-0">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                BOOKING CODE
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight leading-none mt-0.5">
                #{booking.booking_code}
              </div>
            </div>
          </div>

          {/* Event Metadata Banner */}
          <div className="my-3.5 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">
                {lang === 'th' ? 'กิจกรรม' : 'Event'}
              </span>
              <span className="font-semibold text-slate-900 text-xs truncate block">
                {lang === 'th' ? event.event_name_th : event.event_name_en}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">
                {lang === 'th' ? 'วันที่จัดงาน' : 'Date'}
              </span>
              <span className="font-semibold text-slate-900 text-xs block">
                {lang === 'th' ? formatThaiDate(event.event_date) : event.event_date}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">
                {lang === 'th' ? 'เวลา' : 'Time'}
              </span>
              <span className="font-semibold text-slate-900 text-xs block">
                {lang === 'th'
                  ? `${formatThaiTime(event.start_time)} - ${formatThaiTime(event.end_time)}`
                  : `${event.start_time} - ${event.end_time}`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">
                {lang === 'th' ? 'สถานที่' : 'Venue'}
              </span>
              <span className="font-semibold text-slate-900 text-xs truncate block">
                {event.venue === 'สนามกีฬาโรงเรียน'
                  ? (lang === 'th' ? 'สนามกีฬาโรงเรียน' : 'School Sports Stadium')
                  : event.venue}
              </span>
            </div>
          </div>

          {/* Core Ticket Content: Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {/* Column 1 & 2: Details */}
            <div className="md:col-span-2 space-y-3.5 text-xs">
              {/* Attendee Info Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 text-white px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                  {lang === 'th' ? 'ข้อมูลผู้ปกครองและนักเรียน (ATTENDEE DETAILS)' : 'Attendee & Student Details'}
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">{lang === 'th' ? 'ชื่อผู้ปกครอง:' : 'Parent Name:'}</span>
                    <span className="font-bold text-slate-900">
                      {booking.parent_first_name} {booking.parent_last_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">{lang === 'th' ? 'เบอร์โทรศัพท์:' : 'Phone Number:'}</span>
                    <span className="font-mono font-medium text-slate-900">{booking.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">{lang === 'th' ? 'ชื่อนักเรียน:' : 'Student Name:'}</span>
                    <span className="font-bold text-slate-900">
                      {booking.student_first_name} {booking.student_last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === 'th' ? 'ระดับชั้น / ห้อง / หลักสูตร:' : 'Grade / Room / Program:'}</span>
                    <span className="font-semibold text-slate-900">
                      {booking.level_name} {lang === 'th' ? 'ห้อง' : 'Room'} {booking.room} ({booking.program === 'EP' ? 'English Program' : 'Thai Program'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Seating & Price Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 text-white px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                  {lang === 'th' ? 'รายละเอียดที่นั่งและการเงิน (SEATING & PAYMENT)' : 'Seating & Payment Summary'}
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">{lang === 'th' ? 'หมายเลขโต๊ะ:' : 'Table Number:'}</span>
                    <span className="font-bold font-mono text-base text-slate-900">
                      {lang === 'th' ? `โต๊ะที่ ${booking.table_number}` : `Table ${booking.table_number}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">{lang === 'th' ? 'ที่นั่งที่ระบุ:' : 'Designated Seats:'}</span>
                    <span className="font-bold text-slate-900">
                      {booking.is_whole_table
                        ? (lang === 'th' ? 'เหมาทั้งโต๊ะ (8 ที่นั่ง A–H)' : 'Whole Table (8 Seats A–H)')
                        : (lang === 'th' ? `ที่นั่ง: ${booking.seat_labels.join(', ')} (${booking.seat_count} ที่นั่ง)` : `Seats: ${booking.seat_labels.join(', ')} (${booking.seat_count} Seats)`)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">{lang === 'th' ? 'ยอดชำระสุทธิ:' : 'Total Amount:'}</span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {booking.total_amount.toLocaleString()} {lang === 'th' ? 'บาท' : 'THB'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === 'th' ? 'สถานะการชำระเงิน:' : 'Payment Status:'}</span>
                    <span className="font-bold text-emerald-700">
                      {booking.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Official Verification Pass */}
            <div className="flex flex-col items-center justify-between border-2 border-[#0f223d] rounded-xl p-3.5 bg-slate-50 text-center shadow-xs">
              <div className="space-y-0.5">
                <div className="p-2.5 bg-amber-500/10 rounded-full inline-block border border-amber-500/30">
                  <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto" />
                </div>
                <div className="text-[11px] font-bold text-slate-900 tracking-wider uppercase mt-1">
                  OFFICIAL ADMISSION PASS
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  {lang === 'th' ? 'บัตรเข้างานตัวจริงประจำโต๊ะ' : 'Official Table Admission Pass'}
                </div>
              </div>

              <div className="my-2.5 p-2.5 bg-white border border-slate-300 rounded-xl w-full">
                <div className="text-[9px] text-slate-500 font-bold uppercase">
                  {lang === 'th' ? 'รหัสยืนยันเข้างาน (ENTRY PASS ID)' : 'Official Entry Code'}
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 my-0.5">
                  #{booking.booking_code}
                </div>
                <div className="text-[10px] font-bold text-blue-900">
                  {lang === 'th' ? `โต๊ะที่ ${booking.table_number}` : `Table ${booking.table_number}`}
                </div>
                <div className="text-[9px] text-slate-500">
                  {booking.is_whole_table
                    ? (lang === 'th' ? 'เหมาทั้งโต๊ะ (8 ที่นั่ง)' : 'Whole Table (8 Seats)')
                    : (lang === 'th' ? `ที่นั่ง ${booking.seat_labels.join(', ')}` : `Seats ${booking.seat_labels.join(', ')}`)}
                </div>
              </div>

              {/* Official Booking LINE and Phone Contact */}
              <div className="w-full space-y-1 text-[10px] border-t border-slate-200 pt-2">
                <div className="text-[9px] text-slate-500 font-medium">
                  {lang === 'th' ? 'ติดต่อสอบถาม / แนบสลิปผ่าน LINE:' : 'Contact & Submit Slip via LINE:'}
                </div>
                <a
                  href="https://lin.ee/qunLKq0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-bold text-emerald-700 hover:text-emerald-800 break-all text-[10px]"
                >
                  https://lin.ee/qunLKq0
                </a>
                <div className="text-[9px] text-slate-700 font-semibold flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3 text-slate-600" />
                  <span>{lang === 'th' ? 'โทรจอง: 086-316-7655' : 'Call: 086-316-7655'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
            <div>
              {lang === 'th'
                ? '* กรุณาแสดงเอกสารนี้หรือภาพถ่ายในโทรศัพท์มือถือแก่เจ้าหน้าที่ ณ ประตูทางเข้างาน'
                : '* Please present this document or a mobile photo to staff at the venue entrance.'}
            </div>
            <div className="font-mono text-[9px] text-slate-400">
              DOC-VERIFIED · A4-FIT · {lang === 'th' ? formatThaiDate(new Date(), 'short') : new Date().toISOString().split('T')[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
