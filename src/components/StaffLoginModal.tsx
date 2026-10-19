import React, { useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { api } from '../services/api';
import { translations, Language } from '../i18n';
import { Shield, Lock, User, CheckCircle2, X, AlertCircle, Smartphone, KeyRound } from 'lucide-react';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffUser[];
  onLoginSuccess: (staff: StaffUser) => void;
  lang: Language;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang,
}) => {
  const t = translations[lang];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [exceededDevices, setExceededDevices] = useState(false);

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

  // Get or initialize persistent client device ID
  const getDeviceId = (): string => {
    let devId = localStorage.getItem('satit_device_token');
    if (!devId) {
      devId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('satit_device_token', devId);
    }
    return devId;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage(lang === 'th' ? 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' : 'Please enter username and password');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setExceededDevices(false);

      const deviceId = getDeviceId();
      const res = await api.login(username.trim(), password.trim(), deviceId);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      let msg = err.message || (lang === 'th' ? 'เข้าสู่ระบบไม่สำเร็จ' : 'Login failed');
      if (msg.includes('Unexpected token') || msg.includes('is not valid JSON') || msg.includes('The page c')) {
        msg = lang === 'th'
          ? 'เซิร์ฟเวอร์กำลังเริ่มต้นระบบหรือยังไม่พร้อมใช้งาน กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'
          : 'Server is starting up or temporarily unavailable. Please try again in a moment.';
      }
      setErrorMessage(msg);
      if (msg.includes('10 อุปกรณ์') || msg.includes('ขีดจำกัด')) {
        setExceededDevices(true);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleResetDevicesAndRetry = async () => {
    if (!username.trim()) return;
    try {
      setLoading(true);
      const devId = getDeviceId();
      await api.resetDevices(username.trim(), devId);
      setExceededDevices(false);
      setErrorMessage(lang === 'th' ? 'รีเซ็ตอุปกรณ์สำเร็จแล้ว กรุณากดเข้าสู่ระบบอีกครั้ง' : 'Devices reset successfully. Please sign in again.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset devices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="popup-window-container relative bg-white rounded-3xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 w-full max-w-md overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Title Bar (Solid Navy) */}
        <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#172b4d] select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>{t.staffLoginTitle}</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                {lang === 'th' ? 'ระบบจัดการและควบคุมสิทธิ์การเข้าใช้งาน' : 'Staff Access & Permission Control'}
              </p>
            </div>
          </div>

          {/* Prominent Window Close Button */}
          <button
            onClick={onClose}
            aria-label={t.closeModal}
            title={`${t.closeModal} (Esc / X)`}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/15 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 group"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Window Body */}
        <div className="p-6 space-y-4">
          {/* Multi-Device Login Notice */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-blue-950 text-xs">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-blue-700">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="leading-relaxed">
              <span className="font-bold block text-xs text-blue-950">
                {lang === 'th' ? 'รองรับการเข้าสู่ระบบแบบหลายอุปกรณ์' : 'Multi-Device Login Supported'}
              </span>
              <span className="text-[11px] text-blue-800">
                {lang === 'th'
                  ? 'เข้าใช้งานพร้อมกันได้สูงสุด 10 อุปกรณ์ ต่อ 1 บัญชีผู้ใช้'
                  : 'Allows up to 10 simultaneous device sessions per user account.'}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">{errorMessage}</span>
                {exceededDevices && (
                  <button
                    type="button"
                    onClick={handleResetDevicesAndRetry}
                    className="block mt-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[11px] cursor-pointer shadow-xs transition-colors"
                  >
                    {lang === 'th' ? 'ล้างเซสชันอุปกรณ์อื่นและเข้าใช้งานทันที' : 'Reset other devices & enter now'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                {lang === 'th' ? 'ชื่อผู้ใช้' : 'Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  placeholder={lang === 'th' ? 'เช่น ชื่อผู้ใช้' : 'e.g. username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-[#0a192f] focus:bg-white text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                {lang === 'th' ? 'รหัสผ่าน' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder={lang === 'th' ? 'กรอกรหัสผ่าน' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-[#0a192f] focus:bg-white text-xs transition-all"
                />
              </div>
            </div>


            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0a192f] hover:bg-[#152a4a] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <span>{lang === 'th' ? 'กำลังตรวจสอบ...' : 'Verifying...'}</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.loginSubmit}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              {lang === 'th'
                ? 'เข้าสู่ระบบเพื่อจัดการผังที่นั่ง การเงิน และรายการจอง'
                : 'Sign in to manage seating layout, payments, and admissions'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
