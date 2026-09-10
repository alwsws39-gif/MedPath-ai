export interface HistoryItem {
  question: string;
  answer: string;
}

export interface QuestionData {
  isLast: false;
  question: string;
  options: string[];
  allowCustomInput: boolean;
}

export interface ClinicInfo {
  clinicName: string;
  doctorName: string;
  clinicFeatures: string[];
  clinicPath: string;
}

export interface PatientGuidance {
  whileWaiting: string[];
  thingsToAvoid: string[];
}

export interface RecommendationData {
  isLast: true;
  recommendedTiming: string;
  clinicInfo: ClinicInfo;
  patientGuidance: PatientGuidance;
  disclaimer: string;
}

export type TriageApiResponse = QuestionData | RecommendationData;

export type TriageStage = 'initial' | 'questionnaire' | 'recommendation';
