import React, { useState } from 'react';
import { StaffUser, Role } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import {
  Users,
  Shield,
  PlusCircle,
  Check,
  X,
  Mail,
  Smartphone,
  RotateCcw,
  Trash2,
  KeyRound,
  Phone,
  Crown,
} from 'lucide-react';

interface StaffManagementProps {
  staffList: StaffUser[];
  onRefresh: () => void;
  currentRole: Role;
  lang?: Language;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staffList,
  onRefresh,
  currentRole,
  lang = 'th',
}) => {
  const t = translations[lang];
  const [isAdding, setIsAdding] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Ticket Staff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim() || !password.trim()) {
      alert(lang === 'th' ? 'กรุณากรอกชื่อผู้ใช้ รหัสผ่าน และชื่อ-นามสกุล' : 'Please fill required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.saveStaff({
        username: username.trim(),
        password: password.trim(),
        display_name: displayName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${username.trim()}@satit.ac.th`,
        role,
        active_status: true,
        max_devices: 10,
      });

      setUsername('');
      setPassword('');
      setDisplayName('');
      setPhone('');
      setEmail('');
      setIsAdding(false);
      setMessage(lang === 'th' ? 'เพิ่มผู้ใช้งานระบบสำเร็จ' : 'User added successfully');
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || (lang === 'th' ? 'บันทึกข้อมูลไม่สำเร็จ' : 'Failed to save staff'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetDevices = async (staff: StaffUser) => {
    if (!confirm(lang === 'th' ? `ต้องการล้างเซสชันอุปกรณ์ทั้งหมดของ "${staff.display_name}" หรือไม่?` : `Reset active devices for "${staff.display_name}"?`)) {
      return;
    }
    try {
      await api.resetStaffDevices(staff.staff_id);
      setMessage(lang === 'th' ? `ล้างอุปกรณ์ของ "${staff.display_name}" เรียบร้อยแล้ว` : 'Devices reset');
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error resetting devices');
    }
  };

  const handleDeleteStaff = async (staff: StaffUser) => {
    const isEmbeddedAdmin = staff.staff_id.startsWith('ADM') || [
      '0833759527', '0924606190', '0652630965', '0970601930', '0610567914', '0915519538', '0802105933'
    ].includes(staff.username);
    if (isEmbeddedAdmin) {
      alert(lang === 'th' ? 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลักที่ฝังในระบบได้' : 'Cannot delete embedded system admin');
      return;
    }
    if (!confirm(lang === 'th' ? `ต้องการลบผู้ใช้ "${staff.display_name}" ออกจากระบบหรือไม่?` : `Delete user "${staff.display_name}"?`)) {
      return;
    }
    try {
      await api.deleteStaff(staff.staff_id);
      setMessage(lang === 'th' ? 'ลบผู้ใช้เรียบร้อยแล้ว' : 'User deleted');
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting staff');
    }
  };

  const getRoleBadgeStyle = (r: Role) => {
    switch (r) {
      case 'Super Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Finance':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Event Admin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Check-in Staff':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            {lang === 'th' ? 'การจัดการผู้ใช้งานระบบและสิทธิ์แอดมิน' : 'System Users & Admin Management'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'th'
              ? 'ระบบฝังบัญชีผู้ดูแลระบบ (Super Admin) ในโค้ดโดยตรง ปลอดภัย ไม่ต้องมีชีตผู้ใช้งานในฐานข้อมูล'
              : 'Super Admin credentials are fully embedded in system code. No database/sheet required.'}
          </p>
        </div>

        {currentRole === 'Super Admin' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0f223d] hover:bg-[#162d4e] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            {isAdding ? (
              <>
                <X className="w-4 h-4" />
                <span>{t.closeFormBtn} (X)</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>{lang === 'th' ? '+ เพิ่มผู้ใช้งาน/แอดมินใหม่' : '+ Add User / Admin'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-emerald-950 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Staff / Admin Form */}
      {isAdding && (
        <form onSubmit={handleAddStaff} className="p-5 bg-slate-50 border border-slate-300 rounded-2xl space-y-4 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="font-bold text-slate-900 text-sm">
              {lang === 'th' ? 'ข้อมูลผู้ใช้งาน / แอดมินใหม่' : 'New User / Admin Credentials'}
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              aria-label={t.closeModal}
              title={`${t.closeModal} (X)`}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'th' ? 'ชื่อผู้ใช้ / รหัสเข้าใช้งาน *' : 'Username / Login ID *'}
              </label>
              <input
                type="text"
                placeholder={lang === 'th' ? 'เช่น admin2 หรือ ชื่อผู้ใช้' : 'e.g. admin2 or username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'th' ? 'รหัสผ่าน *' : 'Password *'}
              </label>
              <input
                type="password"
                placeholder={lang === 'th' ? 'กำหนดรหัสผ่าน' : 'Set password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'th' ? 'ชื่อ - นามสกุล *' : 'Full Name *'}
              </label>
              <input
                type="text"
                placeholder={lang === 'th' ? 'เช่น อาจารย์สมพงษ์ ใจดี' : 'Full Name'}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}
              </label>
              <input
                type="tel"
                placeholder="08X-XXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'th' ? 'อีเมล' : 'Email'}
              </label>
              <input
                type="email"
                placeholder="staff@satit.ac.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'th' ? 'บทบาท / สิทธิ์การใช้งาน' : 'Role / Permission'}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="Super Admin">{t.roleSuperAdmin}</option>
                <option value="Event Admin">{t.roleEventAdmin}</option>
                <option value="Ticket Staff">{t.roleTicketStaff}</option>
                <option value="Finance">{t.roleFinance}</option>
                <option value="Check-in Staff">{t.roleCheckinStaff}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-[11px] text-slate-500">
              * บัญชีใหม่จะได้รับสิทธิ์เข้าใช้งานสูงสุด 10 อุปกรณ์พร้อมกัน
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#0f223d] hover:bg-[#162d4e] text-white rounded-xl font-bold transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? '...' : (lang === 'th' ? 'บันทึกผู้ใช้' : 'Save User')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Staff Table */}
      <div className="overflow-x-auto text-xs rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-3.5">ชื่อผู้ใช้ / รหัส</th>
              <th className="py-3 px-3.5">ชื่อ - นามสกุล</th>
              <th className="py-3 px-3.5">เบอร์โทร / อีเมล</th>
              <th className="py-3 px-3.5">บทบาท</th>
              <th className="py-3 px-3.5 text-center">อุปกรณ์ที่ใช้งาน</th>
              <th className="py-3 px-3.5 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((s) => {
              const isEmbeddedAdmin = s.staff_id.startsWith('ADM') || [
                '0833759527', '0924606190', '0652630965', '0970601930', '0610567914', '0915519538', '0802105933'
              ].includes(s.username);
              const activeCount = Array.isArray(s.active_devices) ? s.active_devices.length : 0;
              const maxDev = s.max_devices || 10;

              return (
                <tr
                  key={s.staff_id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isEmbeddedAdmin ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {isEmbeddedAdmin && <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      <span>{s.username || s.staff_id}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    <div>{s.display_name}</div>
                    {isEmbeddedAdmin && (
                      <span className="text-[10px] text-amber-700 font-bold block">
                        👑 ผู้ดูแลระบบสูงสุด (Super Admin - ฝังในระบบ)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px]">
                    <div>{s.phone || '-'}</div>
                    <div className="text-slate-400">{s.email}</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeStyle(
                        s.role
                      )}`}
                    >
                      {s.role}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                      <Smartphone className="w-3 h-3 text-slate-500" />
                      <span>{activeCount} / {maxDev}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {/* Reset Devices Button */}
                    <button
                      type="button"
                      onClick={() => handleResetDevices(s)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="ล้างเซสชันอุปกรณ์ทั้งหมด (Reset Devices)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button (except embedded admins) */}
                    {!isEmbeddedAdmin && currentRole === 'Super Admin' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(s)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="ลบผู้ใช้งาน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
