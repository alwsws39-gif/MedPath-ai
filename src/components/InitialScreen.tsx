import React, { useState } from 'react';
import { Send, Mic, MicOff, MessageSquarePlus, Activity, Clock, ShieldAlert, HeartPulse, ChevronRight } from 'lucide-react';

interface InitialScreenProps {
  onSubmit: (chiefComplaint: string) => void;
  isLoading: boolean;
}

interface BodyCategory {
  id: string;
  name: string;
  icon: string;
  symptoms: string[];
}

const BODY_CATEGORIES: BodyCategory[] = [
  {
    id: 'stomach',
    name: 'المعدة والجهاز الهضمي',
    icon: '🩺',
    symptoms: [
      'ألم في البطن/المعدة بعد الوجبات مع غثيان',
      'انتفاخ وعسر هضم مع حموضة أو حرقة في المريء',
      'تقلصات وألم مغص في أسفل البطن',
    ],
  },
  {
    id: 'head',
    name: 'الرأس والوجه والعين',
    icon: '🧠',
    symptoms: [
      'صداع نصفي مستمر يزداد مع الضوء والضوضاء',
      'صداع بالكرات مع زغللة بالعين أو احمرار',
      'ألم وشعور بالضغط في الجيوب الأنفية مع دوخة',
    ],
  },
  {
    id: 'chest',
    name: 'الصدر والتنفس',
    icon: '🫁',
    symptoms: [
      'سعال جاف مستمر مع ضيق في التنفس وصفير',
      'ألم أو ضغط خفيف في منتصف الصدر عند المجهود',
      'احتقان بالحلق وارتفاع خفيف بالحرارة مع بلغم',
    ],
  },
  {
    id: 'bones',
    name: 'العظام والمفاصل والظهر',
    icon: '🦴',
    symptoms: [
      'ألم وحرارة بالركبة أثناء المشي وصعوبة بالدرج',
      'ألم وثقل أسفل الظهر مع يمتد للساق',
      'تصلب وتيبس بمفاصل اليدين صباحاً',
    ],
  },
  {
    id: 'ent',
    name: 'الأنف والأذن والحنجرة',
    icon: '👂',
    symptoms: [
      'ألم وطنين في الأذن مع ضعف في السمع',
      'صعوبة في البلع مع التهاب الحلق',
      'انسداد بالأنف مع فقدان حاسة الشم مؤقتاً',
    ],
  },
];

export const InitialScreen: React.FC<InitialScreenProps> = ({ onSubmit, isLoading }) => {
  const [complaint, setComplaint] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (complaint.trim() && !isLoading) {
      onSubmit(complaint.trim());
    }
  };

  const handleCategorySelect = (category: BodyCategory) => {
    setSelectedCategory(category.id);
  };

  const handleSymptomSelect = (symptomText: string) => {
    setComplaint(symptomText);
    onSubmit(symptomText);
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("عذراً، خاصية الإملاء الصوتي غير مدعومة في هذا المتصفح. يمكنك الكتابة مباشرة.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setComplaint((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const activeCategoryObj = BODY_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 p-5 sm:p-6 text-white shadow-lg">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.25),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold border border-teal-400/30 backdrop-blur-md">
            <HeartPulse className="w-3.5 h-3.5 text-teal-300" />
            <span>نظام التوجيه الفوري والسريع للعيادة المناسبة</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug text-white">
            مرحباً بك في MedPath AI
          </h2>
          
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-lg">
            حدد منطقة العضو المتأثر أو اكتب أعراضك مباشرة بشكل حر. يطرح النظام أسئلة متسلسلة للتعمق في حالتك وتوجيهك فوراً للعيادة المناسبة.
          </p>

          <div className="pt-2 grid grid-cols-3 gap-2 border-t border-teal-700/50 text-[11px] text-teal-200">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span>استجابة فائقة السرعة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span>أسئلة متدرجة متخصصة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span>توجيه بدقيق وآمن</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Primary Body Parts / Organs (النماذج الجاهزة المتدرجة) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>اختر العضو أو الجزء الأساسي المشتبه به (اختياري للسريعين):</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BODY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-500/20 font-bold shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xl">{cat.icon}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-teal-600 rotate-90' : 'text-slate-400'}`} />
                </div>
                <span className="text-xs leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-symptoms for selected Category */}
        {activeCategoryObj && (
          <div className="pt-2 border-t border-slate-100 space-y-2 animate-fadeIn">
            <span className="text-[11px] font-bold text-teal-700 block">
              اختر العرض الأقرب لحالتك لتوليد الأسئلة المتخصصة فوراً:
            </span>
            <div className="space-y-1.5">
              {activeCategoryObj.symptoms.map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSymptomSelect(sym)}
                  disabled={isLoading}
                  className="w-full text-right p-2.5 rounded-lg bg-teal-50/60 hover:bg-teal-100/80 border border-teal-200/80 text-xs font-bold text-teal-950 transition-all flex items-center justify-between cursor-pointer active:scale-99"
                >
                  <span>"{sym}"</span>
                  <span className="text-[10px] text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200 font-bold shrink-0 mr-2">
                    بدء الفرز →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Free-Text Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <MessageSquarePlus className="w-4 h-4 text-teal-600" />
            <span>أو اكتب شكواك وأعراضك بالتفصيل الكامل:</span>
          </label>
          <span className="text-[11px] font-medium text-slate-400">
            {complaint.length} حرف
          </span>
        </div>

        <div className="relative">
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="مثال: عندي ألم في المعدة من أمس بعد تناول الطعام وبدأ يشتد اليوم، مع الشعور بغثيان وحرقة..."
            rows={3}
            disabled={isLoading}
            className="w-full p-3.5 sm:p-4 text-sm text-slate-800 bg-slate-50/60 rounded-xl border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15 outline-none transition-all resize-none placeholder:text-slate-400 font-medium leading-relaxed"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            disabled={isLoading}
            className={`absolute left-3 bottom-3 p-2 rounded-lg border transition-all ${
              isListening
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                : 'bg-white text-slate-500 hover:text-teal-600 border-slate-200 hover:border-teal-300 shadow-xs'
            }`}
            title={isListening ? "إيقاف الاستماع" : "التحدث بصوتك (إملاء صوتی)"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!complaint.trim() || isLoading}
          className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base text-white flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98 cursor-pointer ${
            !complaint.trim() || isLoading
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-teal-600/25'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جاري التحليل السريع وتوليد الأسئلة...</span>
            </>
          ) : (
            <>
              <span>بدء التحليل الفوري وتوليد الأسئلة</span>
              <Send className="w-4 h-4 rotate-180" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
