import React, { useState } from 'react';
import { Booking, EventData, Role, PaymentStatus } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import {
  Search,
  Filter,
  Printer,
  Edit2,
  Trash2,
  FileText,
  Eye,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Download,
  Calendar,
  X,
  CreditCard,
  User,
  FileSpreadsheet,
  Ban,
  Zap,
} from 'lucide-react';
import { exportBookingsListToExcel } from '../utils/excelExport';
import { formatThaiDateTime, getPaymentCountdown } from '../utils/dateUtils';

interface BookingsListProps {
  bookings: Booking[];
  event: EventData;
  role: Role;
  currentStaffName: string;
  onRefresh: () => void;
  onPrintTicket: (booking: Booking) => void;
  onOpenBookingModal: () => void;
  onEditBooking: (booking: Booking) => void;
  lang?: Language;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  event,
  role,
  currentStaffName,
  onRefresh,
  onPrintTicket,
  onOpenBookingModal,
  onEditBooking,
  lang = 'th',
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  // Cancel modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Receive Payment modal state (เปลี่ยนสถานะเป็น ชำระเงินแล้ว)
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'PromptPay' | 'Bank Transfer' | 'Credit Card'>('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Permanent Delete modal state
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // Quick Edit modal state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({
    parent_first_name: '',
    parent_last_name: '',
    phone: '',
    email: '',
    student_first_name: '',
    student_last_name: '',
    room: '',
    notes: '',
    payment_status: 'รอการชำระเงิน' as PaymentStatus,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Instant notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View details modal state
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match =
        b.booking_code.toLowerCase().includes(q) ||
        b.parent_first_name.toLowerCase().includes(q) ||
        b.parent_last_name.toLowerCase().includes(q) ||
        b.student_first_name.toLowerCase().includes(q) ||
        b.student_last_name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        String(b.table_number) === q;
      if (!match) return false;
    }

    if (statusFilter !== 'ALL' && b.booking_status !== statusFilter) return false;
    if (paymentFilter !== 'ALL') {
      if (paymentFilter === 'รอการชำระเงิน' || paymentFilter === 'รอชำระเงิน') {
        if (b.payment_status !== 'รอการชำระเงิน' && b.payment_status !== 'รอชำระเงิน') return false;
      } else if (b.payment_status !== paymentFilter) {
        return false;
      }
    }
    if (gradeFilter !== 'ALL' && b.level_id !== gradeFilter) return false;

