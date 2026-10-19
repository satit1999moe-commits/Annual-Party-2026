import React from 'react';
import { Booking, EventData, Seat } from '../types';
import { Language } from '../i18n';
import { Printer, X, FileSpreadsheet } from 'lucide-react';
import { exportManifestToExcel } from '../utils/excelExport';
import { formatThaiDate, getNowThaiDateTime } from '../utils/dateUtils';

interface PrintableManifestProps {
  event: EventData;
  bookings: Booking[];
  seats: Seat[];
  onClose: () => void;
  lang?: Language;
}

export const PrintableManifest: React.FC<PrintableManifestProps> = ({
  event,
  bookings,
  seats,
  onClose,
  lang = 'th',
}) => {
  const confirmedBookings = bookings.filter((b) => b.booking_status === 'Confirmed');

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleExportExcel = () => {
    exportManifestToExcel(event, bookings, seats, lang);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="popup-window-container w-full max-w-4xl my-auto space-y-4 print:space-y-0 print:max-w-none print:w-full print:m-0 print:p-0" onClick={(e) => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="no-print bg-[#0a192f] text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl border border-[#172b4d]">
          <div>
            <span className="font-bold text-sm">
              {lang === 'th'
                ? 'ใบสรุปผังโต๊ะและรายชื่อผู้เข้าร่วมงาน (Table Manifest)'
                : 'Event Seating Manifest & Attendance Summary'}
            </span>
            <p className="text-[11px] text-slate-300">
              {lang === 'th'
                ? 'สำหรับเจ้าหน้าที่โต๊ะลงทะเบียนและฝ่ายจัดเลี้ยง (ขนาดกระดาษ A4)'
                : 'For reception staff, registrars, and catering organizers (A4 Standard)'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
              title={lang === 'th' ? 'ดาวน์โหลดเอกสารสรุปผังโต๊ะเป็นไฟล์ Excel (.xlsx)' : 'Download Table Manifest as Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{lang === 'th' ? 'ส่งออก Excel (.xlsx)' : 'Export Excel (.xlsx)'}</span>
            </button>

            {/* Print / Export PDF Button */}
            <button
              onClick={() => window.print()}
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

        {/* Printable Document (A4 Manifest Sheet) */}
        <div className="a4-manifest-sheet bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0">
          <div className="border-b-2 border-[#0f223d] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0f223d] text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">
                S
              </div>
              <div>
                <h1 className="text-base font-bold text-[#0f223d]">
                  {lang === 'th' ? 'โรงเรียนสาธิตอุดมศึกษา' : 'Satit Udomseuksa School'}
                </h1>
                <p className="text-[11px] text-slate-500">Satit Udomseuksa School · A4 Standard</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0f223d]">
                {lang === 'th'
                  ? 'เอกสารสรุปผังโต๊ะและรายชื่อลงทะเบียนหน้างาน'
                  : 'Official Table Manifest & Attendee Roster'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'th' ? event.event_name_th : event.event_name_en} ({lang === 'th' ? formatThaiDate(event.event_date) : event.event_date})
              </p>
            </div>
          </div>

          {/* Table List */}
          <div className="my-4 overflow-x-auto text-[11px] sm:text-xs">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-1.5 sm:p-2 border border-slate-300 text-center w-12">{lang === 'th' ? 'โต๊ะ' : 'Table'}</th>
                  <th className="p-1.5 sm:p-2 border border-slate-300 w-16 text-center">{lang === 'th' ? 'รหัสจอง' : 'Code'}</th>
                  <th className="p-1.5 sm:p-2 border border-slate-300">{lang === 'th' ? 'ผู้ปกครอง / เบอร์โทร' : 'Parent / Phone'}</th>
                  <th className="p-1.5 sm:p-2 border border-slate-300">{lang === 'th' ? 'นักเรียน / ระดับชั้น' : 'Student / Grade'}</th>
                  <th className="p-1.5 sm:p-2 border border-slate-300 text-center w-20">{lang === 'th' ? 'ที่นั่ง' : 'Seats'}</th>
                  <th className="p-1.5 sm:p-2 border border-slate-300 text-center w-24">{lang === 'th' ? 'สถานะชำระ' : 'Payment'}</th>
                  <th className="p-1.5 sm:p-2 border border-slate-300 text-center w-20">{lang === 'th' ? 'ลงชื่อเข้างาน' : 'Signature'}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: event.total_tables || 120 }).map((_, idx) => {
                  const tableNum = idx + 1;
                  const tableBookings = confirmedBookings.filter((b) => b.table_number === tableNum);

                  if (tableBookings.length === 0) {
                    return (
                      <tr key={tableNum} className="text-slate-400 bg-slate-50/50 print:bg-transparent">
                        <td className="p-1.5 sm:p-2 border border-slate-300 text-center font-mono font-bold">
                          {tableNum}
                        </td>
                        <td colSpan={6} className="p-1.5 sm:p-2 border border-slate-300 italic text-center text-slate-400">
                          {lang === 'th' ? '(โต๊ะว่างทั้งหมด 8 ที่นั่ง)' : '(All 8 seats vacant)'}
                        </td>
                      </tr>
                    );
                  }

                  return tableBookings.map((b, bIdx) => (
                    <tr key={`${tableNum}-${b.booking_uuid}`} className="hover:bg-slate-50 print:bg-transparent">
                      {bIdx === 0 && (
                        <td
                          rowSpan={tableBookings.length}
                          className="p-1.5 sm:p-2 border border-slate-300 text-center font-mono font-bold bg-slate-50 print:bg-transparent text-slate-900"
                        >
                          {tableNum}
                        </td>
                      )}
                      <td className="p-1.5 sm:p-2 border border-slate-300 text-center font-mono font-bold text-slate-900">
                        #{b.booking_code}
                      </td>
                      <td className="p-1.5 sm:p-2 border border-slate-300">
                        <div className="font-semibold text-slate-900">{b.parent_first_name} {b.parent_last_name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{b.phone}</div>
                      </td>
                      <td className="p-1.5 sm:p-2 border border-slate-300">
                        <div className="text-slate-900">{b.student_first_name} {b.student_last_name}</div>
                        <div className="text-[10px] text-slate-500">{b.level_name} /{b.room} ({b.program})</div>
                      </td>
                      <td className="p-1.5 sm:p-2 border border-slate-300 text-center font-mono text-slate-900">
                        {b.is_whole_table
                          ? (lang === 'th' ? 'A-H (8 ที่)' : 'A-H (8 Seats)')
                          : b.seat_labels.join(', ')}
                      </td>
                      <td className="p-1.5 sm:p-2 border border-slate-300 text-center font-semibold text-emerald-800">
                        {b.payment_status}
                      </td>
                      <td className="p-1.5 sm:p-2 border border-slate-300 text-center">
                        {b.check_in_status ? (
                          <span className="font-bold text-emerald-700">✓ {lang === 'th' ? 'มาแล้ว' : 'Checked-in'}</span>
                        ) : (
                          <span className="text-slate-300">______</span>
                        )}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
            <span>
              {lang === 'th'
                ? `พิมพ์เมื่อ: ${getNowThaiDateTime()}`
                : `Printed on: ${new Date().toLocaleString('en-US')}`}
            </span>
            <span>
              {lang === 'th'
                ? 'โรงเรียนสาธิตอุดมศึกษา — ระบบบริหารจัดการงานเลี้ยงประจำปี'
                : 'Satit Udomseuksa School — Annual Banquet Management'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
