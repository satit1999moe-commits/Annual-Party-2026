import React, { useState, useEffect } from 'react';
import { EventData, StudentClass, PaymentStatus, Role } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import { X, Sparkles, AlertCircle, Upload, CheckCircle2, RotateCcw } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  classes: StudentClass[];
  prefilledTable?: number;
  prefilledSeats?: string[];
  isWholeTablePrefilled?: boolean;
  currentStaffName: string;
  onBookingSuccess: () => void;
  lang?: Language;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  event,
  classes,
  prefilledTable = 1,
  prefilledSeats = ['A'],
  isWholeTablePrefilled = false,
  currentStaffName,
  onBookingSuccess,
  lang = 'th',
}) => {
  const t = translations[lang];

  // Form states
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactNote, setContactNote] = useState('');

  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [levelId, setLevelId] = useState('P1');
  const [room, setRoom] = useState('A');
  const [program, setProgram] = useState<'TP' | 'EP'>('TP');

  const [tableNumber, setTableNumber] = useState(prefilledTable);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(prefilledSeats);
  const [isWholeTable, setIsWholeTable] = useState(isWholeTablePrefilled);

  const [notes, setNotes] = useState('');
  const [slipFileUrl, setSlipFileUrl] = useState('');
  const [initialPaymentStatus, setInitialPaymentStatus] = useState<PaymentStatus>('รอการชำระเงิน');
  const [paymentMethod, setPaymentMethod] = useState<string>('โอนเงินผ่านธนาคาร');

  const [loading, setLoading] = useState(false);
  const [savingAction, setSavingAction] = useState<'save_and_next' | 'save_and_close' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const firstInputRef = React.useRef<HTMLInputElement>(null);

  // Reset all booking input fields completely for the next customer
  const resetForm = () => {
    setParentFirstName('');
    setParentLastName('');
    setPhone('');
    setEmail('');
    setContactNote('');
    setStudentFirstName('');
    setStudentLastName('');
    setLevelId('P1');
    setRoom('A');
    setProgram('TP');
    setNotes('');
    setSlipFileUrl('');
    setInitialPaymentStatus('รอการชำระเงิน');
    setPaymentMethod('โอนเงินผ่านธนาคาร');
    setErrorMessage(null);
  };

  // Close and reset form
  const handleClose = () => {
    resetForm();
    setSuccessBanner(null);
    onClose();
  };

  // Sync prefilled props & reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setSuccessBanner(null);
      if (prefilledTable) setTableNumber(prefilledTable);
      if (prefilledSeats && prefilledSeats.length > 0) setSelectedSeats(prefilledSeats);
      setIsWholeTable(isWholeTablePrefilled);
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, prefilledTable, prefilledSeats, isWholeTablePrefilled]);

  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Toggle seat
  const handleToggleSeat = (seat: string) => {
    if (isWholeTable) return;
    if (selectedSeats.includes(seat)) {
      if (selectedSeats.length === 1) return;
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleToggleWholeTable = () => {
    if (!isWholeTable) {
      setIsWholeTable(true);
      setSelectedSeats(seatLetters);
    } else {
      setIsWholeTable(false);
      setSelectedSeats(['A']);
    }
  };

  // Pricing calculation
  const calculatedAmount = isWholeTable || selectedSeats.length === (event.seats_per_table || 8)
    ? event.table_price
    : selectedSeats.length * event.seat_price;

  // Grade level options
  const gradeLevels = [
    { id: 'NUR', name: 'Nursery' },
    { id: 'K1', name: 'Kindergarten 1' },
    { id: 'K2', name: 'Kindergarten 2' },
    { id: 'K3', name: 'Kindergarten 3' },
    { id: 'P1', name: 'Primary 1' },
    { id: 'P2', name: 'Primary 2' },
    { id: 'P3', name: 'Primary 3' },
    { id: 'P4', name: 'Primary 4' },
    { id: 'P5', name: 'Primary 5' },
    { id: 'P6', name: 'Primary 6' },
    { id: 'S1', name: 'Secondary 1' },
    { id: 'S2', name: 'Secondary 2' },
    { id: 'S3', name: 'Secondary 3' },
    { id: 'S4', name: 'Secondary 4' },
    { id: 'S5', name: 'Secondary 5' },
    { id: 'S6', name: 'Secondary 6' },
  ];

  const currentLevelObj = gradeLevels.find((g) => g.id === levelId);

  const executeBooking = async (closeAfterSave: boolean) => {
    setErrorMessage(null);

    // Validation
    if (!parentFirstName.trim() || !parentLastName.trim()) {
      setErrorMessage(lang === 'th' ? 'กรุณาระบุชื่อและนามสกุลของผู้ปกครอง' : 'Please provide parent first and last name');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(lang === 'th' ? 'กรุณาระบุหมายเลขโทรศัพท์ติดต่อของผู้ปกครอง' : 'Please provide parent phone number');
      return;
    }
    if (!studentFirstName.trim() || !studentLastName.trim()) {
      setErrorMessage(lang === 'th' ? 'กรุณาระบุชื่อและนามสกุลของนักเรียน' : 'Please provide student first and last name');
      return;
    }
    if (selectedSeats.length === 0) {
      setErrorMessage(lang === 'th' ? 'กรุณาเลือกที่นั่งอย่างน้อย 1 ที่นั่ง' : 'Please select at least 1 seat');
      return;
    }

    try {
      setLoading(true);
      setSavingAction(closeAfterSave ? 'save_and_close' : 'save_and_next');
      
      const compositeContactNote = [contactNote.trim(), paymentMethod ? `วิธีชำระ: ${paymentMethod}` : '']
        .filter(Boolean)
        .join(' | ');

      const newBooking = await api.createBooking({
        event_id: event.event_id,
        parent_first_name: parentFirstName.trim(),
        parent_last_name: parentLastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        contact_note: compositeContactNote,
        student_first_name: studentFirstName.trim(),
        student_last_name: studentLastName.trim(),
        level_id: levelId,
        level_name: currentLevelObj ? currentLevelObj.name : levelId,
        room,
        program,
        table_number: tableNumber,
        seat_labels: selectedSeats,
        is_whole_table: isWholeTable,
        notes: notes.trim(),
        created_by: currentStaffName,
        slip_file_url: slipFileUrl.trim(),
        initial_payment_status: initialPaymentStatus,
      });

      // Clear the form fields immediately so no stale customer data remains
      resetForm();
      setSelectedSeats([]);
      setIsWholeTable(false);
      onBookingSuccess();

      if (closeAfterSave) {
        onClose();
      } else {
        // Prepare immediately for the next customer
        setSuccessBanner(
          lang === 'th'
            ? `บันทึกการจองสำเร็จ (#${newBooking.booking_code})! ระบบได้ล้างฟอร์มเรียบร้อยแล้ว พร้อมกรอกข้อมูลผู้จองคนถัดไปได้ทันที`
            : `Booking #${newBooking.booking_code} saved! Form cleared and ready for the next customer.`
        );
        setTimeout(() => {
          firstInputRef.current?.focus();
        }, 100);
      }
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกการจอง' : 'Failed to save booking'));
    } finally {
      setLoading(false);
      setSavingAction(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeBooking(true);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-2xl my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Title Bar (Solid Navy) */}
        <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white">
                {t.newBookingTitle}
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {lang === 'th' ? event.event_name_th : event.event_name_en} · {t.creatorStaff} <span className="text-white font-semibold">{currentStaffName}</span>
              </p>
            </div>
          </div>

          {/* Prominent Window Close Button */}
          <button
            onClick={handleClose}
            aria-label={t.closeModal}
            title={`${t.closeModal} (Esc / X)`}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-6">
          {successBanner && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start justify-between gap-2.5 text-xs text-emerald-900 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{lang === 'th' ? 'สำเร็จเรียบร้อย:' : 'Success:'}</p>
                  <p className="mt-0.5 text-emerald-800">{successBanner}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuccessBanner(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
                title="ปิดการแจ้งเตือน"
              >
                ✕
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{lang === 'th' ? 'ไม่สามารถบันทึกการจองได้:' : 'Cannot save booking:'}</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Section 1: Table & Seat Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t.sectionTableSeats}
              </div>
              <button
                type="button"
                onClick={handleToggleWholeTable}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  isWholeTable
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {t.wholeTableDiscount}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.tableNumberLabel}
                </label>
                <input
                  type="number"
                  min={1}
                  max={event.total_tables || 120}
                  value={tableNumber}
                  onChange={(e) => setTableNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.selectedSeatsLabel} ({selectedSeats.length} {lang === 'th' ? 'ที่นั่ง' : 'seats'})
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {seatLetters.map((letter) => {
                    const isSelected = selectedSeats.includes(letter);
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => handleToggleSeat(letter)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-2xs ring-2 ring-slate-900'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price Preview */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {isWholeTable
                  ? (lang === 'th' ? 'เหมาทั้งโต๊ะ 8 ที่นั่ง (ส่วนลดพิเศษ)' : 'Whole Table (Special Flat Rate)')
                  : `${selectedSeats.length} ${lang === 'th' ? 'ที่นั่ง' : 'seats'} × ${event.seat_price.toLocaleString()} ${t.baht}`}
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {t.totalPrice} {calculatedAmount.toLocaleString()} {t.baht}
              </span>
            </div>
          </div>

          {/* Section 2: Parent Information */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t.sectionParentInfo}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.parentFirstName} <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  autoComplete="off"
                  placeholder={lang === 'th' ? 'เช่น กิตติศักดิ์' : 'e.g. Kittisak'}
                  value={parentFirstName}
                  onChange={(e) => {
                    setParentFirstName(e.target.value);
                    if (successBanner) setSuccessBanner(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.parentLastName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder={lang === 'th' ? 'เช่น วรเดช' : 'e.g. Woradej'}
                  value={parentLastName}
                  onChange={(e) => {
                    setParentLastName(e.target.value);
                    if (successBanner) setSuccessBanner(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.parentPhone} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  autoComplete="off"
                  placeholder="081-456-7890"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (successBanner) setSuccessBanner(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.parentEmail}
                </label>
                <input
                  type="email"
                  autoComplete="off"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.parentContactNote}
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Line ID: dr_kittisak หรือ ความสัมพันธ์"
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Student Information */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t.sectionStudentInfo}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.studentFirstName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder={lang === 'th' ? 'เช่น กวิน' : 'e.g. Kawin'}
                  value={studentFirstName}
                  onChange={(e) => {
                    setStudentFirstName(e.target.value);
                    if (successBanner) setSuccessBanner(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.studentLastName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder={lang === 'th' ? 'เช่น วรเดช' : 'e.g. Woradej'}
                  value={studentLastName}
                  onChange={(e) => {
                    setStudentLastName(e.target.value);
                    if (successBanner) setSuccessBanner(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.studentGrade}
                </label>
                <select
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  {gradeLevels.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.studentRoom}
                  </label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="A">{lang === 'th' ? 'ห้อง A' : 'Room A'}</option>
                    <option value="B">{lang === 'th' ? 'ห้อง B' : 'Room B'}</option>
                    <option value="C">{lang === 'th' ? 'ห้อง C' : 'Room C'}</option>
                    <option value="D">{lang === 'th' ? 'ห้อง D' : 'Room D'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.studentProgram}
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value as 'TP' | 'EP')}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold"
                  >
                    <option value="TP">TP (Thai Program)</option>
                    <option value="EP">EP (English Program)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Payment Status & Proof of Transfer */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t.sectionPaymentInfo}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.paymentStatusLabel}
                </label>
                <select
                  value={initialPaymentStatus}
                  onChange={(e) => setInitialPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
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
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {lang === 'th' ? 'ช่องทางการชำระเงิน' : 'Payment Method'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                >
                  <option value="โอนเงินผ่านธนาคาร">{lang === 'th' ? 'โอนเงินผ่านธนาคาร (Bank Transfer)' : 'Bank Transfer'}</option>
                  <option value="เงินสด">{lang === 'th' ? 'เงินสด (Cash)' : 'Cash'}</option>
                  <option value="พร้อมเพย์">{lang === 'th' ? 'พร้อมเพย์ (PromptPay)' : 'PromptPay'}</option>
                  <option value="บัตรเครดิต">{lang === 'th' ? 'บัตรเครดิต (Credit Card)' : 'Credit Card'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Internal Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t.sectionNotes}
            </label>
            <textarea
              rows={2}
              placeholder={t.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSuccessBanner(null);
                  firstInputRef.current?.focus();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={lang === 'th' ? 'ล้างข้อมูลที่กรอกทั้งหมดเพื่อเริ่มใหม่' : 'Clear form fields'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'th' ? 'ล้างฟอร์ม' : 'Clear Form'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Secondary Submit: Save & Book Next Customer */}
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  executeBooking(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-98 border border-slate-300 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-2xs"
                title={lang === 'th' ? 'บันทึกรายการนี้แล้วล้างฟอร์มทันทีเพื่อเตรียมกรอกคนถัดไป' : 'Save and immediately clear form for next booking'}
              >
                {loading && savingAction === 'save_and_next' ? (
                  <>{t.savingBooking}</>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{lang === 'th' ? 'บันทึก & จองคนถัดไปทันที' : 'Save & Book Next'}</span>
                  </>
                )}
              </button>

              {/* Primary Submit: Save and Close */}
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  executeBooking(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0a192f] hover:bg-[#162d4e] active:scale-98 disabled:opacity-50 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {loading && savingAction === 'save_and_close' ? (
                  <>{t.savingBooking}</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.confirmBookingBtn} ({calculatedAmount.toLocaleString()} {t.baht})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
