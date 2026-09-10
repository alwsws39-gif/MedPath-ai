import React from 'react';
import { RecommendationData, HistoryItem } from '../types';
import { Download, Printer, X, Stethoscope, Clock, MapPin, AlertTriangle, CheckCircle, ShieldAlert, Calendar } from 'lucide-react';

interface SummaryExporterProps {
  recommendation: RecommendationData;
  chiefComplaint: string;
  history: HistoryItem[];
  onClose: () => void;
}

export const SummaryExporter: React.FC<SummaryExporterProps> = ({
  recommendation,
  chiefComplaint,
  history,
  onClose,
}) => {
  const currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const summaryText = `
═════════════════════════════════════════════════════════════
         تقرير التوجيه والفرز الطبي - MedPath AI
═════════════════════════════════════════════════════════════

التاريخ: ${currentDate} | الوقت: ${currentTime}

[الشكوى الرئيسية للمريض]
${chiefComplaint}

[تفاصيل إجابات الفرز]
${history.map((h, i) => `${i + 1}. ${h.question}\n   الإجابة: ${h.answer}`).join('\n')}

-------------------------------------------------------------
[توصية العيادة والطبيب الموهل]
-------------------------------------------------------------
الموعد المناسب للذهاب: ${recommendation.recommendedTiming}
العيادة والمركز: ${recommendation.clinicInfo.clinicName}
الطبيب الموصى به: ${recommendation.clinicInfo.doctorName}
مسار الوصول بالمنشأة: ${recommendation.clinicInfo.clinicPath}

مميزات العيادة:
${(recommendation.clinicInfo?.clinicFeatures || []).map((f) => `- ${f}`).join('\n')}

-------------------------------------------------------------
[إرشادات المريض أثناء الانتظار]
-------------------------------------------------------------
أفعال موصى بها:
${(recommendation.patientGuidance?.whileWaiting || []).map((w) => `• ${w}`).join('\n')}

أشياء يجب تجنبها:
${(recommendation.patientGuidance?.thingsToAvoid || []).map((a) => `• ${a}`).join('\n')}

-------------------------------------------------------------
إخلاء المسؤولية:
${recommendation.disclaimer}
═════════════════════════════════════════════════════════════
    `.trim();

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MedPath_Medical_Summary_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Printable Paper Container */}
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm sm:text-base">ملخص الزيارة الطبية للمشاركة مع الطبيب</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / PDF</span>
            </button>

            <button
              onClick={handleDownloadText}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>حفظ كملف نصي</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto font-['Cairo'] text-slate-800 print:p-0 print:overflow-visible" id="printable-area">
          {/* Document Header */}
          <div className="border-b-2 border-teal-600 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-lg">
                  M
                </div>
                <h1 className="text-xl font-extrabold text-slate-900">MedPath AI</h1>
              </div>
              <p className="text-xs font-semibold text-teal-700">تقرير الفرز والتوجيه الطبي الأولي</p>
            </div>

            <div className="text-left text-xs text-slate-500 font-medium space-y-0.5">
              <div className="flex items-center gap-1 justify-end">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Patient Complaint & Triage History */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h2 className="text-xs font-extrabold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. الشكوى الرئيسية وسجل الأعراض</span>
            </h2>
            <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
              "{chiefComplaint}"
            </div>

            {history.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-600 block">إجابات استبيان الفرز:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {history.map((h, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-slate-700">س: {h.question}</p>
                      <p className="font-semibold text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded">ج: {h.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Clinic & Doctor */}
          <div className="space-y-3 bg-teal-50/60 p-4 rounded-xl border border-teal-200">
            <h2 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              <span>2. العيادة والطبيب الموصى بهما</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="bg-white p-3 rounded-lg border border-teal-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">التوقيت المناسب للزيارة:</span>
                <p className="font-extrabold text-teal-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{recommendation.recommendedTiming}</span>
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-teal-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">الطبيب الاستشاري:</span>
                <p className="font-extrabold text-slate-900">{recommendation.clinicInfo.doctorName}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-teal-100 space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">العيادة والمركز:</span>
                <p className="font-extrabold text-slate-900 text-sm">{recommendation.clinicInfo.clinicName}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block">توجيهات مسار الوصول:</span>
                <p className="font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{recommendation.clinicInfo.clinicPath}</span>
                </p>
              </div>

              {(recommendation.clinicInfo?.clinicFeatures || []).length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">مميزات العيادة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(recommendation.clinicInfo?.clinicFeatures || []).map((feat, idx) => (
                      <span key={idx} className="bg-teal-100/70 text-teal-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guidance Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-1 text-teal-800">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>إرشادات الانتظار</span>
              </h3>
              <ul className="space-y-1 text-slate-700 font-medium">
                {(recommendation.patientGuidance?.whileWaiting || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 space-y-2">
              <h3 className="font-bold text-amber-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>أشياء يتجنبها المريض</span>
              </h3>
              <ul className="space-y-1 text-amber-950 font-medium">
                {(recommendation.patientGuidance?.thingsToAvoid || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 font-medium leading-normal flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>{recommendation.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
