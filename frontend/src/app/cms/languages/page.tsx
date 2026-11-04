'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/stores/languageStore';
import { Globe, Plus, Check, X, ShieldAlert, Sparkles, MoveUp, MoveDown } from 'lucide-react';
import { Language } from '@/types';

export default function CmsLanguagesPage() {
  const { languages, toggleLanguageActive, addLanguage } = useLanguageStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNativeName, setNewNativeName] = useState('');
  const [newLocaleTts, setNewLocaleTts] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    addLanguage({
      code: newCode.trim(),
      name: newName.trim(),
      nativeName: newNativeName.trim() || newName.trim(),
      localeTts: newLocaleTts.trim() || `${newCode}-US`,
      isActive: true,
      isDefault: false,
      orderIndex: languages.length + 1,
    });

    setNewCode('');
    setNewName('');
    setNewNativeName('');
    setNewLocaleTts('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Quản lý Danh mục Ngôn ngữ Hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các ngôn ngữ hỗ trợ thuyết minh và trợ lý Voice AI (Khớp PRD FR-CMS-08 & CSDL động)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm active:scale-95 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Thêm ngôn ngữ mới
        </button>
      </div>

      {/* Info Notice */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Cơ chế quản lý động:</span> Admin có thể Bật hoặc Tắt một ngôn ngữ bất kỳ. Khi Tắt, ngôn ngữ đó sẽ tự động ẩn khỏi giao diện chọn của du khách trên Mobile App. <strong>Tiếng Việt (vi)</strong> là ngôn ngữ gốc bắt buộc và không thể bị tắt.
        </div>
      </div>

      {/* Languages Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Thứ tự</th>
              <th className="py-3 px-4">Mã ISO</th>
              <th className="py-3 px-4">Tên bản địa</th>
              <th className="py-3 px-4">Tên tiếng Anh</th>
              <th className="py-3 px-4">Mã Locale TTS</th>
              <th className="py-3 px-4">Trạng thái Bật/Tắt</th>
              <th className="py-3 px-4">Mặc định</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {languages.map((lang, idx) => (
              <tr key={lang.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono text-slate-400">#{idx + 1}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{lang.code}</td>
                <td className="py-3.5 px-4 font-bold text-emerald-800">{lang.nativeName}</td>
                <td className="py-3.5 px-4 text-slate-600">{lang.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{lang.localeTts}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLanguageActive(lang.id)}
                      disabled={lang.isDefault}
                      className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                        lang.isActive ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                      } ${lang.isDefault ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={lang.isDefault ? 'Không thể tắt ngôn ngữ mặc định' : 'Bật/Tắt ngôn ngữ'}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                    </button>
                    <span
                      className={`text-[11px] font-semibold ${
                        lang.isActive ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {lang.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  {lang.isDefault ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Gốc (Bắt buộc)
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add Language */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Thêm ngôn ngữ mới vào hệ thống</h2>
            <p className="text-xs text-slate-500 mb-4">
              Cung cấp mã ISO và cấu hình giọng đọc TTS chuẩn cho ngôn ngữ mới
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mã ISO (VD: fr, de, ru)</label>
                <input
                  type="text"
                  required
                  placeholder="fr"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tên tiếng Anh (VD: French)</label>
                <input
                  type="text"
                  required
                  placeholder="French"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tên bản địa (VD: Français)</label>
                <input
                  type="text"
                  placeholder="Français"
                  value={newNativeName}
                  onChange={(e) => setNewNativeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mã Locale TTS (VD: fr-FR)</label>
                <input
                  type="text"
                  placeholder="fr-FR"
                  value={newLocaleTts}
                  onChange={(e) => setNewLocaleTts(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Lưu & Kích hoạt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
