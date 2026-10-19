import React, { useState } from 'react';
import { Booking, Role, EventData } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  X,
  UserCheck,
  Phone,
} from 'lucide-react';

interface QrCheckinScannerProps {
  event: EventData;
  role: Role;
  currentStaffName: string;
  onRefresh: () => void;
  bookings: Booking[];
  lang?: Language;
}

export const QrCheckinScanner: React.FC<QrCheckinScannerProps> = ({
  event,
  role,
  currentStaffName,
  onRefresh,
  bookings,
  lang = 'th',
}) => {
  const t = translations[lang];
  const [inputCodeOrToken, setInputCodeOrToken] = useState('');
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Statistics
  const confirmedBookings = bookings.filter((b) => b.booking_status === 'Confirmed');
  const checkedInList = confirmedBookings.filter((b) => b.check_in_status === true);
  const checkedInCount = checkedInList.length;
  const totalCount = confirmedBookings.length;
  const percentage = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  // Search and verify
  const handleVerify = async (val?: string) => {
    const query = (val || inputCodeOrToken).trim();
    if (!query) {
      setErrorMessage(lang === 'th' ? 'กรุณากรอกรหัสการจอง 4 หลัก, เบอร์โทร หรือชื่อ' : 'Please enter 4-digit booking code, phone, or name');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setDuplicateWarning(null);
    setSuccessMessage(null);

    try {
      // Find locally first (by code, phone, or name)
      const localMatch = bookings.find(
        (b) =>
          b.booking_code === query ||
          (query.length === 4 && b.booking_code.endsWith(query)) ||
          b.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
          b.parent_first_name.includes(query) ||
          b.student_first_name.includes(query)
      );

      const targetCode = localMatch ? localMatch.booking_code : query;

      if (localMatch && localMatch.check_in_status) {
        setDuplicateWarning(
          lang === 'th'
            ? `รหัส #${localMatch.booking_code} (${localMatch.parent_first_name}) ได้รับการเช็กอินเข้างานไปแล้วเมื่อ ${localMatch.checked_in_at}`
            : `Ticket #${localMatch.booking_code} was already checked in at ${localMatch.checked_in_at}`
        );
        setScannedBooking(localMatch);
        setLoading(false);
        return;
      }

      // Call API check-in
      const res = await api.checkIn(targetCode, currentStaffName);

      if (res.isDuplicate || res.warning) {
        setDuplicateWarning(res.warning || (lang === 'th' ? 'รายการนี้เช็กอินแล้ว' : 'Already checked in'));
      } else {
        setSuccessMessage(t.checkinSuccess.replace('{code}', res.booking.booking_code));
      }

      setScannedBooking(res.booking);
      setInputCodeOrToken('');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'th' ? 'ไม่พบข้อมูลการจองตามรหัสนี้' : 'No booking found for this code'));
      setScannedBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const sampleCodes = ['0001', '0002', '0003', '0007'];

  return (
    <div className="space-y-6">
      {/* Header and Station Info */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            {t.gateCheckinTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.gateCheckinSubtitle} · {t.creatorStaff} <span className="font-semibold text-slate-800">{currentStaffName}</span>
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">{t.actualCheckinCount}</div>
            <div className="text-xl font-bold font-mono text-slate-900 leading-tight">
              {checkedInCount} <span className="text-xs font-normal text-slate-500">/ {totalCount} ({percentage}%)</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-mono font-bold text-xs text-emerald-700 bg-white shadow-2xs">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Main Check-in Input Box */}
      <div className="bg-white rounded-xl p-6 border-2 border-slate-300 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          {lang === 'th' ? 'ค้นหาและบันทึกการเช็กอินเข้างาน' : 'Search & Record Guest Check-in'}
        </label>

        <div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={lang === 'th' ? 'ค้นหาด้วยรหัสการจอง (เช่น 0001) หรือ เบอร์โทรศัพท์ หรือ ชื่อผู้ปกครอง/นักเรียน' : 'Search by booking code (e.g. 0001), phone, or attendee name'}
                value={inputCodeOrToken}
                onChange={(e) => setInputCodeOrToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerify();
                }}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                autoFocus
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#0f223d] hover:bg-[#162d4e] disabled:opacity-50 rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
            >
              {loading ? '...' : (lang === 'th' ? 'เช็กอินทันที' : 'Check-In')}
            </button>
          </div>

          {/* Quick tester helper */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-500">
            <span>{t.testWithSampleCodes}</span>
            {sampleCodes.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setInputCodeOrToken(c);
                  handleVerify(c);
                }}
                className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 font-mono text-[11px] text-slate-700 cursor-pointer"
              >
                #{c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-xs">{lang === 'th' ? 'เช็กอินสำเร็จ' : 'Check-in Successful'}</p>
              <p className="text-xs text-emerald-800">{successMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            aria-label={t.closeModal}
            title={`${t.closeModal} (X)`}
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {duplicateWarning && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-start justify-between gap-3 text-amber-950 animate-in shake">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-amber-900">{t.duplicateCheckinWarning}</p>
              <p className="text-amber-800">{duplicateWarning}</p>
              {scannedBooking && (
                <p className="text-[11px] text-amber-700 font-mono">
                  {lang === 'th' ? `เวลาที่เช็กอินก่อนหน้า: ${scannedBooking.checked_in_at} โดย ${scannedBooking.checked_in_by}` : `Previous check-in: ${scannedBooking.checked_in_at} by ${scannedBooking.checked_in_by}`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setDuplicateWarning(null)}
            aria-label={t.closeModal}
            title={`${t.closeModal} (X)`}
            className="text-amber-700 hover:text-amber-950 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-3 text-rose-900 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs font-semibold">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            aria-label={t.closeModal}
            title={`${t.closeModal} (X)`}
            className="text-rose-700 hover:text-rose-950 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Scanned Attendee Verification Card */}
      {scannedBooking && (
        <div className="bg-white rounded-xl border-2 border-slate-900 shadow-md overflow-hidden animate-in fade-in zoom-in-95">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-md text-amber-300">
                BOOKING #{scannedBooking.booking_code}
              </span>
              <span className="text-sm font-semibold">
                {lang === 'th' ? `สถานะ: ${scannedBooking.check_in_status ? t.alreadyCheckedIn : t.readyToCheckin}` : `Status: ${scannedBooking.check_in_status ? t.alreadyCheckedIn : t.readyToCheckin}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  scannedBooking.payment_status === 'ชำระเงินแล้ว'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                }`}
              >
                {scannedBooking.payment_status}
              </span>
              <button
                onClick={() => setScannedBooking(null)}
                aria-label={t.closeModal}
                title={`${t.closeModal} (X)`}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parent Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500 font-medium">{t.sectionParentInfo}</span>
                <div className="text-base font-bold text-slate-900">
                  {scannedBooking.parent_first_name} {scannedBooking.parent_last_name}
                </div>
                <div className="text-xs font-mono text-slate-600">{t.parentPhone}: {scannedBooking.phone}</div>
                {scannedBooking.email && (
                  <div className="text-xs text-slate-500">{scannedBooking.email}</div>
                )}
              </div>

              {/* Student Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500 font-medium">{t.sectionStudentInfo}</span>
                <div className="text-base font-bold text-slate-900">
                  {scannedBooking.student_first_name} {scannedBooking.student_last_name}
                </div>
                <div className="text-xs text-slate-700">
                  {t.studentGrade} {scannedBooking.level_name} {t.studentRoom} {scannedBooking.room}
                </div>
                <div className="text-xs text-slate-500">
                  {t.studentProgram}: {scannedBooking.program === 'EP' ? 'English Program (EP)' : 'Thai Program (TP)'}
                </div>
              </div>
            </div>

            {/* Table & Seating Position Card */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
                  {t.seatPositionAtGala}
                </span>
                <div className="text-2xl font-bold font-mono text-blue-950 mt-0.5">
                  {t.tableNum} {scannedBooking.table_number}
                </div>
                <div className="text-xs text-blue-800 mt-1">
                  {scannedBooking.is_whole_table
                    ? (lang === 'th' ? 'จองเหมาทั้งโต๊ะ (8 ที่นั่ง A–H)' : 'Whole Table Reserved (8 Seats A–H)')
                    : `${lang === 'th' ? 'ที่นั่ง' : 'Seats'}: ${scannedBooking.seat_labels.join(', ')} (${scannedBooking.seat_count} ${lang === 'th' ? 'ที่' : 'seats'})`}
                </div>
              </div>

              {/* Wristband Distribution Guide */}
              <div className="bg-white p-3.5 rounded-lg border border-blue-200 text-center sm:text-right shrink-0">
                <span className="text-[11px] text-slate-500 block font-medium">
                  {t.wristbandCount}
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-600">
                  {scannedBooking.seat_count} {lang === 'th' ? 'เส้น' : 'bands'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Check-ins Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            {t.recentCheckins}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {checkedInList.length} {lang === 'th' ? 'รายการที่เข้างานแล้ว' : 'attendees verified'}
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">{t.thBookingCode}</th>
                <th className="py-2.5 px-3">{t.thParent}</th>
                <th className="py-2.5 px-3">{t.thStudent}</th>
                <th className="py-2.5 px-3">{t.thTableSeats}</th>
                <th className="py-2.5 px-3">{t.thTime}</th>
                <th className="py-2.5 px-3 text-right">{t.thActor}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checkedInList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {lang === 'th' ? 'ยังไม่มีรายการเช็กอิน' : 'No check-in records yet'}
                  </td>
                </tr>
              ) : (
                checkedInList.slice(0, 10).map((b) => (
                  <tr key={b.booking_uuid} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      #{b.booking_code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {b.parent_first_name} {b.parent_last_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {b.student_first_name} ({b.level_name}/{b.room})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {t.tableNumShort} {b.table_number} ({b.is_whole_table ? (lang === 'th' ? 'เหมา' : 'Whole') : b.seat_labels.join(',')})
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {b.checked_in_at || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {b.checked_in_by || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
