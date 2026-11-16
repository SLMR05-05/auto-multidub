'use client';

import React, { useEffect, useState } from 'react';
import { Users, Shield, History, Plus, Lock, CheckCircle, Ban } from 'lucide-react';
import { AppUser } from '@/types';
import { listCmsUsers } from '@/services/cmsUsers';

export default function CmsUsersAuditPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    listCmsUsers(controller.signal)
      .then(setUsers)
      .catch(() => {
        if (!controller.signal.aborted) setError('Không tải được danh sách người dùng từ Backend.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const auditLogs: { id: number; user: string; action: string; entity: string; detail: string; time: string }[] = [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Quản trị Tài khoản Nhân sự & Nhật ký Kiểm toán (FR-CMS-02, FR-CMS-20)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Phân quyền RBAC (Admin, Editor, Analyst) và theo dõi nhật ký bất biến Audit Log
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {loading && <p role="status">Đang tải người dùng…</p>}

      {/* Grid: Left = Users list, Right = Immutable Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User RBAC Management */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Danh sách nhân sự CMS ({users.length})
            </h2>
            <button
              onClick={() => alert('Mở form tạo tài khoản nhân sự mới!')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm User
            </button>
          </div>

          <div className="space-y-2.5">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-slate-900">{u.fullName}</p>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'EDITOR'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{u.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] text-slate-600 font-medium">Hoạt động</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immutable Audit Log */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              Nhật ký kiểm toán (Audit Log)
            </h2>
            <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 font-bold px-2 py-0.5 rounded-full">
              Bất biến (Cấm sửa / xóa)
            </span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{log.user}</span>
                  <span className="text-[10px] text-slate-400">{log.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-slate-600">{log.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
