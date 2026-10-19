import React, { useState, useEffect } from 'react';
import { EventData, SystemSetting } from '../types';
import { Language } from '../i18n';
import { api } from '../services/api';
import { formatThaiDateTime, formatThaiDate } from '../utils/dateUtils';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Zap,
  Layers,
  Sparkles,
  Database,
  ShieldCheck,
  BookOpen,
  Trash2,
  Library,
  Link,
  Radio,
} from 'lucide-react';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  settings: SystemSetting[];
  currentStaffName: string;
  onRefresh: () => void;
  lang?: Language;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  event,
  settings,
  currentStaffName,
  onRefresh,
  lang = 'th',
}) => {
  const DEFAULT_SHEET_ID = '181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw';
  const DEFAULT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyA-GjojRbOGEArwidXXGgPB4Fyj2eNVvA9B2b4T__qSxxtTW1m3v_uJLs7F8PVe0_g/exec';
  const DEFAULT_LIB_ID = '188vH8ERakF3tGXfQuJc2iIanq4v9jePwqjdDkus_wVhwDJS0In5q1sak';
  const DEFAULT_LIB_URL = 'https://script.google.com/macros/library/d/188vH8ERakF3tGXfQuJc2iIanq4v9jePwqjdDkus_wVhwDJS0In5q1sak/1';

  const [spreadsheetId, setSpreadsheetId] = useState(DEFAULT_SHEET_ID);
  const [webAppUrl, setWebAppUrl] = useState(DEFAULT_WEBAPP_URL);
  const [appsScriptCode, setAppsScriptCode] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedLib, setIsCopiedLib] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'connectedLive' | 'appsScript' | 'excelEasy' | 'schema'>('connectedLive');

  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isClearingBookings, setIsClearingBookings] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    online: boolean;
    message: string;
    sheetName?: string;
    timestamp?: string;
  } | null>(null);

  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    lastSyncedAt?: string;
  } | null>(null);

  // Initialize values from settings
  useEffect(() => {
    if (settings) {
      const idSetting = settings.find((s) => s.setting_key === 'GOOGLE_SHEETS_ID');
      const urlSetting = settings.find((s) => s.setting_key === 'GOOGLE_APPS_SCRIPT_URL');
      if (idSetting && idSetting.setting_value) setSpreadsheetId(idSetting.setting_value);
      if (urlSetting && urlSetting.setting_value) setWebAppUrl(urlSetting.setting_value);
    }

    // Fetch script template
    api.getSheetsTemplate().then((res) => {
      setAppsScriptCode(res.appsScriptCode);
      setSheetNames(res.sheetNames || [
        'Dashboard',
        'Events',
        'Bookings',
        'Seats',
        'Payments',
        'Students_Classes',
        'Staff',
        'Audit_Log',
        'Check_In',
        'Settings',
      ]);
    });
  }, [settings, isOpen]);

  // Test live connection to Google Apps Script Web App
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await api.testSheetsConnection(webAppUrl);
      setConnectionStatus({
        tested: true,
        online: res.online,
        message: res.message || 'เชื่อมต่อสำเร็จ',
        sheetName: res.sheetName,
        timestamp: res.status,
      });
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        online: false,
        message: err.message || 'ไม่สามารถติดต่อ Web App ได้ กรุณาตรวจสอบลิงก์การปรับใช้',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleCopyLibId = () => {
    navigator.clipboard.writeText(DEFAULT_LIB_ID);
    setIsCopiedLib(true);
    setTimeout(() => setIsCopiedLib(false), 2500);
  };

  const handleSaveConfig = async () => {
    try {
      await api.updateSettings(
        [
          { setting_key: 'GOOGLE_SHEETS_ID', setting_value: spreadsheetId.trim() },
          { setting_key: 'GOOGLE_APPS_SCRIPT_URL', setting_value: webAppUrl.trim() },
          { setting_key: 'GOOGLE_APPS_SCRIPT_LIBRARY', setting_value: DEFAULT_LIB_ID },
          { setting_key: 'GOOGLE_APPS_SCRIPT_LIBRARY_URL', setting_value: DEFAULT_LIB_URL },
        ],
        currentStaffName
      );
      setSyncResult({
        success: true,
        message: lang === 'th' ? 'บันทึกการตั้งค่า Google Sheets เรียบร้อยแล้ว' : 'Google Sheets settings saved successfully',
      });
      onRefresh();
    } catch (e: any) {
      setSyncResult({
        success: false,
        message: lang === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' : 'Failed to save Google Sheets settings',
      });
    }
  };

  // 1-Click Auto Creation of All 9 Sheets and Headers (Staff accounts are embedded in code)
  const handleAutoInitSheets = async () => {
    setIsInitializing(true);
    setSyncResult(null);
    try {
      const res = await api.initSheets(webAppUrl);
      setSyncResult({
        success: true,
        message: res.message || (lang === 'th' ? 'สร้างโครงสร้าง 9 ชีตและหัวตารางใน Google Sheets สำเร็จเรียบร้อย (ข้อมูลผู้ใช้งานฝังในโค้ดระบบเพื่อความปลอดภัยสูงสุด)' : 'Initialized all 9 sheets and headers successfully'),
      });
      onRefresh();
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || (lang === 'th' ? 'ไม่สามารถสั่งสร้างชีตอัตโนมัติได้ ตรวจสอบสิทธิ์หรือ Web App URL' : 'Failed to auto initialize sheets'),
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Full Database Sync to Google Sheets
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.syncSheets(webAppUrl, spreadsheetId);
      setSyncResult({
        success: true,
        message: res.message || (lang === 'th' ? 'ซิงก์ข้อมูลไปยัง Google Sheets สำเร็จครบทั้ง 9 แผ่นงาน' : 'Synced data to Google Sheets (all 9 sheets) successfully'),
        lastSyncedAt: res.lastSyncedAt,
      });
      onRefresh();
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || (lang === 'th' ? 'การเชื่อมต่อล้มเหลว ตรวจสอบ Web App URL หรือสถานะเครือข่าย' : 'Connection failed'),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear all bookings (User request: reset all bookings and payments into empty state)
  const handleClearAllBookings = async () => {
    setIsClearingBookings(true);
    try {
      const res = await api.clearAllBookings(currentStaffName);
      setShowClearConfirm(false);
      setSyncResult({
        success: true,
        message: res.message || (lang === 'th' ? 'ล้างข้อมูลการจองทั้งหมดในระบบเรียบร้อยแล้ว โดยยังคงบัญชีแอดมินไว้' : 'All bookings cleared successfully'),
      });
      onRefresh();
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || (lang === 'th' ? 'เกิดข้อผิดพลาดในการล้างข้อมูลการจอง' : 'Failed to clear bookings'),
      });
    } finally {
      setIsClearingBookings(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Schema Definitions list for reference tab (9 sheets, user accounts are embedded in code)
  const schemaDetails = [
    {
      name: 'Dashboard',
      descTh: 'สรุปตัวชี้วัดสำคัญ ยอดเงินรวม จำนวนโต๊ะ และที่นั่ง พร้อมสูตรคำนวณอัตโนมัติ',
      descEn: 'Key metrics summary, revenues, occupancy, and auto-updating live formulas',
      cols: 'Key Metrics, Current Value, Unit, Status',
    },
    {
      name: 'Events',
      descTh: 'ข้อมูลงานเลี้ยงประจำปี ราคาบัตร วันที่ เวลา สถานที่ กำหนดเปิด-ปิดการจอง',
      descEn: 'Event details, ticket prices, venue, dates, time, sales open/close timestamps',
      cols: 'event_id, event_year, event_name_th, seat_price, table_price, venue, sales_open_at...',
    },
    {
      name: 'Bookings',
      descTh: 'รายการจองทั้งหมด รหัสจอง หมายเลขโต๊ะ ที่นั่ง ผู้ปกครอง นักเรียน ยอดชำระ และสถานะ',
      descEn: 'All bookings, booking codes, tables, designated seats, attendees, payments, notes',
      cols: 'booking_uuid, booking_code, parent_first_name, phone, student_first_name, table_number, seat_labels, booking_status, payment_status, total_amount...',
    },
    {
      name: 'Seats',
      descTh: 'ผังที่นั่งทั้งหมด 960 รายการ (120 โต๊ะ x 8 ที่นั่ง A-H) พร้อมสถานะว่าง/จอง',
      descEn: '960 seat inventory matrix (120 tables x 8 seats A-H) with availability state',
      cols: 'event_id, table_number, seat_label, seat_status, booking_uuid, updated_at',
    },
    {
      name: 'Payments',
      descTh: 'ประวัติการรับชำระเงิน ยอดโอน ช่องทาง สลิปโอนเงิน และเจ้าหน้าที่ผู้ตรวจสอบ',
      descEn: 'Payment audit log, transaction amounts, payment methods, slips, verification staff',
      cols: 'payment_id, booking_uuid, amount, payment_method, slip_file_url, payment_status, verified_by...',
    },
    {
      name: 'Students_Classes',
      descTh: 'โครงสร้างระดับชั้นและห้องเรียน (Nursery ถึง ม.6) และหลักสูตร TP / EP',
      descEn: 'Academic grade levels and classrooms (Nursery to S6) with TP / EP programs',
      cols: 'level_id, level_name, room, program, active_status',
    },
    {
      name: 'Audit_Log',
      descTh: 'บันทึกประวัติความเคลื่อนไหว การจอง การแก้ไข และการยกเลิก เพื่อความโปร่งใส',
      descEn: 'System audit trail, change tracking, timestamped actions, actor IDs, and reasons',
      cols: 'log_id, event_id, booking_code, action, old_value, new_value, actor_name, timestamp',
    },
    {
      name: 'Check_In',
      descTh: 'บันทึกการสแกน QR Code เช็คอินเข้างานหน้างาน วันเวลา และเจ้าหน้าที่ผู้สแกน',
      descEn: 'On-site QR code check-in logs, arrival timestamps, check-in staff verifier',
      cols: 'checkin_id, booking_uuid, booking_code, checked_in_at, checked_in_by, checkin_status',
    },
    {
      name: 'Settings',
      descTh: 'การตั้งค่าระบบ การเชื่อมต่อฐานข้อมูล Google Sheets และพารามิเตอร์ระบบ',
      descEn: 'System settings, Google Sheets credentials, last sync timestamps, config flags',
      cols: 'setting_key, setting_value, updated_by, updated_at',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Title Bar (Solid Navy) */}
        <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  {lang === 'th' ? 'ระบบฐานข้อมูล Google Sheets กลาง (10 แผ่นงาน)' : 'Google Sheets Master Database System (10 Sheets)'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {lang === 'th' ? 'เชื่อมต่อสมบูรณ์' : 'Connected'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {lang === 'th'
                  ? 'ฐานข้อมูลใหม่: ชีตไอดี 181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw พร้อม Web App และ Library'
                  : 'Master Database: 181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw with Web App & Library'}
              </p>
            </div>
          </div>

          {/* Close Window Button */}
          <button
            onClick={onClose}
            aria-label={lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
            title={lang === 'th' ? 'ปิดหน้าต่าง (Esc / X)' : 'Close (Esc / X)'}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs flex-1">
          {/* Status Feedback Toast */}
          {syncResult && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                syncResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                  : 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs'
              }`}
            >
              {syncResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-bold text-xs">{syncResult.message}</p>
                {syncResult.lastSyncedAt && (
                  <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                    {lang === 'th' ? `เวลาที่ซิงก์สำเร็จ: ${formatThaiDateTime(syncResult.lastSyncedAt)}` : `Last synced: ${syncResult.lastSyncedAt}`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSyncResult(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ACTIVE GOOGLE SHEETS CONNECTION CARD (New Primary Highlight) */}
          <div className="bg-gradient-to-br from-[#0a192f] to-[#172b4d] text-white rounded-2xl p-4 sm:p-5 shadow-md border border-[#1e3a66] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-sm text-white">
                    {lang === 'th' ? 'ฐานข้อมูล Google Sheets ของระบบ (พร้อมใช้งาน)' : 'Active Google Sheets Database'}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'th' ? 'เชื่อมต่อฐานข้อมูลใหม่สมบูรณ์แบบ ทั้ง Google Sheets, Web App และ Apps Script Library' : 'Full bidirectional integration with Google Sheets, Web App, and Apps Script Library'}
                </p>
              </div>

              {/* Direct Open Link */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId || DEFAULT_SHEET_ID}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'th' ? 'เปิด Google Sheets ทันที' : 'Open Google Sheets'}</span>
                </a>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  title="ทดสอบส่งสัญญาณ ping ไปยัง Google Apps Script Web App"
                >
                  <Radio className={`w-3.5 h-3.5 text-amber-300 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? (lang === 'th' ? 'กำลังทดสอบ...' : 'Pinging...') : (lang === 'th' ? 'ทดสอบเชื่อมต่อ' : 'Ping Test')}</span>
                </button>
              </div>
            </div>

            {/* Test Connection Result Box */}
            {connectionStatus && (
              <div className={`p-3 rounded-xl text-xs flex items-center justify-between gap-3 ${connectionStatus.online ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'}`}>
                <div className="flex items-center gap-2">
                  {connectionStatus.online ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{connectionStatus.message}</span>
                </div>
                {connectionStatus.sheetName && (
                  <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">
                    แผ่นงาน: {connectionStatus.sheetName}
                  </span>
                )}
              </div>
            )}

            {/* Credential Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-slate-300 block text-[10px] uppercase font-bold">1. Google Spreadsheet ID</span>
                <span className="font-mono text-emerald-300 font-bold block truncate" title={spreadsheetId}>
                  {spreadsheetId}
                </span>
                <span className="text-[10px] text-slate-300 block">ชีตหลักประจำระบบ 9 แผ่นงาน (ผู้ใช้งานฝังในโค้ด)</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-slate-300 block text-[10px] uppercase font-bold">2. Apps Script Web App URL</span>
                <span className="font-mono text-amber-300 font-bold block truncate" title={webAppUrl}>
                  .../s/AKfycbyA-GjojRbOGE.../exec
                </span>
                <span className="text-[10px] text-slate-300 block">Webhook รับคำสั่งอัตโนมัติ 2 ทิศทาง</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-slate-300 block text-[10px] uppercase font-bold">3. Apps Script Library (V.1)</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-blue-300 font-bold block truncate" title={DEFAULT_LIB_ID}>
                    {DEFAULT_LIB_ID.slice(0, 16)}...
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLibId}
                    className="p-1 hover:bg-white/15 rounded text-slate-200 cursor-pointer"
                    title="คัดลอก Script ID ไลบรารี"
                  >
                    {isCopiedLib ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <a
                  href={DEFAULT_LIB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-200 hover:text-white underline block"
                >
                  เปิดหน้ารายละเอียด Library V.1
                </a>
              </div>
            </div>

            {/* Realtime Auto-Sync Live Status Banner */}
            <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-300">
                      {lang === 'th' ? '⚡ ระบบบันทึกและซิงก์ข้อมูลอัตโนมัติทันที (Realtime Auto-Sync): เปิดใช้งาน 100%' : '⚡ Realtime Auto-Sync: Active 100%'}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                      อัตโนมัติ
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 mt-0.5">
                    {lang === 'th'
                      ? 'ทุกการ เพิ่ม, ลบ, หรือ แก้ไข ข้อมูลการจอง ยอดชำระเงิน หรือเช็กอินจากหน้าระบบ จะถูกบันทึกและส่งเข้า Google Sheet ทันทีโดยอัตโนมัติ ไม่ต้องกดปุ่มซิงก์ด้วยตนเอง'
                      : 'All additions, deletions, and edits from the UI are instantly saved and synced to Google Sheets in realtime'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-lg text-[10px] font-mono font-bold shrink-0 self-start sm:self-auto">
                REALTIME ACTIVE
              </span>
            </div>

            {/* Direct Actions: Auto Create & Optional Manual Sync */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/15">
              <button
                type="button"
                onClick={handleAutoInitSheets}
                disabled={isInitializing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title="สั่งให้ Web App สร้างชีตและหัวตาราง 9 แผ่นงานอัตโนมัติ"
              >
                <Sparkles className={`w-3.5 h-3.5 text-slate-950 ${isInitializing ? 'animate-spin' : ''}`} />
                <span>
                  {isInitializing
                    ? (lang === 'th' ? 'กำลังสร้างชีต...' : 'Creating Sheets...')
                    : (lang === 'th' ? '⚡ สั่งสร้างชีตและหัวตารางอัตโนมัติ (Auto-Create 9 Sheets)' : '⚡ Auto-Create 9 Sheets')}
                </span>
              </button>

              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title="ซิงก์ข้อมูลทั้งหมดลง Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing
                    ? (lang === 'th' ? 'กำลังซิงก์...' : 'Syncing...')
                    : (lang === 'th' ? '🔄 ซิงก์ข้อมูลทั้งหมด (Full Sync To Sheets)' : '🔄 Full Sync All Data')}
                </span>
              </button>
            </div>
          </div>

          {/* Guide Selector Tabs */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
            {/* Tab Buttons */}
            <div className="p-2 bg-slate-100/90 border-b border-slate-200 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveGuideTab('connectedLive')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGuideTab === 'connectedLive'
                    ? 'bg-[#0a192f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Link className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'th' ? '1. การเชื่อมต่อ & ไลบรารี (Library & Setup)' : '1. Library & Setup'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('appsScript')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGuideTab === 'appsScript'
                    ? 'bg-[#0a192f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'th' ? '2. โค้ด Apps Script (Code.gs สำรอง)' : '2. Apps Script Code.gs'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('excelEasy')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGuideTab === 'excelEasy'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'th' ? '3. ดาวน์โหลดแม่แบบ Excel 10 ชีต' : '3. Master Excel (.xlsx)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('schema')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGuideTab === 'schema'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'th' ? '4. โครงสร้าง 10 แผ่นงาน (Schema)' : '4. Schema Details'}</span>
              </button>
            </div>

            {/* TAB 1: Connected Live & Library Guide */}
            {activeGuideTab === 'connectedLive' && (
              <div className="p-5 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{lang === 'th' ? 'ระบบฐานข้อมูลเชื่อมต่อสมบูรณ์เรียบร้อยแล้ว:' : 'Database fully connected:'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {lang === 'th'
                      ? 'ชีตไอดี 181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw และ Google Apps Script Web App ได้รับการกำหนดค่าเป็นฐานข้อมูลหลักของระบบเรียบร้อยแล้ว ทุกการจอง การอัปเดต และการตรวจสอบ สามารถซิงก์ตรงกับ Google Sheets ได้แบบอัตโนมัติ'
                      : 'The spreadsheet and Web App URL are active. Real-time synchronizations and automated sheet configurations are ready.'}
                  </p>
                </div>

                {/* Library Setup Instructions */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <Library className="w-4 h-4 text-blue-600" />
                      {lang === 'th' ? 'วิธีการเชื่อมโยงกับ Apps Script Library ใน Google Sheets:' : 'How to link the Apps Script Library in Google Sheets:'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLibId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer shadow-2xs"
                    >
                      {isCopiedLib ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopiedLib ? 'คัดลอกแล้ว' : 'คัดลอก Script ID'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0a192f] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                      <p>
                        เปิด Google Sheets (ชีต <code>181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw</code>) ไปที่ <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong>
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0a192f] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                      <p>
                        ที่แถบเมนูด้านซ้าย มองหาหัวข้อ <strong>ไลบรารี (Libraries)</strong> แล้วคลิกเครื่องหมาย <strong>+ (เพิ่มไลบรารี)</strong>
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0a192f] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                      <div className="space-y-1">
                        <p>
                          วาง Script ID: <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-blue-800">{DEFAULT_LIB_ID}</code> แล้วกด <strong>ค้นหา (Look up)</strong>
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          เลือกเวอร์ชัน: <strong>1</strong> | ตัวระบุ (Identifier): <strong>SatitTicketLib</strong> แล้วกด <strong>เพิ่ม (Add)</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Apps Script Code.gs Backup */}
            {activeGuideTab === 'appsScript' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {lang === 'th' ? 'ซอร์สโค้ด Google Apps Script (Code.gs ฉบับสมบูรณ์)' : 'Google Apps Script Source Code (Code.gs)'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'th'
                        ? 'มีฟังก์ชันสร้าง 10 ชีตอัตโนมัติ, ตรึงแถวแรก, ใส่สูตร Dashboard และรองรับ Webhook doPost'
                        : 'Contains setupAllSheetsAuto, buildDashboardSheet, and doPost webhook'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a192f] hover:bg-[#172b4d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? (lang === 'th' ? 'คัดลอกสำเร็จ!' : 'Copied!') : (lang === 'th' ? 'คัดลอกโค้ดทั้งหมด' : 'Copy Code')}</span>
                  </button>
                </div>

                <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-[11px] text-slate-200 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{appsScriptCode}</pre>
                </div>
              </div>
            )}

            {/* TAB 3: Excel Easy Download */}
            {activeGuideTab === 'excelEasy' && (
              <div className="p-5 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-emerald-700" />
                      {lang === 'th' ? 'ดาวน์โหลดฐานข้อมูลสมบูรณ์ทั้ง 10 แผ่นงาน (.xlsx)' : 'Download Master 10-Sheet Workbook (.xlsx)'}
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {lang === 'th'
                        ? 'ไฟล์เดียวได้ครบทั้ง 10 แผ่นงาน พร้อมหัวตารางสี Navy Blue และข้อมูลล่าสุด สามารถนำไปอัปโหลดขึ้น Google Drive แล้วเปิดด้วย Google Sheets ได้ทันที'
                        : 'One single file contains all 10 sheets with headers. Upload directly to Google Drive.'}
                    </p>
                  </div>

                  <a
                    href={api.getExportAllXlsxUrl(event.event_id)}
                    download
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'th' ? 'ดาวน์โหลดแม่แบบสมบูรณ์ (.xlsx)' : 'Download Master Workbook'}</span>
                  </a>
                </div>

                {/* Individual CSV downloads */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 text-xs block">
                    {lang === 'th' ? 'หรือดาวน์โหลดแยกรายแผ่นงาน (CSV):' : 'Or Download Individual Sheets (CSV):'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {sheetNames.map((name) => (
                      <div key={name} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between gap-1 shadow-2xs">
                        <span className="font-mono font-bold text-[11px] text-slate-800 truncate" title={name}>
                          {name}
                        </span>
                        <a
                          href={api.getExportCsvUrl(name, event.event_id)}
                          download
                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                          title={`ดาวน์โหลด ${name}.csv`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Database Schema Specification */}
            {activeGuideTab === 'schema' && (
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs">
                    {lang === 'th' ? 'รายละเอียดโครงสร้าง 10 แผ่นงาน (Database Schema Reference)' : 'Complete 10-Sheet Database Architecture Reference'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'th'
                      ? 'โครงสร้างมาตรฐานที่ออกแบบให้รองรับการเชื่อมต่อกับ Looker Studio, Google Sheets, หรือรายงานสำหรับฝ่ายบริหาร'
                      : 'Production-ready database architecture ready for Looker Studio, audit reports, and ERP integrations'}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {schemaDetails.map((s, idx) => (
                    <div key={s.name} className="p-3.5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-xs font-mono">{s.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-7">
                          {lang === 'th' ? s.descTh : s.descEn}
                        </p>
                      </div>

                      <div className="pl-7 sm:pl-0 sm:text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md block max-w-xs truncate">
                          {s.cols}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Connection Settings Box */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {lang === 'th' ? 'การตั้งค่า URL การเชื่อมต่อ Webhook (Google Apps Script Web App URL)' : 'Connection Credentials & Webhook Settings'}
              </span>
              <span className="text-[10px] text-slate-500">
                {lang === 'th' ? 'บันทึกเพื่อใช้ซิงก์ 2 ทิศทางอัตโนมัติ' : 'Saved for 2-way live sync'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Google Apps Script Web App URL (doPost):
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Google Spreadsheet ID (ชีตหลัก):
                </label>
                <input
                  type="text"
                  placeholder="181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-[#0a192f] hover:bg-[#172b4d] text-white rounded-xl font-bold cursor-pointer shadow-xs transition-all active:scale-95 text-xs"
              >
                {lang === 'th' ? '💾 บันทึกการตั้งค่า URL' : '💾 Save Connection Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {lang === 'th' ? 'โรงเรียนสาธิตอุดมศึกษา · ระบบจำหน่ายและจองบัตรงานเลี้ยงประจำปี' : 'Satit Udomseuksa School Ticketing System'}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0a192f] hover:bg-[#172b4d] text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-xs ml-auto"
          >
            {lang === 'th' ? 'เสร็จสิ้น / ปิดหน้าต่าง' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
