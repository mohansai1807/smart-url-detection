
import React from 'react';
import { UrlAnalysis, FinalVerdict, VerdictStatus, Classification } from '../types';

interface ResultsDisplayProps {
  isLoading: boolean;
  analysisResult: UrlAnalysis | null;
  finalVerdict: FinalVerdict | null;
  url: string | null;
}

const getStatusStyles = (classification: Classification | 'Mixed') => {
  switch (classification) {
    case 'Benign':
      return {
        bgColor: 'bg-success/20',
        borderColor: 'border-success',
        textColor: 'text-success',
        barColor: 'bg-success',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
      };
    case 'Phishing':
    case 'Malware':
    case 'Defacement':
      return {
        bgColor: 'bg-danger/20',
        borderColor: 'border-danger',
        textColor: 'text-danger',
        barColor: 'bg-danger',
        icon: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
      };
    case 'Suspicious':
    case 'Mixed':
      return {
        bgColor: 'bg-warning/20',
        borderColor: 'border-warning',
        textColor: 'text-warning',
        barColor: 'bg-warning',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )
      };
    default:
        return { bgColor: 'bg-dark-card', borderColor: 'border-gray-600', textColor: 'text-dark-subtext', barColor: 'bg-gray-500', icon: null };
  }
};


const VerdictCard: React.FC<{ verdict: FinalVerdict; url: string | null }> = ({ verdict, url }) => {
    const { bgColor, borderColor, textColor, icon } = getStatusStyles(verdict.classification);

    return (
        <div className={`p-4 rounded-lg border ${borderColor} ${bgColor} flex items-center gap-4`}>
            <div className={`flex-shrink-0 ${textColor}`}>{icon}</div>
            <div className="flex-grow">
                <h2 className={`text-xl font-bold ${textColor}`}>
                    Final Verdict: <span className="capitalize">{verdict.classification}</span>
                </h2>
                <p className="text-dark-subtext mt-1">{verdict.message}</p>
            </div>
            {verdict.classification === 'Benign' && url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-dark-card text-dark-text font-bold py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary transition-colors"
                >
                    Visit Site
                </a>
            )}
        </div>
    );
};

const ConfidenceBar: React.FC<{ confidence: number; classification: Classification }> = ({ confidence, classification }) => {
    const { barColor, textColor } = getStatusStyles(classification);
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-dark-subtext text-sm font-medium">Confidence Score</span>
                <span className={`text-lg font-bold ${textColor}`}>{confidence.toFixed(0)}%</span>
            </div>
            <div 
                className="w-full bg-gray-700 rounded-full h-2.5" 
                role="progressbar" 
                aria-valuenow={confidence} 
                aria-valuemin={0} 
                aria-valuemax={100} 
                aria-label="Confidence score"
            >
                <div 
                    className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-in-out`} 
                    style={{ width: `${confidence}%` }}
                ></div>
            </div>
        </div>
    );
};


const AnalysisCard: React.FC<{ title: string; result: UrlAnalysis['lstm'] }> = ({ title, result }) => {
    const { textColor } = getStatusStyles(result.classification);

    return (
        <div className="bg-dark-card p-5 rounded-lg shadow-lg flex-1 min-w-[300px] flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>

            <div className="w-full mb-4">
                <span className="text-dark-subtext text-sm">Classification</span>
                <p className={`font-bold text-lg ${textColor}`}>{result.classification}</p>
            </div>
            
            <div className="mb-4">
                <ConfidenceBar confidence={result.confidence} classification={result.classification} />
            </div>

            <div className="w-full mt-auto">
                <span className="text-dark-subtext text-sm">Reasoning</span>
                <p className="text-dark-text mt-1 text-base">{result.reasoning}</p>
            </div>
        </div>
    );
};

const SkeletonCard: React.FC = () => (
    <div className="bg-dark-card p-5 rounded-lg shadow-lg flex-1 min-w-[300px]">
         <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
         <div className="space-y-4">
             <div className="h-4 bg-gray-700 rounded w-1/4"></div>
             <div className="h-8 bg-gray-700 rounded w-3/4"></div>
             <div className="h-4 bg-gray-700 rounded w-1/4 mt-4"></div>
             <div className="h-6 bg-gray-700 rounded w-full"></div>
             <div className="h-4 bg-gray-700 rounded w-1/4 mt-4"></div>
             <div className="h-10 bg-gray-700 rounded w-full"></div>
         </div>
    </div>
);

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-dark-card rounded-lg"></div>
        <div className="space-y-8 mt-6">
            <div>
                <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
            <div>
                <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
            <div>
                <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        </div>
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, analysisResult, finalVerdict, url }) => {
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!analysisResult || !finalVerdict) {
        return (
            <div className="text-center bg-dark-card p-8 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-dark-subtext" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="mt-4 text-xl font-medium text-white">Awaiting Analysis</h2>
                <p className="mt-1 text-dark-subtext">Enter a URL above to begin the security analysis.</p>
            </div>
        );
    }
    
  return (
    <section className="space-y-6">
        <VerdictCard verdict={finalVerdict} url={url} />
        
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-gray-700 pb-2">Department of Sequential Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnalysisCard title="LSTM Model Analysis" result={analysisResult.lstm} />
                    <AnalysisCard title="Neural Network Analysis" result={analysisResult.neuralNetwork} />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-gray-700 pb-2">Department of Ensemble Methods</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnalysisCard title="Random Forest Analysis" result={analysisResult.randomForest} />
                    <AnalysisCard title="XGBoost Model Analysis" result={analysisResult.xgboost} />
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-gray-700 pb-2">Department of Advanced Classification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnalysisCard title="SVM Model Analysis" result={analysisResult.svm} />
                    <AnalysisCard title="Hybrid Algorithm Analysis" result={analysisResult.hybrid} />
                </div>
            </div>
        </div>
    </section>
  );
};

export default ResultsDisplay;