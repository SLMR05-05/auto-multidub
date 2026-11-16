'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/services/api';
import { clearCmsSession, loginCms } from '@/services/cms';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CmsLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setErrorMsg('');
    try {
      clearCmsSession();
      const role = await loginCms(email, password);
      if (role) {
        router.replace(role === 'EDITOR' ? '/cms/poi' : '/cms/dashboard');
      } else {
        setErrorMsg('Tài khoản này không có quyền truy cập CMS.');
      }
    } catch (error) {
      const status = error instanceof ApiError ? error.status : undefined;
      if (status === 423) setErrorMsg('Tài khoản đang bị khóa tạm thời.');
      else if (status === 401 || status === 403) setErrorMsg('Không thể đăng nhập bằng thông tin đã nhập.');
      else setErrorMsg('Không kết nối được dịch vụ đăng nhập. Vui lòng thử lại.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            AD
          </div>
          <h1 className="text-xl font-bold text-slate-900">Đăng nhập Quản trị CMS</h1>
          <p className="text-xs text-slate-500 mt-1">Hệ thống Thuyết minh tự động & Trợ lý du lịch Voice AI</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Email quản trị viên</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Chuẩn bảo mật BCrypt/JWT
            </span>
            <span className="text-emerald-600 font-medium">Bảo vệ RBAC</span>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
          >
            {pending ? 'Đang đăng nhập…' : 'Đăng nhập hệ thống'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>


      </div>
    </div>
  );
}
