import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ArrowRight, Send, Edit3, CheckCircle2, History } from 'lucide-react';
import { QuestionData, HistoryItem } from '../types';

interface QuestionnaireScreenProps {
  questionData: QuestionData;
  stepNumber: number;
  totalEstimatedSteps: number;
  history: HistoryItem[];
  onSubmitAnswer: (answer: string) => void;
  onGoBack: () => void;
  isLoading: boolean;
}

export const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({
  questionData,
  stepNumber,
  totalEstimatedSteps,
  history,
  onSubmitAnswer,
  onGoBack,
  isLoading,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Reset local state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setCustomText('');
    setIsCustomInputActive(false);
  }, [questionData.question]);

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    setIsCustomInputActive(false);
  };

  const handleSelectCustomOption = () => {
    setSelectedOption(null);
    setIsCustomInputActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (isCustomInputActive) {
      if (customText.trim()) {
        onSubmitAnswer(customText.trim());
      }
    } else if (selectedOption) {
      onSubmitAnswer(selectedOption);
    }
  };

  const currentAnswerValue = isCustomInputActive ? customText.trim() : selectedOption;
  const progressPercent = Math.min(100, Math.round((stepNumber / totalEstimatedSteps) * 100));

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Progress & Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>سؤال الفرز {stepNumber}</span>
          </div>
          <span className="text-slate-500 font-semibold">
            التقدم المقدر ~ {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="space-y-2">
          <span className="text-xs font-bold text-teal-600 tracking-wide block">
            الرجاء تحديد الخيار الأنسب لحالتك:
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {questionData.question}
          </h3>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-2.5">
          {(questionData.options || []).map((option, idx) => {
            const isSelected = selectedOption === option && !isCustomInputActive;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(option)}
                className={`w-full text-right p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between cursor-pointer active:scale-99 ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="leading-relaxed">{option}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mr-2 transition-colors ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}

          {/* CRITICAL: Dedicated Custom Free-Text Option */}
          {questionData.allowCustomInput !== false && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSelectCustomOption}
                className={`w-full text-right p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between cursor-pointer active:scale-99 ${
                  isCustomInputActive
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 ring-2 ring-cyan-500/20 shadow-xs'
                    : 'bg-slate-50/50 hover:bg-slate-100/70 border-dashed border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-600" />
                  <span>أخرى / كتابة تفاصيل إضافية مخصصة...</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mr-2 ${
                    isCustomInputActive
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isCustomInputActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>

              {/* Custom Input Textarea if active */}
              {isCustomInputActive && (
                <div className="mt-3 space-y-1.5 animate-fadeIn">
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="اكتب توضيحك أو تفاصيلك الخاصة هنا..."
                    rows={3}
                    autoFocus
                    className="w-full p-3 text-sm text-slate-800 bg-white rounded-xl border border-cyan-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 outline-none resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    يمكنك إضافة أي ملحوظة دقيقة ترغب في إبلاغ الطبيب بها.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onGoBack}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <button
            type="submit"
            disabled={!currentAnswerValue || isLoading}
            className={`flex-1 max-w-xs py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer ${
              !currentAnswerValue || isLoading
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-teal-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري معالجة الإجابة...</span>
              </>
            ) : (
              <>
                <span>تأكيد الإجابة والمتابعة</span>
                <Send className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* History Collapsible Box */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <span>مراجعة الإجابات السابقة ({history.length})</span>
            </div>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && (
            <div className="p-4 space-y-3 divide-y divide-slate-100 bg-white">
              {history.map((item, idx) => (
                <div key={idx} className={`${idx > 0 ? 'pt-3' : ''} space-y-1`}>
                  <p className="text-xs font-bold text-slate-700">
                    <span className="text-teal-600 font-extrabold ml-1">س{idx + 1}:</span>
                    {item.question}
                  </p>
                  <p className="text-xs font-medium text-teal-800 bg-teal-50/70 p-2 rounded-lg border border-teal-100 inline-block w-full">
                    <span className="font-bold text-teal-900 ml-1">ج:</span>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
