import React, { useState } from 'react';
import { RecommendationData, HistoryItem } from '../types';
import { SummaryExporter } from './SummaryExporter';
import {
  Clock,
  Building2,
  UserCheck,
  Compass,
  CheckCircle2,
  Ban,
  FileText,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Award,
  ChevronLeft
} from 'lucide-react';

interface RecommendationScreenProps {
  recommendation: RecommendationData;
  chiefComplaint: string;
  history: HistoryItem[];
  onRestart: () => void;
}

export const RecommendationScreen: React.FC<RecommendationScreenProps> = ({
  recommendation,
  chiefComplaint,
  history,
  onRestart,
}) => {
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner Card - Positive Clinic Routing Focus */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>نتيجة التوجيه الطبي الموصى بها</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-white">
            توجيه العيادة والطبيب الأنسب لحالتك
          </h2>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-lg">
            تم تحليل الشكوى وإجاباتك بنجاح بواسطة الذكاء الاصطناعي لتوجيهك للقسم الطبي المختص وضمان حصولك على الرعاية الشاملة.
          </p>

          {/* Download Action Button Header CTA */}
          <div className="pt-2">
            <button
              onClick={() => setShowSummaryModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-teal-900 hover:bg-teal-50 font-extrabold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>تحميل ملخص الزيارة للمشاركة مع الطبيب</span>
              <ChevronLeft className="w-4 h-4 text-teal-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Appropriate Appointment Timing Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 text-teal-800 font-bold text-xs sm:text-sm">
          <Clock className="w-4 h-4 text-teal-600 shrink-0" />
          <span>الموعد المناسب للذهاب:</span>
        </div>

        <div className="bg-teal-50/80 p-3.5 rounded-xl border border-teal-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-teal-700 font-bold block">التوقيت الموصى به:</span>
            <p className="text-sm sm:text-base font-extrabold text-teal-950 leading-snug">
              {recommendation.recommendedTiming}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Clinic & Doctor Recommendation Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">التخصص والمركز الطبي</span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {recommendation.clinicInfo.clinicName}
              </h3>
            </div>
          </div>
        </div>

        {/* Doctor Name */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">الطبيب الاستشاري الموصى به:</span>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">
              {recommendation.clinicInfo.doctorName}
            </p>
          </div>
        </div>

        {/* Clinic Features */}
        {recommendation.clinicInfo.clinicFeatures && recommendation.clinicInfo.clinicFeatures.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>مميزات ومرافق العيادة:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {recommendation.clinicInfo.clinicFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-teal-50/60 border border-teal-100/80 rounded-xl p-2.5 text-xs font-bold text-teal-900 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Clinic Path / Directions Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Compass className="w-5 h-5 text-cyan-600 shrink-0" />
          <span>مسار العيادة وتوجيهات الوصول:</span>
        </div>

        <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100/80 text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
          {recommendation.clinicInfo.clinicPath}
        </div>
      </div>

      {/* 4. Waiting Period Instructions & Things to Avoid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Waiting Instructions */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>ماذا تفعل أثناء الانتظار:</span>
          </div>

          <ul className="space-y-2">
            {(recommendation.patientGuidance?.whileWaiting || []).map((item, idx) => (
              <li key={idx} className="bg-teal-50/40 p-2.5 rounded-xl border border-teal-100/60 text-xs font-medium text-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Things to Avoid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-xs sm:text-sm">
            <Ban className="w-4 h-4 text-rose-500 shrink-0" />
            <span>أمور يجب تجنبها:</span>
          </div>

          <ul className="space-y-2">
            {(recommendation.patientGuidance?.thingsToAvoid || []).map((item, idx) => (
              <li key={idx} className="bg-rose-50/40 p-2.5 rounded-xl border border-rose-100/60 text-xs font-medium text-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Actions & Summary Export */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowSummaryModal(true)}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all active:scale-98 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>تحميل ملخص الزيارة للمشاركة مع الطبيب</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer border border-slate-200"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>بدء فرز طبي جديد</span>
          </button>
        </div>

        {/* Disclaimer Note */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{recommendation.disclaimer}</span>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && (
        <SummaryExporter
          recommendation={recommendation}
          chiefComplaint={chiefComplaint}
          history={history}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
};
