import React, { useState } from 'react';
import { Header } from './components/Header';
import { InitialScreen } from './components/InitialScreen';
import { QuestionnaireScreen } from './components/QuestionnaireScreen';
import { RecommendationScreen } from './components/RecommendationScreen';
import {
  TriageStage,
  HistoryItem,
  QuestionData,
  RecommendationData,
  TriageApiResponse
} from './types';
import { AlertCircle, Stethoscope, RefreshCw } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<TriageStage>('initial');
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Call server API for triage processing
  const fetchTriageStep = async (complaintText: string, currentHistory: HistoryItem[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chiefComplaint: complaintText,
          history: currentHistory,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'حدث خطأ أثناء التواصل مع خادم الفرز الطبي.';
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
          if (typeof errorMsg === 'string' && errorMsg.startsWith('{')) {
            try {
              const inner = JSON.parse(errorMsg);
              errorMsg = inner?.error?.message || inner?.message || errorMsg;
            } catch (_) {}
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data: TriageApiResponse = await response.json();

      if (data.isLast) {
        setRecommendation(data as RecommendationData);
        setStage('recommendation');
      } else {
        setCurrentQuestion(data as QuestionData);
        setStage('questionnaire');
      }
    } catch (err: any) {
      console.error('Triage API Error:', err);
      setError(err?.message || 'عذراً، تعذر الاتصال بالنظام الطبي الذكي. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSubmit = (complaintText: string) => {
    setChiefComplaint(complaintText);
    setHistory([]);
    fetchTriageStep(complaintText, []);
  };

  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuestion) return;

    const newHistoryItem: HistoryItem = {
      question: currentQuestion.question,
      answer,
    };

    const updatedHistory = [...history, newHistoryItem];
    setHistory(updatedHistory);
    fetchTriageStep(chiefComplaint, updatedHistory);
  };

  const handleGoBack = () => {
    if (history.length === 0) {
      setStage('initial');
      setCurrentQuestion(null);
      return;
    }

    const updatedHistory = history.slice(0, -1);
    setHistory(updatedHistory);

    if (updatedHistory.length === 0) {
      setStage('initial');
      setCurrentQuestion(null);
    } else {
      fetchTriageStep(chiefComplaint, updatedHistory);
    }
  };

  const handleReset = () => {
    setStage('initial');
    setChiefComplaint('');
    setHistory([]);
    setCurrentQuestion(null);
    setRecommendation(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Fixed Header */}
      <Header onReset={handleReset} canReset={stage !== 'initial'} />

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-5 sm:py-6 space-y-4">
        {/* Error Alert Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 flex items-start gap-3 shadow-xs animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm font-semibold leading-relaxed">
              <p>{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (stage === 'initial' && chiefComplaint) {
                    handleInitialSubmit(chiefComplaint);
                  } else if (stage === 'questionnaire' && history.length > 0) {
                    fetchTriageStep(chiefComplaint, history);
                  }
                }}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          </div>
        )}

        {/* View Router */}
        {stage === 'initial' && (
          <InitialScreen onSubmit={handleInitialSubmit} isLoading={isLoading} />
        )}

        {stage === 'questionnaire' && currentQuestion && (
          <QuestionnaireScreen
            questionData={currentQuestion}
            stepNumber={history.length + 1}
            totalEstimatedSteps={Math.max(history.length + 1, 4)}
            history={history}
            onSubmitAnswer={handleAnswerSubmit}
            onGoBack={handleGoBack}
            isLoading={isLoading}
          />
        )}

        {stage === 'recommendation' && recommendation && (
          <RecommendationScreen
            recommendation={recommendation}
            chiefComplaint={chiefComplaint}
            history={history}
            onRestart={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-medium mt-auto">
        <div className="max-w-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-800">MedPath AI</span>
            <span>- منصة التوجيه الطبي الذكية</span>
          </div>
          <span className="text-[11px] text-slate-400">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
