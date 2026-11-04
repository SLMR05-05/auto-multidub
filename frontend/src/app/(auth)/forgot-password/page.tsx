'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Compass, Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Khôi phục mật khẩu</h1>
        <p className="text-xs text-slate-400 mb-6">
          Nhập địa chỉ email tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left mb-6">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Đã gửi email khôi phục!
            </div>
            <p className="text-xs text-slate-300">
              Vui lòng kiểm tra hộp thư đến của <span className="text-white font-medium">{email}</span> để làm theo hướng dẫn.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email tài khoản</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
            >
              Gửi liên kết khôi phục
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-xs">
          <Link href="/login" className="text-slate-400 hover:text-white flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

