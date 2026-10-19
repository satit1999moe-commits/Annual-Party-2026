import React from 'react';
import { DashboardStats, EventData } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import {
  TrendingUp,
  DollarSign,
  Users,
  Grid,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Award,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface DashboardAnalyticsProps {
  stats: DashboardStats;
  event: EventData;
  onRefresh: () => void;
  lang?: Language;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  stats,
  event,
  onRefresh,
  lang = 'th',
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.dashboardTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'th' ? event.event_name_th : event.event_name_en} ({lang === 'th' ? `ประจำปี พ.ศ. ${event.event_year + 543}` : event.event_year}) · {t.dashboardSub}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            {t.printSummaryReport}
          </button>
        </div>
      </div>

      {/* Top Financial Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Booked Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{t.statBookedRevenue}</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {stats.totalRevenueBooked.toLocaleString()} <span className="text-xs font-normal text-slate-500">{t.baht}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {t.bookingsCountLabel.replace('{count}', String(stats.totalBookings))}
          </span>
        </div>

        {/* Paid Actual Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">{t.statPaidRevenue}</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 mt-2">
            {stats.totalRevenuePaid.toLocaleString()} <span className="text-xs font-normal text-emerald-700">{t.baht}</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            {t.paidTab}
          </span>
        </div>

        {/* Pending Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-800">{t.statPendingRevenue}</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-orange-950 mt-2">
            {stats.totalRevenuePending.toLocaleString()} <span className="text-xs font-normal text-orange-700">{t.baht}</span>
          </div>
          <span className="text-[11px] text-orange-700 mt-1 block">
            {t.unpaidTab}
          </span>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">{t.statOccupancyRate}</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-950 mt-2">
            {stats.occupancyRate}%
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">
            {stats.bookedSeats} / {stats.totalSeats} {lang === 'th' ? 'ที่นั่ง' : 'seats'}
          </span>
        </div>
      </div>

      {/* Table Status Breakdown Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
          <div className="text-xs font-medium text-slate-500">{t.filterAll}</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats.totalTables}
          </div>
          <span className="text-[10px] text-slate-400">{lang === 'th' ? 'โต๊ะ' : 'tables'}</span>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 text-center">
          <div className="text-xs font-medium text-emerald-800">{t.filterVacant}</div>
          <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">
            {stats.vacantTables}
          </div>
          <span className="text-[10px] text-emerald-700">{lang === 'th' ? 'ว่างทั้ง 8 ที่' : 'all 8 free'}</span>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-center">
          <div className="text-xs font-medium text-amber-800">{t.filterPartial}</div>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-1">
            {stats.partialTables}
          </div>
          <span className="text-[10px] text-amber-700">{lang === 'th' ? 'มีที่ว่างบางส่วน' : 'partially booked'}</span>
        </div>

        <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200 text-center">
          <div className="text-xs font-medium text-purple-700">{t.checkinRateTitle}</div>
          <div className="text-2xl font-bold font-mono text-purple-950 mt-1">
            {stats.checkInRate}%
          </div>
          <span className="text-[10px] text-purple-700">{t.checkedInSummaryCount.replace('{count}', String(stats.checkedInCount))}</span>
        </div>
      </div>

      {/* Breakdowns: Staff Sales & Program Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Staff */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              {t.statStaffSales}
            </h3>
            <span className="text-[11px] text-slate-400">{t.sortedByRevenue}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.staffSales.map((s, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono font-bold text-slate-700">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">{s.staffName}</div>
                    <div className="text-[11px] text-slate-500">
                      {t.bookingsCountLabel.replace('{count}', String(s.count))}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-slate-900">
                  {s.totalAmount.toLocaleString()} {t.baht}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Academic Program & Levels */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              {t.statProgramSales}
            </h3>
          </div>

          <div className="space-y-3">
            {stats.programSales.map((p, idx) => {
              const totalAmountAll = stats.totalRevenueBooked || 1;
              const pct = Math.round((p.amount / totalAmountAll) * 100);
              return (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-slate-800">{p.program}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {p.amount.toLocaleString()} {t.baht} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-emerald-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {t.bookingsCountLabel.replace('{count}', String(p.count))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Level Breakdown Top 4 */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-700 block mb-2">
              {t.statTopLevels}:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {stats.levelSales.slice(0, 4).map((lvl, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-700">{lvl.levelName}</span>
                  <span className="font-mono font-bold text-slate-900">{lvl.amount.toLocaleString()} {t.baht}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
