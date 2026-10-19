import React, { useState, useEffect, useCallback } from 'react';
import {
  EventData,
  Booking,
  Seat,
  StaffUser,
  StudentClass,
  AuditLog,
  SystemSetting,
  DashboardStats,
  Role,
} from './types';
import { api } from './services/api';
import { translations, Language } from './i18n';
import { Header } from './components/Header';
import { SeatingMap } from './components/SeatingMap';
import { BookingsList } from './components/BookingsList';
import { PaymentManagement } from './components/PaymentManagement';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { BookingModal } from './components/BookingModal';
import { PrintableTicket } from './components/PrintableTicket';
import { PrintableManifest } from './components/PrintableManifest';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { EventSettingsModal } from './components/EventSettingsModal';
import { StaffManagement } from './components/StaffManagement';
import { AuditLogViewer } from './components/AuditLogViewer';
import { StaffLoginModal } from './components/StaffLoginModal';
import {
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  Shield,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';

export default function App() {
  // State
  const [events, setEvents] = useState<EventData[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>('EV2026');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [classesList, setClassesList] = useState<StudentClass[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Navigation & Role State (Default to Parent view for public security)
  const [currentTab, setCurrentTab] = useState<string>('map');
  const [currentRole, setCurrentRole] = useState<Role>('Parent');
  const [currentStaffUser, setCurrentStaffUser] = useState<StaffUser | null>(null);
  const [lang, setLang] = useState<Language>('th');
  const t = translations[lang];

  // Loading & Sync states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingModalKey, setBookingModalKey] = useState<number>(0);
  const [prefilledTable, setPrefilledTable] = useState<number>(1);
  const [prefilledSeats, setPrefilledSeats] = useState<string[]>(['A']);
  const [isWholeTablePrefilled, setIsWholeTablePrefilled] = useState<boolean>(false);

  const [printingTicketBooking, setPrintingTicketBooking] = useState<Booking | null>(null);
  const [isPrintManifestOpen, setIsPrintManifestOpen] = useState<boolean>(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [isEventSettingsModalOpen, setIsEventSettingsModalOpen] = useState<boolean>(false);

  // Active event object
  const activeEvent = events.find((e) => e.event_id === activeEventId) || events[0] || {
    event_id: 'EV2026',
    event_year: 2026,
    event_name_th: 'งานเลี้ยงประจำปีโรงเรียนสาธิตอุดมศึกษา',
    event_name_en: 'Satit Udomseuksa School Annual Party',
    promo_title: 'ANNUAL PARTY 2026',
    theme: 'MONOCHROME',
    event_date: '2026-12-18',
    start_time: '18:00',
    end_time: '22:00',
    venue: 'สนามกีฬาโรงเรียน',
    total_tables: 120,
    seats_per_table: 8,
    seat_price: 850,
    table_price: 6500,
    sales_open_at: '2026-11-01 08:00:00',
    sales_close_at: '2026-12-15 23:59:59',
    event_status: 'Active',
    refund_policy: 'บัตรที่ยืนยันการขายแล้วไม่สามารถคืนเงินได้ เว้นแต่ผู้ดูแลระบบกำหนดข้อยกเว้น',
    created_at: '2026-10-12 10:00:00',
    updated_at: '2026-10-12 10:00:00',
  };

  // Active staff name mapped to currentRole
  const currentStaffName = React.useMemo(() => {
    if (currentRole === 'Parent' || !currentStaffUser) {
      return lang === 'th' ? 'ผู้ปกครอง (Guest)' : 'Parent / Guest';
    }
    return currentStaffUser.display_name;
  }, [currentRole, currentStaffUser, lang]);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [eventsData, staffData, classesData, settingsData] = await Promise.all([
        api.getEvents(),
        api.getStaff(),
        api.getClasses(),
        api.getSettings(),
      ]);

      setEvents(eventsData);
      setStaffList(staffData);
      setClassesList(classesData);
      setSettings(settingsData);

      const targetEventId = activeEventId || eventsData[0]?.event_id || 'EV2026';
      if (!activeEventId) {
        setActiveEventId(targetEventId);
      }
      const [seatsData, bookingsData, statsData, logsData] = await Promise.all([
        api.getSeats(targetEventId),
        api.getBookings(targetEventId),
        api.getStats(targetEventId),
        api.getAuditLogs(targetEventId),
      ]);

      const bookedKeySet = new Set<string>();
      (bookingsData || []).forEach((b) => {
        if (b.booking_status !== 'Cancelled') {
          const t = Number(b.table_number);
          (b.seat_labels || []).forEach((sl) => {
            bookedKeySet.add(`${t}_${String(sl).trim().toUpperCase()}`);
          });
        }
      });

      const reconciledSeats = (seatsData || []).map((s) => {
        const key = `${Number(s.table_number)}_${String(s.seat_label).trim().toUpperCase()}`;
        if (bookedKeySet.has(key)) {
          return { ...s, seat_status: 'Booked' as const };
        }
        return s;
      });

      setSeats(reconciledSeats);
      setBookings(bookingsData);
      setStats(statsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh single event data without full page reload
  const refreshEventData = useCallback(async () => {
    const targetEventId = activeEventId || events[0]?.event_id || 'EV2026';
    try {
      const [seatsData, bookingsData, statsData, logsData] = await Promise.all([
        api.getSeats(targetEventId),
        api.getBookings(targetEventId),
        api.getStats(targetEventId),
        api.getAuditLogs(targetEventId),
      ]);

      const bookedKeySet = new Set<string>();
      (bookingsData || []).forEach((b) => {
        if (b.booking_status !== 'Cancelled') {
          const t = Number(b.table_number);
          (b.seat_labels || []).forEach((sl) => {
            bookedKeySet.add(`${t}_${String(sl).trim().toUpperCase()}`);
          });
        }
      });

      const reconciledSeats = (seatsData || []).map((s) => {
        const key = `${Number(s.table_number)}_${String(s.seat_label).trim().toUpperCase()}`;
        if (bookedKeySet.has(key)) {
          return { ...s, seat_status: 'Booked' as const };
        }
        return s;
      });

      setSeats(reconciledSeats);
      setBookings(bookingsData);
      setStats(statsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed to refresh event data:', err);
    }
  }, [activeEventId, events]);

  // Handle staff login
  const handleLoginSuccess = (staff: StaffUser) => {
    setCurrentStaffUser(staff);
    setCurrentRole(staff.role);
    // If ticket staff or finance, navigate to relevant tab
    if (staff.role === 'Ticket Staff') {
      setCurrentTab('bookings');
    } else if (staff.role === 'Finance') {
      setCurrentTab('payments');
    } else {
      setCurrentTab('map');
    }
  };

  // Handle logout -> revert to Parent view
  const handleLogout = async () => {
    if (currentStaffUser) {
      const devId = localStorage.getItem('satit_device_token') || undefined;
      try {
        await api.logout(currentStaffUser.staff_id, devId);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setCurrentStaffUser(null);
    setCurrentRole('Parent');
    setCurrentTab('map');
  };

  // Start booking handler from Seating Map
  const handleStartBooking = (tableNumber: number, selectedSeatsLabels: string[], isWholeTable: boolean) => {
    setPrefilledTable(tableNumber);
    setPrefilledSeats(selectedSeatsLabels);
    setIsWholeTablePrefilled(isWholeTable);
    setBookingModalKey((prev) => prev + 1);
    setIsBookingModalOpen(true);
  };

  const isParent = currentRole === 'Parent' || !currentStaffUser;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Official Top Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={currentRole}
        currentStaffUser={currentStaffUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        activeEventName={lang === 'th' ? activeEvent.event_name_th : activeEvent.event_name_en}
        lang={lang}
        onToggleLang={() => setLang(lang === 'th' ? 'en' : 'th')}
        onOpenSheetsSync={() => setIsSheetsModalOpen(true)}
        isSyncingSheets={isSyncingSheets}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 md:px-6 py-3 sm:py-5 md:py-6 space-y-4 sm:space-y-6">
        {/* Top Control Sub-Bar: Event Selector & Year Management */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              {t.currentEventLabel}
            </span>
            <select
              value={activeEventId}
              onChange={(e) => setActiveEventId(e.target.value)}
              aria-label={t.currentEventLabel}
              className="text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer w-full sm:w-auto min-w-0 truncate"
            >
              {events.map((ev) => (
                <option key={ev.event_id} value={ev.event_id}>
                  {lang === 'th' ? ev.event_name_th : ev.event_name_en} ({ev.event_year}) - [{ev.event_status === 'Active' ? (lang === 'th' ? 'เปิดรับจอง' : 'Open for Booking') : (ev.event_status === 'Closed' ? (lang === 'th' ? 'ปิดรับจอง' : 'Closed') : (lang === 'th' ? 'แบบร่าง' : 'Draft'))}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
            {!isParent && (
              <>
                <button
                  onClick={() => setIsPrintManifestOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer active:scale-95"
                  title={t.printManifestBtn}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.printManifestBtn}</span>
                </button>

                {(currentRole === 'Super Admin' || currentRole === 'Event Admin') && (
                  <button
                    onClick={() => setIsEventSettingsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.eventSettingsBtn}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">{t.loadingData}</p>
          </div>
        ) : (
          <>
            {/* TAB 1: Seating Map (Accessible to both Parents and Staff) */}
            {currentTab === 'map' && (
              <SeatingMap
                event={activeEvent}
                seats={seats}
                bookings={bookings}
                role={currentRole}
                onStartBooking={handleStartBooking}
                onRefresh={refreshEventData}
                currentStaffName={currentStaffName}
                lang={lang}
              />
            )}

            {/* TAB 2: Bookings List (Staff only) */}
            {!isParent && currentTab === 'bookings' && (
              <BookingsList
                bookings={bookings}
                event={activeEvent}
                role={currentRole}
                currentStaffName={currentStaffName}
                onRefresh={refreshEventData}
                onPrintTicket={(b) => setPrintingTicketBooking(b)}
                onOpenBookingModal={() => {
                  setPrefilledTable(1);
                  setPrefilledSeats(['A']);
                  setIsWholeTablePrefilled(false);
                  setBookingModalKey((prev) => prev + 1);
                  setIsBookingModalOpen(true);
                }}
                onEditBooking={(b) => {
                  setPrefilledTable(b.table_number);
                  setPrefilledSeats(b.seat_labels);
                  setIsWholeTablePrefilled(b.is_whole_table);
                  setBookingModalKey((prev) => prev + 1);
                  setIsBookingModalOpen(true);
                }}
                lang={lang}
              />
            )}

            {/* TAB 3: Payment Management & Proof Review (Finance & Admin only) */}
            {!isParent && currentTab === 'payments' && (
              <PaymentManagement
                bookings={bookings}
                event={activeEvent}
                role={currentRole}
                currentStaffName={currentStaffName}
                onRefresh={refreshEventData}
                lang={lang}
              />
            )}

            {/* TAB 4: User & Admin Management (Super Admin & Event Admin) */}
            {!isParent && currentTab === 'users' && (
              <StaffManagement
                staffList={staffList}
                onRefresh={loadData}
                currentRole={currentRole}
                lang={lang}
              />
            )}

            {/* TAB 5: Dashboard & Analytics & Reports (Admin & Finance only) */}
            {!isParent && currentTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <DashboardAnalytics
                  stats={stats}
                  event={activeEvent}
                  onRefresh={refreshEventData}
                  lang={lang}
                />
                <StaffManagement
                  staffList={staffList}
                  onRefresh={loadData}
                  currentRole={currentRole}
                  lang={lang}
                />
                <AuditLogViewer logs={auditLogs} eventId={activeEvent.event_id} lang={lang} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{t.footerCopyright}</span>
            <span>·</span>
            <span>{t.systemTitleShort} © {new Date().getFullYear()}</span>
          </div>

          <div className="text-[11px] text-slate-400">
            {lang === 'th'
              ? 'ระบบบริหารจัดการการจองโต๊ะและจำหน่ายบัตรงานเลี้ยงประจำปี'
              : 'Annual Party Ticketing & Seating Management System'}
          </div>
        </div>
      </footer>

      {/* MODAL: Staff Login Modal */}
      <StaffLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        staffList={staffList}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
      />

      {/* MODAL: New Booking */}
      <BookingModal
        key={bookingModalKey}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setPrefilledTable(1);
          setPrefilledSeats(['A']);
          setIsWholeTablePrefilled(false);
        }}
        event={activeEvent}
        classes={classesList}
        prefilledTable={prefilledTable}
        prefilledSeats={prefilledSeats}
        isWholeTablePrefilled={isWholeTablePrefilled}
        currentStaffName={currentStaffName}
        onBookingSuccess={() => {
          refreshEventData();
        }}
        lang={lang}
      />

      {/* MODAL: Printable Ticket */}
      {printingTicketBooking && (
        <PrintableTicket
          booking={printingTicketBooking}
          event={activeEvent}
          onClose={() => setPrintingTicketBooking(null)}
          lang={lang}
        />
      )}

      {/* MODAL: Printable Manifest */}
      {isPrintManifestOpen && (
        <PrintableManifest
          event={activeEvent}
          bookings={bookings}
          seats={seats}
          onClose={() => setIsPrintManifestOpen(false)}
          lang={lang}
        />
      )}

      {/* MODAL: Google Sheets Sync Center */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        event={activeEvent}
        settings={settings}
        currentStaffName={currentStaffName}
        onRefresh={loadData}
        lang={lang}
      />

      {/* MODAL: Event Settings & Next Year Cloning */}
      <EventSettingsModal
        isOpen={isEventSettingsModalOpen}
        onClose={() => setIsEventSettingsModalOpen(false)}
        currentEvent={activeEvent}
        eventsList={events}
        onSelectEvent={(newId) => setActiveEventId(newId)}
        currentStaffName={currentStaffName}
        onRefresh={loadData}
        role={currentRole}
        lang={lang}
      />
    </div>
  );
}