    return true;
  });

  const handleConfirmPayment = async () => {
    if (!payingBooking) return;
    try {
      setIsSubmittingPayment(true);
      await api.recordPayment(payingBooking.booking_uuid, {
        payment_status: 'ชำระเงินแล้ว',
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim(),
        verified_by: currentStaffName,
        notes: paymentNotes.trim() || (lang === 'th' ? 'รับชำระเงินและปรับสถานะเป็นชำระเงินแล้ว' : 'Marked as paid'),
        amount: payingBooking.total_amount,
      });
      setToastMessage(
        lang === 'th'
          ? `⚡ อัปเดตสถานะการจอง #${payingBooking.booking_code} เป็น "ชำระเงินแล้ว" เรียบร้อย พร้อมซิงก์ Google Sheets อัตโนมัติทันที`
          : `Booking #${payingBooking.booking_code} marked as Paid & auto-synced to Google Sheets`
      );
      setPayingBooking(null);
      setPaymentReference('');
      setPaymentNotes('');
      setTimeout(() => setToastMessage(null), 5000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating payment status');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    if (!cancelReason.trim()) {
      alert(lang === 'th' ? 'กรุณาระบุเหตุผลในการยกเลิก' : 'Please provide cancellation reason');
      return;
    }

    try {
      setIsSubmittingCancel(true);
      await api.cancelBooking(cancellingBooking.booking_uuid, cancelReason.trim(), currentStaffName);
      setToastMessage(
        lang === 'th'
          ? `⚡ ยกเลิกรายการจอง #${cancellingBooking.booking_code} เรียบร้อย พร้อมซิงก์ฐานข้อมูล Google Sheets อัตโนมัติทันที`
          : `Cancelled booking #${cancellingBooking.booking_code} and synced to Google Sheets immediately`
      );
      setCancellingBooking(null);
      setCancelReason('');
      setTimeout(() => setToastMessage(null), 5000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error cancelling booking');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBooking) return;
    try {
      setIsSubmittingDelete(true);
      const res = await api.deleteBooking(
        deletingBooking.booking_uuid,
        currentStaffName,
        deleteReason.trim() || 'ลบข้อมูลการจองออกจากระบบ'
      );
      setToastMessage(
        lang === 'th'
          ? `⚡ ลบรายการจอง #${deletingBooking.booking_code} ออกจากระบบและคืนที่นั่งเรียบร้อย พร้อมซิงก์ Google Sheets อัตโนมัติทันที`
          : res.message
      );
      setDeletingBooking(null);
      setDeleteReason('');
      setTimeout(() => setToastMessage(null), 5000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting booking');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleStartEdit = (b: Booking) => {
    setEditingBooking(b);
    setEditForm({
      parent_first_name: b.parent_first_name || '',
      parent_last_name: b.parent_last_name || '',
      phone: b.phone || '',
      email: b.email || '',
      student_first_name: b.student_first_name || '',
      student_last_name: b.student_last_name || '',
      room: b.room || '',
      notes: b.notes || '',
      payment_status: (b.payment_status === 'ชำระเงินแล้ว' ? 'ชำระเงินแล้ว' : 'รอการชำระเงิน') as PaymentStatus,
    });
  };

  const handleConfirmEdit = async () => {
    if (!editingBooking) return;
    try {
      setIsSubmittingEdit(true);
      await api.updateBooking(editingBooking.booking_uuid, {
        ...editForm,
        updated_by: currentStaffName,
      });
      setToastMessage(
        lang === 'th'
          ? `⚡ แก้ไขข้อมูลการจอง #${editingBooking.booking_code} สำเร็จ พร้อมซิงก์ Google Sheets อัตโนมัติทันที`
          : `Updated booking #${editingBooking.booking_code} and synced to Google Sheets immediately`
      );
      setEditingBooking(null);
      setEditForm({
        parent_first_name: '',
        parent_last_name: '',
        phone: '',
        email: '',
        student_first_name: '',
        student_last_name: '',
        room: '',
        notes: '',
        payment_status: 'รอการชำระเงิน',
      });
      setTimeout(() => setToastMessage(null), 5000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating booking');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'ชำระเงินแล้ว':
        return t.statusPaid;
      case 'รอการชำระเงิน':
      case 'รอชำระเงิน':
      case 'ส่งหลักฐานแล้ว':
      case 'รอตรวจสอบ':
      case 'ไม่ผ่านการตรวจสอบ':
        return lang === 'th' ? 'รอการชำระเงิน' : t.statusPending;
      case 'ยกเลิก':
        return t.statusCancelled;
      default:
        return status;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'ชำระเงินแล้ว':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'รอการชำระเงิน':
      case 'รอชำระเงิน':
      case 'ส่งหลักฐานแล้ว':
      case 'รอตรวจสอบ':
      case 'ไม่ผ่านการตรวจสอบ':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      case 'ยกเลิก':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Real-time Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-[#0a192f] text-white shadow-xl border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-emerald-300">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Realtime Auto-Sync Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-emerald-700 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-emerald-950">
                {lang === 'th' ? '⚡ ระบบบันทึกและซิงก์ข้อมูลอัตโนมัติทันที (Realtime Auto-Sync)' : '⚡ Realtime Master Auto-Sync Active'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                LIVE SYNC
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              {lang === 'th'
                ? 'ทุกการเพิ่ม, ลบ, หรือแก้ไขข้อมูลในระบบ จะถูกบันทึกและอัปเดตลง Google Sheets ทันทีโดยอัตโนมัติ ไม่ต้องกดซิงก์จากหน้าต่างแอดมิน'
                : 'All additions, deletions, and edits are automatically saved and synced to Google Sheets in realtime'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-900 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200/80 self-start sm:self-auto shrink-0 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
          <span>ชีต: 181fGpCP7...</span>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {t.bookingsTitle} ({filteredBookings.length} {lang === 'th' ? 'รายการ' : 'records'})
            </h2>
            <p className="text-xs text-slate-500">
              {t.bookingsSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportBookingsListToExcel(filteredBookings, event, lang)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer active:scale-95"
              title={lang === 'th' ? 'ดาวน์โหลดรายการจองที่กรองเป็นไฟล์ Excel (.xlsx)' : 'Download filtered bookings as Excel (.xlsx)'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              <span>{lang === 'th' ? 'ส่งออก Excel (.xlsx)' : 'Export Excel (.xlsx)'}</span>
            </button>

            <a
              href={api.getExportCsvUrl('Bookings', event.event_id)}
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              {t.exportCsv}
            </a>

            <button
              onClick={onOpenBookingModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0f223d] hover:bg-[#162d4e] rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            >
              {t.newBookingBtn}
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchBookingsPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
            />
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
            >
              <option value="ALL">{t.paymentStatusAll}</option>
              <option value="รอการชำระเงิน">{lang === 'th' ? 'รอการชำระเงิน' : 'Pending Payment'}</option>
              <option value="ชำระเงินแล้ว">{lang === 'th' ? 'ชำระเงินแล้ว' : 'Paid'}</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="ALL">{t.bookingStatusAll}</option>
              <option value="Confirmed">{lang === 'th' ? 'ยืนยันแล้ว (Confirmed)' : 'Confirmed'}</option>
              <option value="Cancelled">{lang === 'th' ? 'ยกเลิกแล้ว (Cancelled)' : 'Cancelled'}</option>
            </select>
          </div>

          <div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="ALL">{t.gradeAll}</option>
              <option value="NUR">Nursery</option>
              <option value="K1">Kindergarten 1</option>
              <option value="K2">Kindergarten 2</option>
              <option value="K3">Kindergarten 3</option>
              <option value="P1">Primary 1</option>
              <option value="P2">Primary 2</option>
              <option value="P3">Primary 3</option>
              <option value="P4">Primary 4</option>
              <option value="P5">Primary 5</option>
              <option value="P6">Primary 6</option>
              <option value="S1">Secondary 1</option>
              <option value="S2">Secondary 2</option>
              <option value="S3">Secondary 3</option>
              <option value="S4">Secondary 4</option>
              <option value="S5">Secondary 5</option>
              <option value="S6">Secondary 6</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">{t.thBookingCode}</th>
                <th className="py-3 px-4">{t.thParent}</th>
                <th className="py-3 px-4">{t.thStudent}</th>
                <th className="py-3 px-4">{t.thTableSeats}</th>
                <th className="py-3 px-4 text-right">{t.thAmount}</th>
                <th className="py-3 px-4 text-center">{t.thPaymentStatus}</th>
                <th className="py-3 px-4 text-center">{t.thCheckin}</th>
                <th className="py-3 px-4 text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {t.noBookingsFound}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isCancelled = b.booking_status === 'Cancelled';
                  return (
                    <tr
                      key={b.booking_uuid}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCancelled ? 'bg-slate-50/40 opacity-70' : ''
                      }`}
                    >
                      {/* Booking Code */}
                      <td className="py-3 px-4 font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBookingDetails(b)}
                          className="hover:text-blue-600 underline underline-offset-2 cursor-pointer"
                        >
                          #{b.booking_code}
                        </button>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {b.parent_first_name} {b.parent_last_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {b.phone}
                        </div>
                      </td>

                      {/* Student */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">
                          {b.student_first_name} {b.student_last_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.level_name} /{b.room} ({b.program})
                        </div>
                      </td>

                      {/* Table & Seats */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono">
                          {t.tableNumShort} {b.table_number}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.is_whole_table
                            ? (lang === 'th' ? 'เหมาโต๊ะ (8 ที่ A-H)' : 'Whole Table (A-H)')
                            : `${b.seat_labels.join(', ')} (${b.seat_count} ${lang === 'th' ? 'ที่' : 'seats'})`}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        {b.total_amount.toLocaleString()} {t.baht}
                      </td>

                      {/* Payment Status Badge & Quick Change Action */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPaymentBadge(
                              b.payment_status
                            )}`}
                          >
                            {getPaymentStatusText(b.payment_status)}
                          </span>

                          {/* 4-Hour Payment Countdown & Mark as Paid Action for Unpaid Bookings */}
                          {!isCancelled &&
                            (b.payment_status === 'รอการชำระเงิน' ||
                              b.payment_status === 'รอชำระเงิน' ||
                              b.payment_status !== 'ชำระเงินแล้ว') && (
                              <div className="flex flex-col items-center mt-1">
                                {(() => {
                                  const cd = getPaymentCountdown(b.created_at, 4);
                                  if (cd.isExpired) {
                                    return (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                        <AlertCircle className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                                        <span>{lang === 'th' ? 'หมดเวลา (หลุดจอง)' : 'Expired'}</span>
                                      </span>
                                    );
                                  }
                                  return (
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                        cd.remainingHours < 1
                                          ? 'text-rose-700 bg-rose-50 border border-rose-200 animate-pulse'
                                          : 'text-amber-800 bg-amber-50 border border-amber-200'
                                      }`}
                                      title={
                                        lang === 'th'
                                          ? 'หากไม่ชำระภายใน 4 ชั่วโมง ที่นั่งจะหลุดจองอัตโนมัติ'
                                          : '4-hour payment window'
                                      }
                                    >
                                      <Clock className="w-2.5 h-2.5 shrink-0" />
                                      <span>
                                        {lang === 'th' ? `เหลือ ${cd.formattedTh}` : `Left ${cd.formattedEn}`}
                                      </span>
                                    </span>
                                  );
                                })()}

                                {/* Action to change status from รอชำระเงิน to ชำระเงินแล้ว */}
                                <button
                                  onClick={() => {
                                    setPayingBooking(b);
                                    setPaymentMethod('Cash');
                                    setPaymentReference('');
                                    setPaymentNotes('');
                                  }}
                                  className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-2xs transition-all cursor-pointer"
                                  title={
                                    lang === 'th'
                                      ? 'บันทึกรับชำระเงิน / เปลี่ยนสถานะเป็น ชำระเงินแล้ว'
                                      : 'Mark as Paid'
                                  }
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>{lang === 'th' ? 'ชำระเงินแล้ว' : 'Mark as Paid'}</span>
                                </button>
                              </div>
                            )}

                          {b.payment_status === 'ชำระเงินแล้ว' && (
                            <span className="mt-1 text-[10px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>{lang === 'th' ? 'เรียบร้อย' : 'Verified'}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Check-in Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {b.check_in_status ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> {t.checkedInBadge}
                          </span>
                        ) : isCancelled ? (
                          <span className="text-[11px] text-slate-400">-</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">{t.notCheckedInBadge}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onPrintTicket(b)}
                            title={lang === 'th' ? 'พิมพ์ใบยืนยันการจอง / บัตรเข้างาน' : 'Print ticket'}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSelectedBookingDetails(b)}
                            title={lang === 'th' ? 'ดูรายละเอียดการจอง' : 'View details'}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isCancelled && (
                            <button
                              onClick={() => handleStartEdit(b)}
                              title={lang === 'th' ? 'แก้ไขข้อมูลผู้จอง (บันทึกและซิงก์ทันที)' : 'Quick edit booking info'}
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {!isCancelled && (
                            <button
                              onClick={() => setCancellingBooking(b)}
                              title={lang === 'th' ? 'ยกเลิกรายการจอง (ปล่อยที่นั่งคืน)' : 'Cancel booking'}
                              className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeletingBooking(b)}
                            title={lang === 'th' ? 'ลบรายการจองถาวรออกจากระบบ (ลบและซิงก์ชีตทันที)' : 'Permanently delete booking'}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: View Details (Floating Popup Window) */}
      {selectedBookingDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBookingDetails(null);
          }}
        >
          <div
            className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-lg my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window Title Bar (Solid Navy) */}
            <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-xs">
                  <span className="font-mono font-bold text-amber-400 text-xs">#{selectedBookingDetails.booking_code}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono tracking-tight text-white">
                    {lang === 'th' ? `รายละเอียดการจอง #${selectedBookingDetails.booking_code}` : `Booking Details #${selectedBookingDetails.booking_code}`}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {lang === 'th' ? 'ข้อมูลผู้ปกครอง นักเรียน โต๊ะ และสถานะการชำระเงิน' : 'Parent, student, table, and payment status details'}
                  </p>
                </div>
              </div>

              {/* Prominent Window Close Button */}
              <button
                onClick={() => setSelectedBookingDetails(null)}
                aria-label={t.closeModal}
                title={`${t.closeModal} (Esc / X)`}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'ผู้ปกครอง:' : 'Parent:'}</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedBookingDetails.parent_first_name} {selectedBookingDetails.parent_last_name}
                  </div>
                  <div className="text-slate-600 font-mono mt-0.5">{selectedBookingDetails.phone}</div>
                  {selectedBookingDetails.email && (
                    <div className="text-slate-500 mt-0.5">{selectedBookingDetails.email}</div>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'นักเรียน:' : 'Student:'}</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedBookingDetails.student_first_name} {selectedBookingDetails.student_last_name}
                  </div>
                  <div className="text-slate-700 mt-0.5">
                    {selectedBookingDetails.level_name} {selectedBookingDetails.room}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {selectedBookingDetails.program === 'EP' ? 'English Program (EP)' : 'Thai Program (TP)'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'โต๊ะและที่นั่ง:' : 'Table & Seats:'}</span>
                  <div className="font-bold text-slate-900 mt-0.5 font-mono text-sm">
                    {t.tableNum} {selectedBookingDetails.table_number}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {selectedBookingDetails.is_whole_table
                      ? (lang === 'th' ? 'เหมาโต๊ะ 8 ที่นั่ง (A-H)' : 'Whole Table (A-H)')
                      : `${selectedBookingDetails.seat_labels.join(', ')}`}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'การเงิน:' : 'Payment:'}</span>
                  <div className="font-bold text-slate-900 mt-0.5 font-mono text-sm">
                    {selectedBookingDetails.total_amount.toLocaleString()} {t.baht}
                  </div>
                  <div className="mt-0.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentBadge(
                        selectedBookingDetails.payment_status
                      )}`}
                    >
                      {getPaymentStatusText(selectedBookingDetails.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBookingDetails.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'หมายเหตุภายใน:' : 'Notes:'}</span>
                  <p className="text-slate-800 mt-0.5">{selectedBookingDetails.notes}</p>
                </div>
              )}

              {selectedBookingDetails.slip_file_url && (
                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 font-medium block mb-2">{lang === 'th' ? 'สลิปหลักฐานการโอน:' : 'Payment Slip:'}</span>
                  <img
                    src={selectedBookingDetails.slip_file_url}
                    alt="Slip"
                    className="max-h-48 rounded-lg border border-slate-200 object-contain mx-auto"
                  />
                </div>
              )}

              {/* Thai Booking Creation Timestamp */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {lang === 'th' ? 'วันที่บันทึกการจอง (เวลาไทย):' : 'Booking Recorded At:'}
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {lang === 'th' ? formatThaiDateTime(selectedBookingDetails.created_at) : selectedBookingDetails.created_at}
                </span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onPrintTicket(selectedBookingDetails);
                    setSelectedBookingDetails(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0f223d] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {lang === 'th' ? 'พิมพ์ใบยืนยันบัตร' : 'Print Ticket Pass'}
                </button>

                {selectedBookingDetails.booking_status !== 'Cancelled' &&
                  (selectedBookingDetails.payment_status === 'รอการชำระเงิน' ||
                    selectedBookingDetails.payment_status === 'รอชำระเงิน' ||
                    selectedBookingDetails.payment_status !== 'ชำระเงินแล้ว') && (
                    <button
                      onClick={() => {
                        const b = selectedBookingDetails;
                        setSelectedBookingDetails(null);
                        setPayingBooking(b);
                        setPaymentMethod('Cash');
                        setPaymentReference('');
                        setPaymentNotes('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{lang === 'th' ? 'ชำระเงินแล้ว' : 'Mark as Paid'}</span>
                    </button>
                  )}

                {(role === 'Super Admin' || role === 'Event Admin') && selectedBookingDetails.booking_status !== 'Cancelled' && (
                  <button
                    onClick={() => {
                      setCancellingBooking(selectedBookingDetails);
                      setSelectedBookingDetails(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'th' ? 'ยกเลิกการจอง' : 'Cancel Booking'}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {t.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancel Confirmation (Floating Popup Window) */}
      {cancellingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCancellingBooking(null);
          }}
        >
          <div
            className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-md my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window Title Bar */}
            <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {lang === 'th' ? 'ยืนยันการยกเลิกรายการจอง' : 'Confirm Booking Cancellation'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    ปล่อยที่นั่งคืนระบบและบันทึกประวัติการยกเลิก
                  </p>
                </div>
              </div>

              {/* Prominent Window Close Button */}
              <button
                onClick={() => setCancellingBooking(null)}
                aria-label={t.closeModal}
                title={`${t.closeModal} (Esc / X)`}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                {lang === 'th' ? 'คุณกำลังจะยกเลิกการจองรหัส' : 'You are cancelling booking'}{' '}
                <span className="font-mono font-bold text-slate-900">
                  #{cancellingBooking.booking_code}
                </span>{' '}
                ({cancellingBooking.parent_first_name} {cancellingBooking.parent_last_name})
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'th' ? 'ระบุเหตุผลในการยกเลิก *' : 'Cancellation Reason *'}
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {isSubmittingCancel ? '...' : (lang === 'th' ? 'ยืนยันยกเลิกรายการ' : 'Confirm Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Permanent Delete Booking (Removes from system, frees seats, auto-syncs) */}
      {deletingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingBooking(null);
          }}
        >
          <div
            className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-md my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title Bar */}
            <div className="px-6 py-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center shadow-xs">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {lang === 'th' ? 'ยืนยันการลบรายการจองถาวร' : 'Confirm Permanent Deletion'}
                  </h3>
                  <p className="text-[11px] text-rose-200">
                    {lang === 'th' ? 'ลบข้อมูลและซิงก์ Google Sheets อัตโนมัติทันที' : 'Delete and auto-sync immediately'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDeletingBooking(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>คำเตือน: การลบรายการจองนี้จะลบออกจากระบบอย่างถาวร</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  รหัสการจอง <span className="font-mono font-bold">#{deletingBooking.booking_code}</span> (โต๊ะ {deletingBooking.table_number} ที่นั่ง {deletingBooking.seat_labels.join(', ')})
                  จะถูกลบออกจากฐานข้อมูลและคืนที่นั่งว่างทันที และระบบจะส่งคำสั่งลบไปยัง Google Sheets อัตโนมัติทันที
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'th' ? 'ระบุเหตุผลในการลบ (ถ้ามี)' : 'Deletion Reason (optional)'}
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder={lang === 'th' ? 'เช่น ผู้ปกครองสละสิทธิ์, ข้อมูลซ้ำซ้อน, ล้างข้อมูล' : 'e.g., duplicated, cancelled'}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingBooking(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {isSubmittingDelete ? 'กำลังลบ...' : (lang === 'th' ? 'ยืนยันลบถาวรทันที' : 'Permanently Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Quick Edit Booking Details (Auto-syncs immediately upon save) */}
      {editingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingBooking(null);
          }}
        >
          <div
            className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-lg my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title Bar */}
            <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shadow-xs">
                  <Edit2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {lang === 'th' ? `แก้ไขข้อมูลการจอง #${editingBooking.booking_code}` : `Edit Booking #${editingBooking.booking_code}`}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {lang === 'th' ? 'บันทึกและส่งข้อมูลเข้า Google Sheets ทันที' : 'Saves and auto-syncs to Google Sheets'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingBooking(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Edit Form Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {lang === 'th' ? 'ชื่อผู้ปกครอง *' : 'Parent First Name *'}
                  </label>
                  <input
                    type="text"
                    value={editForm.parent_first_name}
                    onChange={(e) => setEditForm({ ...editForm, parent_first_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {lang === 'th' ? 'นามสกุลผู้ปกครอง *' : 'Parent Last Name *'}
                  </label>
                  <input
                    type="text"
                    value={editForm.parent_last_name}
                    onChange={(e) => setEditForm({ ...editForm, parent_last_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {lang === 'th' ? 'เบอร์โทรศัพท์ *' : 'Phone *'}
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {lang === 'th' ? 'อีเมล' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {lang === 'th' ? 'ชื่อนักเรียน *' : 'Student First Name *'}
                  </label>
                  <input
                    type="text"
                    value={editForm.student_first_name}
                    onChange={(e) => setEditForm({ ...editForm, student_first_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {lang === 'th' ? 'นามสกุลนักเรียน *' : 'Student Last Name *'}
                  </label>
                  <input
                    type="text"
                    value={editForm.student_last_name}
                    onChange={(e) => setEditForm({ ...editForm, student_last_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'th' ? 'ห้องเรียน' : 'Room'}
                </label>
                <input
                  type="text"
                  value={editForm.room}
                  onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                  placeholder="เช่น A, B, 1"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'th' ? 'สถานะการชำระเงิน *' : 'Payment Status *'}
                </label>
                <select
                  value={editForm.payment_status}
                  onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value as PaymentStatus })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                >
                  <option value="รอการชำระเงิน">
                    {lang === 'th' ? 'รอการชำระเงิน (มีเวลาชำระเงิน 4 ชั่วโมง)' : 'Pending Payment (4-hour hold)'}
                  </option>
                  <option value="ชำระเงินแล้ว">
                    {lang === 'th' ? 'ชำระเงินแล้ว' : 'Paid & Verified'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'th' ? 'หมายเหตุ' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                <span>เมื่อกดบันทึก ข้อมูลจะถูกอัปเดตลงฐานข้อมูลและส่งต่อไปยัง Google Sheets ทันทีโดยอัตโนมัติ</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                disabled={isSubmittingEdit}
                onClick={handleConfirmEdit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {isSubmittingEdit ? 'กำลังบันทึก...' : (lang === 'th' ? 'บันทึกและซิงก์ทันที' : 'Save & Sync')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Receive Payment (เปลี่ยนสถานะจาก รอการชำระเงิน เป็น ชำระเงินแล้ว) */}
      {payingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPayingBooking(null);
          }}
        >
          <div
            className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-md my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title Bar */}
            <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {lang === 'th' ? `รับชำระเงิน #${payingBooking.booking_code}` : `Receive Payment #${payingBooking.booking_code}`}
                  </h3>
                  <p className="text-[11px] text-emerald-300">
                    {lang === 'th' ? 'เปลี่ยนสถานะเป็น "ชำระเงินแล้ว" และซิงก์ Google Sheets ทันที' : 'Mark as paid and sync to Google Sheets'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPayingBooking(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Booking Summary */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'รหัสการจอง:' : 'Booking Code:'}</span>
                  <span className="font-mono font-bold text-sm text-slate-900">#{payingBooking.booking_code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'ผู้ปกครอง:' : 'Parent:'}</span>
                  <span className="font-bold text-slate-800">{payingBooking.parent_first_name} {payingBooking.parent_last_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'นักเรียน:' : 'Student:'}</span>
                  <span className="text-slate-800">{payingBooking.student_first_name} ({payingBooking.level_name})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">{lang === 'th' ? 'โต๊ะ / ที่นั่ง:' : 'Table / Seats:'}</span>
                  <span className="font-semibold text-slate-800">
                    {lang === 'th' ? `โต๊ะ ${payingBooking.table_number} (${payingBooking.seat_labels.join(', ')})` : `T.${payingBooking.table_number} (${payingBooking.seat_labels.join(', ')})`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">{lang === 'th' ? 'ยอดที่ต้องชำระ:' : 'Total Amount:'}</span>
                  <span className="font-mono font-bold text-base text-emerald-700">
                    {payingBooking.total_amount.toLocaleString()} {lang === 'th' ? 'บาท' : 'THB'}
                  </span>
                </div>
              </div>

              {/* Payment Form Fields */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'th' ? 'ช่องทางการชำระเงิน *' : 'Payment Method *'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                >
                  <option value="Cash">{lang === 'th' ? '💵 เงินสด (Cash)' : 'Cash'}</option>
                  <option value="PromptPay">{lang === 'th' ? '📱 พร้อมเพย์ (PromptPay)' : 'PromptPay'}</option>
                  <option value="Bank Transfer">{lang === 'th' ? '🏦 โอนเงินผ่านธนาคาร (Bank Transfer)' : 'Bank Transfer'}</option>
                  <option value="Credit Card">{lang === 'th' ? '💳 บัตรเครดิต (Credit Card)' : 'Credit Card'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'th' ? 'เลขอ้างอิง / สลิป (ถ้ามี)' : 'Reference / Slip No. (Optional)'}
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={lang === 'th' ? 'เช่น เลขทำรายการ หรือ เลขที่สลิป' : 'e.g. TXN123456'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'th' ? 'หมายเหตุเพิ่มเติม (ถ้ามี)' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder={lang === 'th' ? 'เช่น รับเงินสดหน้างานครบถ้วน' : 'e.g. Paid in full at front desk'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'th' ? 'เมื่อกดยืนยัน ระบบจะเปลี่ยนสถานะเป็น "ชำระเงินแล้ว" ทันที และซิงก์ Google Sheets อัตโนมัติ' : 'Status will be updated to Paid and auto-synced to Google Sheets immediately'}</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayingBooking(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                disabled={isSubmittingPayment}
                onClick={handleConfirmPayment}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmittingPayment ? (lang === 'th' ? 'กำลังบันทึก...' : 'Saving...') : (lang === 'th' ? 'ยืนยันรับชำระเงิน (เป็นชำระเงินแล้ว)' : 'Confirm Paid')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
