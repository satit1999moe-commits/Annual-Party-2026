import React, { useState } from 'react';
import { EventData, Role } from '../types';
import { api } from '../services/api';
import { Language } from '../i18n';
import { Settings, PlusCircle, Copy, Calendar, Clock, X, CheckCircle2 } from 'lucide-react';
import { formatThaiDate } from '../utils/dateUtils';

interface EventSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEvent: EventData;
  eventsList: EventData[];
  onSelectEvent: (eventId: string) => void;
  currentStaffName: string;
  onRefresh: () => void;
  role: Role;
  lang?: Language;
}

export const EventSettingsModal: React.FC<EventSettingsModalProps> = ({
  isOpen,
  onClose,
  currentEvent,
  eventsList,
  onSelectEvent,
  currentStaffName,
  onRefresh,
  role,
  lang = 'th',
}) => {
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'CLONE_NEW'>('CURRENT');

  // Edit current event form
  const [eventNameTh, setEventNameTh] = useState(currentEvent.event_name_th);
  const [eventNameEn, setEventNameEn] = useState(currentEvent.event_name_en);
  const [promoTitle, setPromoTitle] = useState(currentEvent.promo_title);
  const [eventDate, setEventDate] = useState(currentEvent.event_date);
  const [startTime, setStartTime] = useState(currentEvent.start_time);
  const [endTime, setEndTime] = useState(currentEvent.end_time);
  const [venue, setVenue] = useState(currentEvent.venue);
  const [seatPrice, setSeatPrice] = useState(currentEvent.seat_price);
  const [tablePrice, setTablePrice] = useState(currentEvent.table_price);
  const [eventStatus, setEventStatus] = useState(currentEvent.event_status);
  const [refundPolicy, setRefundPolicy] = useState(currentEvent.refund_policy);

  // New Event Form
  const [newEventId, setNewEventId] = useState(`EV${currentEvent.event_year + 1}`);
  const [newEventYear, setNewEventYear] = useState(currentEvent.event_year + 1);
  const [newEventNameTh, setNewEventNameTh] = useState(currentEvent.event_name_th.replace(/\d+/, '') + ` (ปี ${currentEvent.event_year + 1})`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.updateEvent(currentEvent.event_id, {
        event_name_th: eventNameTh,
        event_name_en: eventNameEn,
        promo_title: promoTitle,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        venue,
        seat_price: Number(seatPrice),
        table_price: Number(tablePrice),
        event_status: eventStatus,
        refund_policy: refundPolicy,
      });
      alert('บันทึกการตั้งค่ากิจกรรมสำเร็จ');
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClonedEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const created = await api.createEvent({
        event_id: newEventId.trim(),
        event_year: Number(newEventYear),
        event_name_th: newEventNameTh.trim(),
        event_name_en: `Satit Udomseuksa School Annual Party ${newEventYear}`,
        promo_title: `ANNUAL PARTY ${newEventYear}`,
        theme: currentEvent.theme,
        event_date: `${newEventYear}-12-18`,
        start_time: startTime,
        end_time: endTime,
        venue,
        total_tables: currentEvent.total_tables,
        seats_per_table: currentEvent.seats_per_table,
        seat_price: Number(seatPrice),
        table_price: Number(tablePrice),
        refund_policy: refundPolicy,
        clone_from_event_id: currentEvent.event_id,
        actor_name: currentStaffName,
      });

      alert(`สร้างกิจกรรม ${created.event_id} สำเร็จเรียบร้อย (ผังโต๊ะ 120 โต๊ะเริ่มต้นใหม่ โดยไม่มีข้อมูลจองเก่าปะปน)`);
      onRefresh();
      onSelectEvent(created.event_id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถสร้างกิจกรรมใหม่ได้');
    } finally {
      setIsSubmitting(false);
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
              <Settings className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {lang === 'th' ? 'การตั้งค่ากิจกรรมและรอบปีงาน (Event Settings)' : 'Event Settings & Annual Cycles'}
              </h2>
              <p className="text-[11px] text-slate-300">
                {lang === 'th'
                  ? 'กำหนดชื่องาน วันที่จัดงาน ราคาบัตร และโคลนผังงานรอบปีใหม่'
                  : 'Configure event name, date, ticket prices, and clone layouts for new years'}
              </p>
            </div>
          </div>

          {/* Prominent Window Close Button */}
          <button
            onClick={onClose}
            aria-label={lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
            title={lang === 'th' ? 'ปิดหน้าต่าง (Esc / X)' : 'Close (Esc / X)'}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group shrink-0"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CURRENT')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'CURRENT'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'th' ? `ตั้งค่ากิจกรรมปัจจุบัน (${currentEvent.event_id})` : `Current Event (${currentEvent.event_id})`}
          </button>
          <button
            onClick={() => setActiveTab('CLONE_NEW')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'CLONE_NEW'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'th' ? '+ สร้างกิจกรรมปีถัดไป (คัดลอกเฉพาะผังโต๊ะ)' : '+ Create Next Year Event (Clone Layout)'}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 text-xs">
          {activeTab === 'CURRENT' ? (
            <form onSubmit={handleUpdateCurrent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'ชื่อกิจกรรมภาษาไทย:' : 'Event Name (Thai):'}
                  </label>
                  <input
                    type="text"
                    value={eventNameTh}
                    onChange={(e) => setEventNameTh(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'ชื่อกิจกรรมภาษาอังกฤษ:' : 'Event Name (English):'}
                  </label>
                  <input
                    type="text"
                    value={eventNameEn}
                    onChange={(e) => setEventNameEn(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'ชื่องานบนสื่อประชาสัมพันธ์ (Promo Title):' : 'Promotional Title (Promo Title):'}
                  </label>
                  <input
                    type="text"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'วันที่จัดงาน:' : 'Event Date:'}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  {eventDate && (
                    <span className="text-[10px] text-blue-800 font-medium block mt-0.5">
                      {lang === 'th' ? `พ.ศ.: ${formatThaiDate(eventDate, 'full')}` : formatThaiDate(eventDate)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'เวลาเริ่ม - สิ้นสุด:' : 'Start - End Time:'}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="18:00"
                      className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="22:00"
                      className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'ราคาบัตรต่อที่นั่ง (บาท):' : 'Ticket Price per Seat (THB):'}
                  </label>
                  <input
                    type="number"
                    value={seatPrice}
                    onChange={(e) => setSeatPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'ราคาเหมาทั้งโต๊ะ (8 ที่นั่ง):' : 'Whole Table Price (8 Seats):'}
                  </label>
                  <input
                    type="number"
                    value={tablePrice}
                    onChange={(e) => setTablePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'สถานะการเปิดรับจอง / จำหน่ายบัตร:' : 'Booking & Ticketing Status:'}
                  </label>
                  <select
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="Active">{lang === 'th' ? 'เปิดรับจองปกติ (Active / Open)' : 'Open for Bookings (Active)'}</option>
                    <option value="Closed">{lang === 'th' ? 'ปิดรับจองแล้ว (Closed)' : 'Closed'}</option>
                    <option value="Draft">{lang === 'th' ? 'ฉบับร่าง (Draft)' : 'Draft'}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'นโยบายการคืนเงิน (Refund Policy):' : 'Refund Policy:'}
                  </label>
                  <textarea
                    rows={2}
                    value={refundPolicy}
                    onChange={(e) => setRefundPolicy(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  {lang === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateClonedEvent} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <p className="font-semibold mb-1">
                  {lang === 'th' ? 'ℹ️ ข้อกำหนดการสร้างกิจกรรมปีใหม่:' : 'ℹ️ New Event Creation Rules:'}
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800">
                  <li>{lang === 'th' ? 'ระบบจะคัดลอกผัง 120 โต๊ะและราคาเป็นต้นแบบ' : 'The 120-table layout and prices will be copied as a template'}</li>
                  <li>{lang === 'th' ? 'ข้อมูลการจอง รายการชำระเงิน และสลิปของปีเดิมจะไม่ถูกคัดลอกมา' : 'Previous bookings, payment records, and slips will NOT be copied'}</li>
                  <li>{lang === 'th' ? 'รหัสการจอง 4 หลัก (#0001) จะเริ่มนับใหม่สำหรับกิจกรรมนี้' : '4-digit booking codes (0001) will reset fresh for this event'}</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'รหัสกิจกรรมใหม่ (Event ID) *' : 'New Event ID *'}
                  </label>
                  <input
                    type="text"
                    value={newEventId}
                    onChange={(e) => setNewEventId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'ปีการศึกษา / ปี ค.ศ. *' : 'Academic / Calendar Year *'}
                  </label>
                  <input
                    type="number"
                    value={newEventYear}
                    onChange={(e) => setNewEventYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    {lang === 'th' ? 'ชื่อกิจกรรมใหม่ *' : 'New Event Name *'}
                  </label>
                  <input
                    type="text"
                    value={newEventNameTh}
                    onChange={(e) => setNewEventNameTh(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  {lang === 'th' ? 'ยืนยันสร้างกิจกรรมใหม่' : 'Confirm & Create New Event'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
