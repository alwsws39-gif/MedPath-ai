import React from 'react';
import { Stethoscope, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  canReset: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, canReset }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-xs">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 ring-2 ring-teal-100">
            <Stethoscope className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight">
                MedPath <span className="text-teal-600">AI</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                ذكاء طبي
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              نظام التوجيه والفرز للعيادات الطبية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors active:scale-95 cursor-pointer"
              title="بدء استشارة جديدة"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>استشارة جديدة</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>آمن وخصوصي</span>
          </div>
        </div>
      </div>
    </header>
  );
};
