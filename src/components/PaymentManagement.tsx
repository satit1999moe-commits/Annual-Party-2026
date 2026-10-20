import React, { useState } from 'react';
import { Booking, EventData, Role, PaymentStatus } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileCheck,
  Search,
  Filter,
  Download,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { formatThaiDateTime, getPaymentCountdown } from '../utils/dateUtils';

interface PaymentManagementProps {
  bookings: Booking[];
  event: EventData;
  role: Role;
  currentStaffName: string;
  onRefresh: () => void;
  lang?: Language;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  bookings,
  event,
  role,
  currentStaffName,
  onRefresh,
  lang = 'th',
}) => {
  const t = translations[lang];
  const [filterStatus, setFilterStatus] = useState<string>('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected booking for verification modal
  const [verifyingBooking, setVerifyingBooking] = useState<Booking | null>(null);
  const [verifiedAmount, setVerifiedAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'PromptPay' | 'Bank Transfer' | 'Cash' | 'Credit Card'>('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zoom slip modal
  const [zoomedSlipUrl, setZoomedSlipUrl] = useState<string | null>(null);

  // Filter bookings
  const filtered = bookings.filter((b) => {
    if (b.booking_status === 'Cancelled') return false;

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match =
        b.booking_code.includes(q) ||
        b.parent_first_name.toLowerCase().includes(q) ||
        b.parent_last_name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        String(b.table_number) === q;
      if (!match) return false;
    }

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'UNPAID') {
      return b.payment_status === 'รอการชำระเงิน' || b.payment_status === 'รอชำระเงิน' || b.payment_status !== 'ชำระเงินแล้ว';
    }
    if (filterStatus === 'PAID') {
      return b.payment_status === 'ชำระเงินแล้ว';
    }
    return true;
  });

  // Calculate status counts
  const unpaidCount = bookings.filter(
    (b) => b.booking_status !== 'Cancelled' && (b.payment_status === 'รอการชำระเงิน' || b.payment_status === 'รอชำระเงิน' || b.payment_status !== 'ชำระเงินแล้ว')
  ).length;

  const paidCount = bookings.filter(
    (b) => b.booking_status !== 'Cancelled' && b.payment_status === 'ชำระเงินแล้ว'
  ).length;

  const handleOpenVerify = (b: Booking) => {
    setVerifyingBooking(b);
    setVerifiedAmount(b.total_amount);
    setPaymentReference('');
    setVerificationNotes('');
  };

  const handleApprove = async () => {
    if (!verifyingBooking) return;
    try {
      setIsSubmitting(true);
      await api.recordPayment(verifyingBooking.booking_code, {
        payment_status: 'ชำระเงินแล้ว',
        amount: verifiedAmount,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        verified_by: currentStaffName,
        notes: verificationNotes || (lang === 'th' ? 'ฝ่ายการเงินตรวจสอบสลิปและยอดเงินเข้าบัญชีถูกต้อง' : 'Finance verified bank slip and received funds'),
      });

      alert(lang === 'th' ? `อนุมัติการชำระเงินรหัส #${verifyingBooking.booking_code} เรียบร้อยแล้ว` : `Payment for #${verifyingBooking.booking_code} approved successfully`);
      setVerifyingBooking(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || (lang === 'th' ? 'เกิดข้อผิดพลาดในการอนุมัติ' : 'Approval failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!verifyingBooking) return;
    const reason = prompt(lang === 'th' ? 'กรุณาระบุเหตุผลที่ไม่ผ่านการตรวจสอบ:' : 'Please enter rejection reason:', lang === 'th' ? 'ยอดเงินไม่ตรง หรือสลิปซ้ำ' : 'Amount mismatch or duplicate slip');
    if (!reason) return;

    try {
      setIsSubmitting(true);
      await api.recordPayment(verifyingBooking.booking_code, {
        payment_status: 'ไม่ผ่านการตรวจสอบ',
        amount: 0,
        payment_method: paymentMethod,
        verified_by: currentStaffName,
        notes: reason,
      });

      alert(lang === 'th' ? `บันทึกปฏิเสธสลิปรหัส #${verifyingBooking.booking_code} แล้ว` : `Payment rejected for #${verifyingBooking.booking_code}`);
      setVerifyingBooking(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || (lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentStatusBadgeLabel = (status: PaymentStatus) => {
    switch (status) {
      case 'ชำระเงินแล้ว': return t.statusPaid;
      case 'รอการชำระเงิน':
      case 'รอชำระเงิน':
      case 'ส่งหลักฐานแล้ว':
      case 'รอตรวจสอบ':
      case 'ไม่ผ่านการตรวจสอบ':
        return lang === 'th' ? 'รอการชำระเงิน' : t.statusPending;
      case 'ยกเลิก': return t.statusCancelled;
      default: return status;
    }
  };

  return (
    <div className="space-y-5">
      {/* Financial Top Summary Cards (2 สถานะ: รอการชำระเงิน และ ชำระเงินแล้ว) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setFilterStatus('UNPAID')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'UNPAID'
              ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">
              {lang === 'th' ? 'รอการชำระเงิน' : 'Pending Payment'}
            </span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {unpaidCount} <span className="text-xs font-normal text-slate-500">{t.recordsUnit}</span>
          </div>
          <div className="text-[11px] text-amber-800 mt-1">
            {lang === 'th'
              ? '⏱️ มีเวลาชำระเงิน 4 ชั่วโมง หากเกินกำหนดระบบจะปล่อยที่นั่งคืน (หลุดจองอัตโนมัติ)'
              : '⏱️ 4-hour payment hold window (seats auto-released if unpaid)'}
          </div>
        </button>

        <button
          onClick={() => setFilterStatus('PAID')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'PAID'
              ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">
              {lang === 'th' ? 'ชำระเงินแล้ว' : 'Paid & Verified'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {paidCount} <span className="text-xs font-normal text-slate-500">{t.recordsUnit}</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">
            {t.paidDesc}
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchBookingsPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
          >
            <option value="ALL">{t.paymentStatusAll}</option>
            <option value="UNPAID">{lang === 'th' ? 'รอการชำระเงิน' : 'Pending Payment'} ({unpaidCount})</option>
            <option value="PAID">{lang === 'th' ? 'ชำระเงินแล้ว' : 'Paid'} ({paidCount})</option>
          </select>

          <a
            href={api.getExportCsvUrl('Payments', event.event_id)}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg whitespace-nowrap shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            {t.exportFinanceCsv}
          </a>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">{t.thBookingCode}</th>
                <th className="py-3 px-4">{t.thParent} / {t.thStudent}</th>
                <th className="py-3 px-4">{t.thTableSeats}</th>
                <th className="py-3 px-4 text-right">{t.thRequiredAmount}</th>
                <th className="py-3 px-4 text-center">{t.thSlipProof}</th>
                <th className="py-3 px-4 text-center">{t.thPaymentStatus}</th>
                <th className="py-3 px-4 text-right">{t.thVerification}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {t.noBookingsFound}
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  return (
                    <tr key={b.booking_uuid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                        #{b.booking_code}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {b.parent_first_name} {b.parent_last_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.student_first_name} ({b.level_name}/{b.room})
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-medium text-slate-900">
                          {t.tableNumShort} {b.table_number}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.is_whole_table ? (lang === 'th' ? 'เหมาทั้งโต๊ะ (8 ที่)' : 'Whole Table (8 seats)') : `${b.seat_labels.join(', ')} (${b.seat_count} ${lang === 'th' ? 'ที่' : 'seats'})`}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        {b.total_amount.toLocaleString()} {t.baht}
                      </td>

                      {/* Slip preview */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {b.slip_file_url ? (
                          <button
                            onClick={() => setZoomedSlipUrl(b.slip_file_url!)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-slate-500" /> {t.viewSlipPhoto}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">{t.noSlipAttached}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              b.payment_status === 'ชำระเงินแล้ว'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {getPaymentStatusBadgeLabel(b.payment_status)}
                          </span>


                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {b.payment_status !== 'ชำระเงินแล้ว' ? (
                          <button
                            onClick={() => handleOpenVerify(b)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            {t.reviewSlipBtn}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {t.approvedLabel}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Verify Slip and Approve Payment (Floating Popup Window) */}
      {verifyingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVerifyingBooking(null);
          }}
        >
          <div
            className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-xl my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window Title Bar */}
            <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{t.verifyPaymentModalTitle}</h3>
                  <p className="text-[11px] text-slate-300">
                    #{verifyingBooking.booking_code} · {verifyingBooking.parent_first_name} {verifyingBooking.parent_last_name}
                  </p>
                </div>
              </div>

              {/* Prominent Window Close Button */}
              <button
                onClick={() => setVerifyingBooking(null)}
                aria-label={t.closeModal}
                title={`${t.closeModal} (Esc / X)`}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{lang === 'th' ? 'ตรวจสอบยอดการชำระเงินและหลักฐานโอนเงิน' : 'Payment Verification & Audit'}</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {lang === 'th'
                      ? 'เมื่อเจ้าหน้าที่ฝ่ายการเงินตรวจสอบยอดเงินถูกต้องตรงกับระบบบัญชีธนาคารแล้ว สามารถระบุยอดเงินจริงและกดอนุมัติการชำระเงินได้ทันที'
                      : 'Once finance staff has verified the transaction against bank accounts, enter the actual received amount and click approve.'}
                  </p>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.actualAmountReceived}
                  </label>
                  <input
                    type="number"
                    value={verifiedAmount}
                    onChange={(e) => setVerifiedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {t.paymentMethodLabel}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="PromptPay">PromptPay (พร้อมเพย์)</option>
                    <option value="Bank Transfer">Bank Transfer (โอนบัญชีธนาคาร)</option>
                    <option value="Cash">Cash (เงินสดหน้างาน)</option>
                    <option value="Credit Card">Credit Card (บัตรเครดิต)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.refIdLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 20261012KTB992819"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.financeNotesLabel}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'th' ? 'เช่น ตรวจสอบกับ App KTB แล้ว ยอดเข้าสมบูรณ์' : 'e.g. Bank statement confirmed'}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-lg transition-colors cursor-pointer"
              >
                {t.rejectPaymentBtn}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyingBooking(null)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t.approvePaymentBtn} ({verifiedAmount.toLocaleString()} {t.baht})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Zoomed Slip Image with X close button */}
      {zoomedSlipUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setZoomedSlipUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white p-3 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomedSlipUrl(null)}
              aria-label={t.closeModal}
              title={`${t.closeModal} (X)`}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors border-2 border-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={zoomedSlipUrl} alt="Zoomed Slip" className="max-h-[78vh] w-auto mx-auto rounded object-contain" />
            <div className="mt-3 text-center">
              <button
                onClick={() => setZoomedSlipUrl(null)}
                className="inline-flex items-center gap-1 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> {t.closePhoto}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
