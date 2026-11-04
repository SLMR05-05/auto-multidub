'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  MapPin,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

export default function VisitorLoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, loginWithApple, loginWithFacebook } = useAuthStore();

  const [email, setEmail] = useState('dukhach@gmail.com');
  const [password, setPassword] = useState('Travel123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    loginWithEmail(email, password);
    router.push('/');
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
    router.push('/');
  };

  const handleAppleLogin = () => {
    loginWithApple();
    router.push('/');
  };

  const handleFacebookLogin = () => {
    loginWithFacebook();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10">
        {/* Left Side: Brand & Value Props (Hidden on very small screens, visible on md+) */}
        <div className="bg-gradient-to-br from-emerald-900/60 via-slate-900 to-slate-950 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 text-white mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
                <Compass className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-bold text-base tracking-tight">Auto-Narration</h2>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  AI Travel Companion
                </span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4">
              Khám phá di tích lịch sử{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                rảnh tay & tự động
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Đăng nhập để trải nghiệm thuyết minh GPS tự động, đối đáp giọng nói với trợ lý AI và lưu lại những điểm di tích yêu thích.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <span>Thuyết minh tự động theo GPS & Quét mã QR</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>Hỏi đáp Voice AI đa ngôn ngữ (7 thứ tiếng)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>Lưu điểm tham quan yêu thích & Tải gói Offline</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
            Dự án Thuyết minh tự động Quận 4 (Khánh Hội - Vĩnh Hội - Xóm Chiếu)
          </div>
        </div>

        {/* Right Side: Login Form & Social Logins */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">Đăng nhập tài khoản</h2>
            <p className="text-xs text-slate-400 mt-1">Chào mừng bạn! Chọn phương thức đăng nhập để tiếp tục.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {errorMsg}
            </div>
          )}

          {/* Social Logins */}
          <div className="space-y-2.5 mb-5">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Tiếp tục với Google
            </button>

            {/* Apple & Facebook in 2 columns */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAppleLogin}
                type="button"
                className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl border border-slate-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.64-14.01-6.1-9.46-10.9-20.44-14.41-32.93-3.5-12.5-5.26-24.16-5.26-34.99 0-16.1 4.13-29.28 12.39-39.54 8.27-10.26 18.57-15.48 30.9-15.67 4.79 0 10.36 1.34 16.71 4.02 6.35 2.68 10.22 4.08 11.61 4.2 1.89-.25 5.92-1.68 12.09-4.28 6.17-2.6 11.45-3.83 15.84-3.69 11.97.63 21.64 4.86 29.01 12.69-10.45 6.37-15.54 15.22-15.28 26.54.26 8.79 3.65 16.14 10.17 22.04 6.52 5.9 14.16 9.4 22.92 10.5-2.02 6.04-4.57 12.44-7.65 19.21zM119.22 33.15c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.83-10.42 19.59-12.09.25 1.01.38 2.02.38 3.03 0 7.39-2.78 14.37-8.34 20.93-5.56 6.56-12.14 10.46-19.74 11.7-.12-.96-.18-1.92-.18-2.9z" />
                </svg>
                Apple ID
              </button>
              <button
                onClick={handleFacebookLogin}
                type="button"
                className="flex items-center justify-center gap-2 py-2 px-3 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] text-xs font-medium rounded-xl border border-[#1877F2]/30 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider shrink-0">
              Hoặc dùng Email
            </span>
            <div className="border-t border-slate-800 w-full"></div>
          </div>

          {/* Form Email/Password */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Mật khẩu</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs text-slate-400">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98"
            >
              Đăng nhập ngay
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Chưa có tài khoản du khách?{' '}
            <Link href="/register" className="text-emerald-400 font-semibold hover:underline">
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

