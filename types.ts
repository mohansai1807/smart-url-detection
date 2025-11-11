export type Classification = 'Benign' | 'Phishing' | 'Malware' | 'Defacement' | 'Suspicious';

export interface AnalysisResult {
  classification: Classification;
  confidence: number;
  reasoning: string;
}

export interface UrlAnalysis {
  lstm: AnalysisResult;
  randomForest: AnalysisResult;
  xgboost: AnalysisResult;
  hybrid: AnalysisResult;
  svm: AnalysisResult;
  neuralNetwork: AnalysisResult;
}

export enum VerdictStatus {
  Clear,
  Mixed,
  Pending
}

export interface FinalVerdict {
    status: VerdictStatus;
    message: string;
    classification: Classification | 'Mixed';
}

export interface HistoryItem {
  url: string;
  analysisResult: UrlAnalysis;
  finalVerdict: FinalVerdict;
  timestamp: number;
}
