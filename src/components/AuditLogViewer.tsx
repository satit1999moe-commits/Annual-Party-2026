import React, { useState } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import { History, Search, Download, Clock } from 'lucide-react';
import { formatThaiDateTime } from '../utils/dateUtils';

interface AuditLogViewerProps {
  logs: AuditLog[];
  eventId: string;
  lang?: Language;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, eventId, lang = 'th' }) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = logs.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (l.booking_code && l.booking_code.toLowerCase().includes(q)) ||
      l.action.toLowerCase().includes(q) ||
      l.actor_name.toLowerCase().includes(q) ||
      (l.reason && l.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            {t.auditLogTitle}
          </h3>
          <p className="text-[11px] text-slate-500">
            {t.auditLogSub} ({filtered.length} {lang === 'th' ? 'รายการ' : 'records'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchLogPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <a
            href={api.getExportCsvUrl('Audit_Log', eventId)}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg whitespace-nowrap shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            {t.exportLogCsv}
          </a>
        </div>
      </div>

      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
              <th className="py-2.5 px-3">{t.thTime}</th>
              <th className="py-2.5 px-3">{t.thAction}</th>
              <th className="py-2.5 px-3">{t.thLogBookingCode}</th>
              <th className="py-2.5 px-3">{t.thActor}</th>
              <th className="py-2.5 px-3">{t.thLogDetail}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  {t.noLogsFound}
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {lang === 'th' ? formatThaiDateTime(log.timestamp) : log.timestamp}
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-800">
                    {log.booking_code ? `#${log.booking_code}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-medium">
                    {log.actor_name}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    <div>{log.reason || log.new_value}</div>
                    {log.old_value && (
                      <div className="text-[10px] text-slate-400 mt-0.5">{lang === 'th' ? 'เดิม:' : 'Before:'} {log.old_value}</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
