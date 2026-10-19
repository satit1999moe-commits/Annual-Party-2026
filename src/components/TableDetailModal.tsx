import React, { useState } from 'react';
import { Seat, Role, Booking } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import { Users, Check, Lock, Sparkles, X, AlertCircle, Trash2, AlertTriangle, Phone, MessageCircle } from 'lucide-react';

interface TableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  seats: Seat[];
  onStartBooking: (tableNumber: number, selectedSeats: string[], isWholeTable: boolean) => void;
  role: Role;
  bookings: Booking[];
  seatPrice: number;
  tablePrice: number;
  onFindNextAvailableTable?: (currentTable: number) => void;
  onRefresh?: () => void;
  currentStaffName?: string;
  lang?: Language;
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  seats,
  onStartBooking,
  role,
  bookings,
  seatPrice,
  tablePrice,
  onFindNextAvailableTable,
  onRefresh,
  currentStaffName = 'Admin',
  lang = 'th',
}) => {
  const t = translations[lang];
  const [selectedSeatLabels, setSelectedSeatLabels] = useState<string[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const isParent = role === 'Parent';
  const isAdmin = role === 'Super Admin' || role === 'Event Admin';

  // Reset selected seats when table opens
  React.useEffect(() => {
    setSelectedSeatLabels([]);
  }, [tableNumber, isOpen]);

  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  // Active bookings on this table (strictly based on table_number and active status)
  const tableBookings = React.useMemo(() => {
    return (bookings || []).filter(
      (b) => Number(b.table_number) === Number(tableNumber) && b.booking_status !== 'Cancelled'
    );
  }, [tableNumber, bookings]);

  const bookedLetterMap = React.useMemo(() => {
    const map = new Map<string, string>(); // letter -> booking_uuid
    for (const b of tableBookings) {
      for (const sl of b.seat_labels || []) {
        map.set(String(sl).trim().toUpperCase(), b.booking_uuid);
      }
    }
    return map;
  }, [tableBookings]);

  const tableSeats = seatLetters.map((letter) => {
    const s = seats.find((item) => item.seat_label === letter);
    const bookingUuidFromBooking = bookedLetterMap.get(letter);
    const isBooked = s?.seat_status === 'Booked' || Boolean(bookingUuidFromBooking);
    return {
      label: letter,
      status: (isBooked ? 'Booked' : 'Available') as 'Booked' | 'Available',
      bookingUuid: s?.booking_uuid || bookingUuidFromBooking,
    };
  });

  const availableSeats = tableSeats.filter((s) => s.status === 'Available');
  const bookedSeats = tableSeats.filter((s) => s.status === 'Booked');
  const isFullyBooked = availableSeats.length === 0;
  const isAllVacant = bookedSeats.length === 0;

  // Admin cancellation handler
  const handleCancelBooking = async (b: Booking) => {
    const defaultReason = lang === 'th' ? 'แอดมินยกเลิกรายการจองและปล่อยที่นั่งคืนระบบ' : 'Admin cancelled booking and freed seats';
    const reason = prompt(
      lang === 'th'
        ? `ยืนยันยกเลิกการจอง #${b.booking_code} (${b.parent_first_name} ${b.parent_last_name})?\nกรุณาระบุเหตุผลในการยกเลิก:`
        : `Confirm cancel booking #${b.booking_code}?\nPlease enter cancellation reason:`,
      defaultReason
    );

    if (reason === null) return; // User cancelled prompt

    try {
      setIsCancelling(true);
      await api.cancelBooking(b.booking_uuid, reason.trim() || defaultReason, currentStaffName);
      alert(
        lang === 'th'
          ? `ยกเลิกการจองรหัส #${b.booking_code} และปล่อยที่นั่งคืนระบบเรียบร้อยแล้ว`
          : `Booking #${b.booking_code} cancelled and seats returned to available.`
      );
      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error cancelling booking');
    } finally {
      setIsCancelling(false);
    }
  };

  // Toggle individual seat selection
  const handleToggleSeat = (label: string, status: string) => {
    if (isParent || status === 'Booked') return;
    if (selectedSeatLabels.includes(label)) {
      setSelectedSeatLabels(selectedSeatLabels.filter((l) => l !== label));
    } else {
      setSelectedSeatLabels([...selectedSeatLabels, label]);
    }
  };

  // Select whole table
  const handleSelectWholeTable = () => {
    if (isParent) return;
    if (isAllVacant) {
      setSelectedSeatLabels(seatLetters);
    } else {
      setSelectedSeatLabels(availableSeats.map((s) => s.label));
    }
  };

  // Calculate pricing
  const isWholeTableSelected = selectedSeatLabels.length === 8 && isAllVacant;
  const calculatedTotal = isWholeTableSelected
    ? tablePrice
    : selectedSeatLabels.length * seatPrice;

  const handleProceed = () => {
    if (selectedSeatLabels.length === 0) return;
    onStartBooking(tableNumber, selectedSeatLabels, isWholeTableSelected);
    onClose();
  };

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-lg my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Solid Navy Window Header with Prominent Close Button */}
        <div className="px-5 sm:px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-xs">
              <span className="font-mono font-bold text-amber-400 text-sm">{tableNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold font-mono tracking-tight text-white">
                  {t.tableNum} {tableNumber}
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    isFullyBooked
                      ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                      : isAllVacant
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                      : 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                  }`}
                >
                  {isFullyBooked
                    ? t.fullTable
                    : isAllVacant
                    ? t.allVacantTable
                    : `${t.seatAvailable} ${availableSeats.length}/8 ${lang === 'th' ? 'ที่' : 'seats'}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {t.tableCapacityDesc
                  .replace('{seatPrice}', seatPrice.toLocaleString())
                  .replace('{tablePrice}', tablePrice.toLocaleString())}
              </p>
            </div>
          </div>

          {/* Prominent Window Close Button */}
          <button
            onClick={onClose}
            aria-label={t.closeModal}
            title={`${t.closeModal} (Esc / X)`}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Visual Round Table Layout */}
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 mx-auto flex items-center justify-center select-none">
            {/* Round Table Center */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-100 border-2 border-slate-300 flex flex-col items-center justify-center shadow-inner z-10 text-center p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROUND TABLE</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 leading-none">{tableNumber}</span>
              <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                {availableSeats.length}/8 {lang === 'th' ? 'ว่าง' : 'free'}
              </span>
            </div>

            {/* 8 Round Seats positioned radially around table */}
            {tableSeats.map((seat, index) => {
              const angle = (index * 360) / 8 - 90;
              const rad = (angle * Math.PI) / 180;
              const radius = 95; // Radius in pixels for center of seats
              const x = radius * Math.cos(rad);
              const y = radius * Math.sin(rad);

              const isSelected = selectedSeatLabels.includes(seat.label);
              const isBooked = seat.status === 'Booked';
              const b = isBooked && seat.bookingUuid ? bookings.find((item) => item.booking_uuid === seat.bookingUuid) : null;
              const bookingCode = b ? b.booking_code : '';

              return (
                <button
                  key={seat.label}
                  type="button"
                  disabled={isParent || isBooked}
                  onClick={() => handleToggleSeat(seat.label, seat.status)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-10 h-10 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    isSelected
                      ? 'bg-blue-600 text-white ring-4 ring-blue-300 scale-105 z-20'
                      : isBooked
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed border border-slate-400'
                      : 'bg-emerald-50 text-emerald-800 border-2 border-emerald-500 hover:bg-emerald-100 cursor-pointer hover:scale-105'
                  }`}
                  title={`${t.seatAvailable} ${seat.label}: ${isBooked ? `${t.seatBooked} ${bookingCode ? `(#${bookingCode})` : ''}` : t.seatAvailable}`}
                >
                  <span className="leading-none">{seat.label}</span>
                  {isBooked ? (
                    <Lock className="w-2.5 h-2.5 mt-0.5 text-slate-500" />
                  ) : isSelected ? (
                    <Check className="w-2.5 h-2.5 mt-0.5 text-white" />
                  ) : (
                    <span className="text-[8px] font-semibold leading-none mt-0.5 text-emerald-700">
                      {t.seatAvailable}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Seat Grid List & Status Breakdown */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>{t.seatsBreakdown}</span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-normal">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> {t.seatAvailable}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> {t.seatBooked}
                </span>
                {!isParent && (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> {t.seatSelected}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {tableSeats.map((s) => {
                const isBooked = s.status === 'Booked';
                const isSelected = selectedSeatLabels.includes(s.label);
                const b = !isParent && isBooked && s.bookingUuid ? bookings.find((item) => item.booking_uuid === s.bookingUuid) : null;

                return (
                  <div
                    key={s.label}
                    className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                        : isBooked
                        ? 'border-slate-200 bg-slate-100 text-slate-600'
                        : 'border-emerald-200 bg-white text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span>{s.label}</span>
                      {isBooked ? (
                        <span className="text-[10px] text-slate-500 font-normal">{t.seatBooked}</span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-normal">{t.seatAvailable}</span>
                      )}
                    </div>
                    {b && (
                      <div className="mt-1 text-[10px] text-slate-500 truncate" title={`${b.parent_first_name} (${b.student_first_name})`}>
                        #{b.booking_code} {b.parent_first_name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADMIN BOOKING CANCELLATION SECTION */}
          {isAdmin && tableBookings.length > 0 && (
            <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{lang === 'th' ? `รายการจองในโต๊ะนี้ (${tableBookings.length} รายการ)` : `Active Bookings on Table (${tableBookings.length})`}</span>
                </div>
                <span className="text-[10px] bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                  {lang === 'th' ? 'สิทธิ์แอดมิน: ยกเลิกได้' : 'Admin: Can Cancel'}
                </span>
              </div>

              <div className="space-y-2">
                {tableBookings.map((b) => (
                  <div
                    key={b.booking_uuid}
                    className="p-2.5 bg-white rounded-lg border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="leading-tight">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-blue-900">#{b.booking_code}</span>
                        <span>{b.parent_first_name} {b.parent_last_name}</span>
                        <span className="text-slate-500 text-[11px] font-normal">({b.student_first_name} {b.level_name})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {lang === 'th' ? 'ที่นั่ง:' : 'Seats:'} <span className="font-semibold text-slate-800">{b.seat_labels.join(', ')}</span> · ยอด: {b.total_amount.toLocaleString()} บาท ({b.payment_status})
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => handleCancelBooking(b)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                      title={lang === 'th' ? 'ยกเลิกการจองและปล่อยที่นั่งคืนระบบ' : 'Cancel booking and release seats'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'th' ? 'ยกเลิกการจอง' : 'Cancel'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Table Alert / Next Table Suggestion */}
          {isFullyBooked && onFindNextAvailableTable && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lang === 'th' ? 'โต๊ะนี้ไม่มีที่นั่งว่างแล้ว' : 'This table is fully booked'}</span>
              </div>
              <button
                onClick={() => onFindNextAvailableTable(tableNumber)}
                className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
              >
                {lang === 'th' ? 'ไปยังโต๊ะว่างถัดไป →' : 'Next Available Table →'}
              </button>
            </div>
          )}

          {/* Booking Channels via LINE and Phone - Parents only (Clean & High-Contrast Design) */}
          {isParent && (
            <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200 rounded-2xl space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-950">
                    {lang === 'th' ? `สนใจจองโต๊ะที่ ${tableNumber} หรือที่นั่งว่าง?` : `Want to book Table ${tableNumber}?`}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {lang === 'th' ? 'ช่องทางตรง' : 'Official Direct'}
                </span>
              </div>

              <p className="text-xs text-emerald-900/90 leading-relaxed">
                {lang === 'th'
                  ? `ผู้ปกครองสามารถแจ้งเลขโต๊ะ ${tableNumber} และชื่อนักเรียน เพื่อสำรองที่นั่งและส่งสลิปโอนเงินผ่าน LINE Official หรือโทรแจ้งเจ้าหน้าที่ได้ทันทีครับ`
                  : `Please mention Table ${tableNumber} and your student's details to reserve seats and send your payment slip via LINE Official or call us directly.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href="https://lin.ee/qunLKq0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 text-center group"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{lang === 'th' ? 'จองและส่งสลิปทาง LINE' : 'Book & Send Slip via LINE'}</span>
                </a>

                <a
                  href="tel:0863167655"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0a192f] hover:bg-[#132847] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 text-center group"
                >
                  <Phone className="w-4 h-4 text-emerald-300 shrink-0 transition-transform group-hover:scale-110" />
                  <span>086-316-7655</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-800/80 font-mono text-center pt-1 border-t border-emerald-200/60">
                <span>LINE: https://lin.ee/qunLKq0</span>
                <span>•</span>
                <span>โทร. 086-316-7655</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isParent ? (
          <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeModal}
              title={`${t.closeModal} (X)`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> {t.closeModal}
            </button>
          </div>
        ) : (
          <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isAllVacant && (
                <button
                  type="button"
                  onClick={handleSelectWholeTable}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {t.bookWholeTableBtn}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-medium">
                  {t.selectSeatsPrompt.replace('{count}', String(selectedSeatLabels.length))}
                </div>
                <div className="text-sm font-bold font-mono text-slate-900">
                  {calculatedTotal.toLocaleString()} {t.baht}
                </div>
              </div>

              <button
                type="button"
                disabled={selectedSeatLabels.length === 0}
                onClick={handleProceed}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0f223d] hover:bg-[#162d4e] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer"
              >
                {t.proceedBookingBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
