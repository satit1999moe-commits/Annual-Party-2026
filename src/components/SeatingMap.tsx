import React, { useState, useMemo } from 'react';
import { Seat, Role, Booking, EventData } from '../types';
import { TableDetailModal } from './TableDetailModal';
import { translations, Language } from '../i18n';
import { Search, Sparkles, Filter, Phone, Info, ZoomIn, ZoomOut, Columns, MessageCircle } from 'lucide-react';

interface SeatingMapProps {
  event: EventData;
  seats: Seat[];
  bookings: Booking[];
  role: Role;
  onStartBooking: (tableNumber: number, selectedSeats: string[], isWholeTable: boolean) => void;
  onRefresh?: () => void;
  currentStaffName?: string;
  lang: Language;
}

export const SeatingMap: React.FC<SeatingMapProps> = ({
  event,
  seats,
  bookings,
  role,
  onStartBooking,
  onRefresh,
  currentStaffName,
  lang,
}) => {
  const t = translations[lang];
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VACANT' | 'PARTIAL' | 'FULL'>('ALL');
  const [showSeatLetters, setShowSeatLetters] = useState<boolean>(true);
  const [tableLayoutCols, setTableLayoutCols] = useState<'10' | '5'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 640 ? '5' : '10';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isParent = role === 'Parent';
  const totalTables = event.total_tables || 120;
  const seatsPerTable = event.seats_per_table || 8;
  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Group seats by table number & reconcile with active bookings
  const tableDataMap = useMemo(() => {
    const map: Record<number, { bookedCount: number; vacantCount: number; seats: Seat[] }> = {};
    for (let i = 1; i <= totalTables; i++) {
      map[i] = { bookedCount: 0, vacantCount: 0, seats: [] };
    }

    // Build fast lookup of booked seats from active bookings
    const activeBookings = (bookings || []).filter((b) => b.booking_status !== 'Cancelled');
    const bookedKeySet = new Set<string>();
    for (const b of activeBookings) {
      const t = Number(b.table_number);
      for (const sl of b.seat_labels || []) {
        bookedKeySet.add(`${t}_${String(sl).trim().toUpperCase()}`);
      }
    }

    for (const s of seats) {
      const tNum = Number(s.table_number);
      if (tNum >= 1 && tNum <= totalTables) {
        if (!map[tNum]) {
          map[tNum] = { bookedCount: 0, vacantCount: 0, seats: [] };
        }
        const isBooked =
          s.seat_status === 'Booked' ||
          bookedKeySet.has(`${tNum}_${String(s.seat_label).trim().toUpperCase()}`);

        map[tNum].seats.push(isBooked && s.seat_status !== 'Booked' ? { ...s, seat_status: 'Booked' } : s);
        if (isBooked) {
          map[tNum].bookedCount++;
        } else {
          map[tNum].vacantCount++;
        }
      }
    }
    return map;
  }, [seats, bookings, totalTables]);

  // Overall counts for summary
  const summary = useMemo(() => {
    let vacant = 0;
    let partial = 0;
    let full = 0;
    let totalBookedSeats = 0;

    for (let tNum = 1; tNum <= totalTables; tNum++) {
      const data = tableDataMap[tNum];
      const booked = data ? data.bookedCount : 0;
      totalBookedSeats += booked;
      if (booked === 0) vacant++;
      else if (booked === seatsPerTable) full++;
      else partial++;
    }

    const totalSeats = totalTables * seatsPerTable;
    const vacantSeats = totalSeats - totalBookedSeats;

    return { vacant, partial, full, totalBookedSeats, vacantSeats, totalSeats };
  }, [tableDataMap, totalTables, seatsPerTable]);

  // Find next available table automatically
  const handleFindNextAvailable = (fromTable: number) => {
    for (let tNum = fromTable + 1; tNum <= totalTables; tNum++) {
      const data = tableDataMap[tNum];
      if (data && data.bookedCount < seatsPerTable) {
        setSelectedTableNumber(tNum);
        setToastMessage(t.autoAdvanceNotice.replace('{table}', String(tNum)));
        setTimeout(() => setToastMessage(null), 3500);
        return;
      }
    }
    for (let tNum = 1; tNum < fromTable; tNum++) {
      const data = tableDataMap[tNum];
      if (data && data.bookedCount < seatsPerTable) {
        setSelectedTableNumber(tNum);
        setToastMessage(t.autoAdvanceNotice.replace('{table}', String(tNum)));
        setTimeout(() => setToastMessage(null), 3500);
        return;
      }
    }
    setToastMessage(t.noVacantTableNotice);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper for table status styling
  const getTableAppearance = (tableNum: number) => {
    const data = tableDataMap[tableNum];
    const booked = data ? data.bookedCount : 0;

    if (booked === 0) {
      // Green: all vacant
      return {
        tableBg: 'bg-emerald-50 border-emerald-400 text-emerald-950',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        chairAvailable: 'bg-emerald-500 border-emerald-600 text-white',
        chairBooked: 'bg-slate-300 border-slate-400 text-slate-600',
        statusText: `${t.seatAvailable} 8`,
        statusKey: 'VACANT',
      };
    } else if (booked >= seatsPerTable) {
      // Deep Navy: fully booked
      return {
        tableBg: 'bg-slate-900 border-slate-950 text-white shadow-xs',
        badgeBg: 'bg-slate-800 text-slate-300',
        chairAvailable: 'bg-emerald-500 border-emerald-600 text-white',
        chairBooked: 'bg-slate-700 border-slate-800 text-slate-300',
        statusText: t.fullTable,
        statusKey: 'FULL',
      };
    } else {
      // Gray: partially booked
      return {
        tableBg: 'bg-slate-100 border-slate-300 text-slate-800',
        badgeBg: 'bg-slate-200 text-slate-700',
        chairAvailable: 'bg-emerald-500 border-emerald-600 text-white',
        chairBooked: 'bg-slate-400 border-slate-500 text-white',
        statusText: `${t.seatsRemainingFraction} ${seatsPerTable - booked}`,
        statusKey: 'PARTIAL',
      };
    }
  };

  // Filter tables
  const displayedTables = useMemo(() => {
    const list: number[] = [];
    const q = searchTableQuery.trim();

    for (let tNum = 1; tNum <= totalTables; tNum++) {
      const data = tableDataMap[tNum];
      const booked = data ? data.bookedCount : 0;
      let statusKey: 'VACANT' | 'PARTIAL' | 'FULL' = 'PARTIAL';
      if (booked === 0) statusKey = 'VACANT';
      else if (booked >= seatsPerTable) statusKey = 'FULL';

      if (filterStatus !== 'ALL' && filterStatus !== statusKey) {
        continue;
      }

      if (q && !String(tNum).includes(q)) {
        continue;
      }

      list.push(tNum);
    }
    return list;
  }, [totalTables, tableDataMap, filterStatus, searchTableQuery, seatsPerTable]);

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Parent Welcome & Booking Guide Banner (Clean, Modern, Simple & Beautiful) */}
      {isParent && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Main Hero Header */}
          <div className="bg-[#0a192f] text-white p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 text-xs font-semibold border border-amber-400/25">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{lang === 'th' ? 'ผังที่นั่งสดแบบเรียลไทม์ · สำหรับผู้ปกครอง' : 'Live Seating Map · For Parents & Guests'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {lang === 'th' ? event.event_name_th : event.event_name_en} ({event.event_year})
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                  <span>📍 {event.venue === 'สนามกีฬาโรงเรียน' && lang === 'en' ? 'School Sports Stadium' : event.venue}</span>
                  <span>⏰ {event.start_time} - {event.end_time} {lang === 'th' ? 'น.' : ''}</span>
                  <span>🪑 {lang === 'th' ? '120 โต๊ะกลม (โต๊ะละ 8 ที่นั่ง)' : '120 Round Tables (8 seats/table)'}</span>
                </p>
              </div>

              {/* Direct Booking Action Box */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 lg:max-w-xs w-full space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    {lang === 'th' ? 'จองโต๊ะและส่งสลิปโอนเงิน' : 'Book Table & Send Slip'}
                  </span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                    {lang === 'th' ? 'เปิดรับจอง' : 'Open'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-0.5">
                  <a
                    href="https://lin.ee/qunLKq0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer active:scale-95 text-center"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>{lang === 'th' ? 'จองผ่าน LINE Official' : 'Book via LINE Official'}</span>
                  </a>
                  <a
                    href="tel:0863167655"
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer active:scale-95 text-center"
                  >
                    <Phone className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>086-316-7655</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Simple 3-Step Guide Strip for Parents */}
          <div className="bg-slate-50/80 px-4 sm:px-6 py-3.5 border-t border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-900">{lang === 'th' ? 'เลือกดูเลขโต๊ะ' : 'Pick a Table'}</div>
                  <div className="text-[11px] text-slate-500">{lang === 'th' ? 'คลิกที่โต๊ะสีเขียวเพื่อดูที่นั่งว่าง A–H' : 'Click any green table to see vacant seats'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-900">{lang === 'th' ? 'แจ้งจองผ่าน LINE / โทร' : 'Book via LINE / Call'}</div>
                  <div className="text-[11px] text-slate-500">{lang === 'th' ? 'แจ้งเลขโต๊ะและชื่อนักเรียนกับเจ้าหน้าที่' : 'Tell staff your table number & student info'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-900">{lang === 'th' ? 'แนบสลิปโอนเงิน' : 'Submit Transfer Slip'}</div>
                  <div className="text-[11px] text-slate-500">{lang === 'th' ? 'ส่งหลักฐานทาง LINE เพื่อรับการยืนยันทันที' : 'Send slip in LINE to receive confirmation'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar: Stats bar + Search + Filter + Color Legend + Toggle */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="text-emerald-800 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              {t.allVacantTable}
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-950 mt-1">
              {summary.vacant} <span className="text-xs font-normal text-emerald-700">{lang === 'th' ? 'โต๊ะ' : 'tables'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
              {t.partialTable}
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {summary.partial} <span className="text-xs font-normal text-slate-500">{lang === 'th' ? 'โต๊ะ' : 'tables'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a192f] text-white border border-[#172b4d]">
            <div className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
              {t.fullTable}
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {summary.full} <span className="text-xs font-normal text-slate-400">{lang === 'th' ? 'โต๊ะ' : 'tables'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200">
            <div className="text-blue-800 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              {t.remainingSeats}
            </div>
            <div className="text-2xl font-bold font-mono text-blue-950 mt-1">
              {summary.vacantSeats.toLocaleString()} <span className="text-xs font-normal text-blue-700">/ {summary.totalSeats} {lang === 'th' ? 'ที่' : 'seats'}</span>
            </div>
          </div>
        </div>

        {/* Filter, Search, Seats Toggle and Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Search Table */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchTablePlaceholder}
              value={searchTableQuery}
              onChange={(e) => setSearchTableQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium shrink-0 overflow-x-auto scrollbar-none max-w-full">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer text-xs ${
                filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setFilterStatus('VACANT')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer text-xs ${
                filterStatus === 'VACANT' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterVacant} ({summary.vacant})
            </button>
            <button
              onClick={() => setFilterStatus('PARTIAL')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer text-xs ${
                filterStatus === 'PARTIAL' ? 'bg-slate-500 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterPartial} ({summary.partial})
            </button>
            <button
              onClick={() => setFilterStatus('FULL')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer text-xs ${
                filterStatus === 'FULL' ? 'bg-slate-900 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterFull} ({summary.full})
            </button>
          </div>

          {/* View Density / Columns Selector & Seats Detail Toggle */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 10 cols vs 5 cols Density Toggle */}
            <button
              onClick={() => setTableLayoutCols(tableLayoutCols === '10' ? '5' : '10')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                tableLayoutCols === '5'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title={
                tableLayoutCols === '10'
                  ? 'สลับเป็นผัง 5 โต๊ะ/แถว (ขนาดโต๊ะใหญ่ สัมผัสง่ายสำหรับมือถือ/iPad)'
                  : 'สลับเป็นผัง 10 โต๊ะ/แถว (มุมมองกว้างทั้งฮอลล์)'
              }
            >
              <Columns className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {tableLayoutCols === '10'
                  ? (lang === 'th' ? 'ผัง 10 โต๊ะ/แถว' : '10 Tables/Row')
                  : (lang === 'th' ? 'ผัง 5 โต๊ะ/แถว (ขยายใหญ่)' : '5 Tables/Row (Large)')}
              </span>
            </button>

            {/* Seat Letters Toggle Button */}
            <button
              onClick={() => setShowSeatLetters(!showSeatLetters)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                showSeatLetters
                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {showSeatLetters ? <ZoomIn className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <ZoomOut className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
              <span>{showSeatLetters ? t.viewModeDetailed : t.viewModeStandard}</span>
            </button>

            {/* Color Legend */}
            <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0 pl-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600"></span>
                <span className="text-[11px]">{t.seatAvailable}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-500"></span>
                <span className="text-[11px]">{t.seatBooked}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE & SEATING FLOOR PLAN (RESPONSIVE NO-HORIZONTAL-SCROLL GRID) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 sm:p-5 lg:p-6 w-full">
        {/* Front Stage Banner (Solid Navy) */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="relative py-3 sm:py-3.5 px-4 sm:px-6 bg-[#0f223d] text-white text-center rounded-xl shadow-md border-2 border-[#1c3860]">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 tracking-widest uppercase">
                {t.stageSub}
              </span>
              <span className="text-xs sm:text-base md:text-lg font-bold tracking-wide">
                {t.stageTitle}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-300 mt-0.5">
                {t.stageDirection}
              </span>
            </div>
          </div>

          <div className="text-center mt-2 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
            <span>{t.rowNearStage}</span>
            <span>↓</span>
            <span>{t.rowBack}</span>
          </div>
        </div>

        {/* 120 Round Banquet Tables Layout (Flexible 10 or 5 Columns per Row) */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5 w-full">
          {Array.from({ length: tableLayoutCols === '5' ? 24 : 12 }).map((_, rowIndex) => {
            const is5Cols = tableLayoutCols === '5';
            const tablesPerRow = is5Cols ? 5 : 10;
            const startTable = rowIndex * tablesPerRow + 1;
            const rowTables = Array.from({ length: tablesPerRow }).map((_, c) => startTable + c);

            // Row Label
            const mainRowNumber = is5Cols ? Math.floor(rowIndex / 2) + 1 : rowIndex + 1;
            const rowLabel = is5Cols
              ? (lang === 'th' ? `แถว ${mainRowNumber}-${rowIndex % 2 === 0 ? 'A' : 'B'}` : `R${mainRowNumber}-${rowIndex % 2 === 0 ? 'A' : 'B'}`)
              : (lang === 'th' ? `แถว ${mainRowNumber}` : `R${mainRowNumber}`);

            return (
              <div key={rowIndex} className="flex items-center gap-1 sm:gap-2 w-full">
                {/* Row Label */}
                <div className="w-12 sm:w-16 shrink-0 text-right pr-1">
                  <span className="text-[9px] sm:text-xs font-mono font-bold text-slate-400 whitespace-nowrap">
                    {rowLabel}
                  </span>
                </div>

                {/* Banquet Tables in Row */}
                <div
                  className={`grid ${
                    is5Cols
                      ? 'grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3.5'
                      : 'grid-cols-10 gap-1 sm:gap-1.5 md:gap-2 lg:gap-3'
                  } flex-1 w-full`}
                >
                  {rowTables.map((tableNum) => {
                    const isVisible = displayedTables.includes(tableNum);
                    const style = getTableAppearance(tableNum);
                    const data = tableDataMap[tableNum];
                    const booked = data ? data.bookedCount : 0;
                    const vacant = seatsPerTable - booked;

                    // 8 seats status
                    const tableSeatList = seatLetters.map((letter) => {
                      const s = data?.seats.find((item) => item.seat_label === letter);
                      return {
                        label: letter,
                        isBooked: s?.seat_status === 'Booked',
                      };
                    });

                    return (
                      <div
                        key={tableNum}
                        className={`w-full aspect-square flex items-center justify-center ${
                          !isVisible ? 'opacity-20 grayscale pointer-events-none' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedTableNumber(tableNum)}
                          className={`group relative w-full h-full ${
                            is5Cols ? 'max-w-[120px] max-h-[120px]' : 'max-w-[96px] max-h-[96px]'
                          } mx-auto flex items-center justify-center cursor-pointer transition-transform hover:scale-110 focus:outline-none select-none active:scale-95`}
                          title={`${t.tableNum} ${tableNum}: ${t.seatAvailable} ${vacant}/8 ${lang === 'th' ? 'ที่' : 'seats'}`}
                        >
                          {/* Round Banquet Table Center */}
                          <div
                            className={`w-[54%] h-[54%] rounded-full border-2 flex flex-col items-center justify-center shadow-xs transition-colors z-10 ${style.tableBg}`}
                          >
                            <span
                              className={`font-mono font-extrabold leading-none ${
                                is5Cols ? 'text-xs sm:text-base md:text-lg' : 'text-[9px] sm:text-xs md:text-sm'
                              }`}
                            >
                              {tableNum}
                            </span>
                            <span
                              className={`${
                                is5Cols
                                  ? 'text-[8px] sm:text-[10px] md:text-xs px-1 sm:px-1.5'
                                  : 'text-[7px] sm:text-[8px] md:text-[9px] px-0.5 sm:px-1'
                              } font-bold leading-tight mt-0.5 rounded-full ${style.badgeBg}`}
                            >
                              {booked === 0
                                ? lang === 'th'
                                  ? 'ว่าง 8'
                                  : '8 free'
                                : booked === 8
                                ? lang === 'th'
                                  ? 'เต็ม'
                                  : 'full'
                                : `${vacant}`}
                            </span>
                          </div>

                          {/* 8 Round Chairs Encircled Around Table */}
                          {tableSeatList.map((seatItem, seatIndex) => {
                            const angle = (seatIndex * 360) / 8 - 90;
                            const rad = (angle * Math.PI) / 180;
                            const leftPct = 50 + 38 * Math.cos(rad);
                            const topPct = 50 + 38 * Math.sin(rad);

                            return (
                              <div
                                key={seatItem.label}
                                style={{
                                  left: `${leftPct}%`,
                                  top: `${topPct}%`,
                                }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                                  is5Cols ? 'w-[24%] h-[24%]' : 'w-[22%] h-[22%]'
                                } rounded-full flex items-center justify-center font-bold shadow-2xs transition-transform group-hover:scale-105 z-20 ${
                                  seatItem.isBooked
                                    ? style.chairBooked
                                    : style.chairAvailable
                                }`}
                                title={`${t.seatAvailable} ${seatItem.label}: ${seatItem.isBooked ? t.seatBooked : t.seatAvailable}`}
                              >
                                {showSeatLetters ? (
                                  <span
                                    className={`leading-none ${
                                      is5Cols ? 'text-[8px] sm:text-[10px] md:text-xs' : 'text-[7px] sm:text-[8px] md:text-[9px]'
                                    }`}
                                  >
                                    {seatItem.label}
                                  </span>
                                ) : (
                                  <span className="w-1 h-1 rounded-full bg-white/70" />
                                )}
                              </div>
                            );
                          })}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Table Details & Seat Selection */}
      {selectedTableNumber !== null && (
        <TableDetailModal
          isOpen={true}
          onClose={() => setSelectedTableNumber(null)}
          tableNumber={selectedTableNumber}
          seats={seats.filter((s) => Number(s.table_number) === Number(selectedTableNumber))}
          onStartBooking={onStartBooking}
          role={role}
          bookings={bookings}
          seatPrice={event.seat_price}
          tablePrice={event.table_price}
          onFindNextAvailableTable={handleFindNextAvailable}
          onRefresh={onRefresh}
          currentStaffName={currentStaffName}
          lang={lang}
        />
      )}
    </div>
  );
};
