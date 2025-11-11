import React, { useState, useCallback, useEffect } from 'react';
// Assuming the definitions for UrlAnalysis, FinalVerdict, VerdictStatus, Classification, HistoryItem are correct in ./types
import { UrlAnalysis, FinalVerdict, VerdictStatus, Classification, HistoryItem } from './types'; 
import { analyzeUrl } from './services/geminiService';
import UrlInputForm from './components/UrlInputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { GithubIcon } from './components/icons/GithubIcon';
import HistoryDisplay from './components/HistoryDisplay';

const HISTORY_KEY = 'urlAnalysisHistory';
const MAX_HISTORY_ITEMS = 20;
// CORRECTED: Only 4 models are analyzed (LSTM, RF, XGBoost, Hybrid)
const TOTAL_MODELS_ANALYZED = 4;


const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<UrlAnalysis | null>(null);
  const [finalVerdict, setFinalVerdict] = useState<FinalVerdict | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const updateHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  };


  const getFinalVerdict = (result: UrlAnalysis): FinalVerdict => {
    // RECTIFIED: Only pull classifications from the 4 models defined in geminiservices.tsx
    const classifications: Classification[] = [
      result.lstm.classification,
      result.randomForest.classification,
      result.xgboost.classification,
      result.hybrid.classification,
    ];

    const classificationCounts = classifications.reduce((acc, c) => {
        acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {} as Record<Classification, number>);

    const benignCount = classificationCounts.Benign || 0;
    const totalModels = TOTAL_MODELS_ANALYZED; // Set to 4

    if (benignCount === totalModels) {
      return {
        status: VerdictStatus.Clear,
        message: 'All analysis models agree the URL is benign.',
        classification: 'Benign',
      };
    }

    // Find the most frequent malicious classification
    let mostFrequentMalicious: Classification | null = null;
    let maxCount = 0;
    for (const c of Object.keys(classificationCounts) as Classification[]) {
        if (c !== 'Benign' && classificationCounts[c] > maxCount) {
            maxCount = classificationCounts[c];
            mostFrequentMalicious = c;
        }
    }

    // RECTIFIED: Strong consensus threshold set to 3/4 models (>= 75%)
    if (mostFrequentMalicious && maxCount >= 3) {
        return {
            status: VerdictStatus.Clear,
            message: `A strong consensus (${maxCount}/${totalModels}) among analysis models suggests the URL is a ${mostFrequentMalicious} threat.`,
            classification: mostFrequentMalicious,
        };
    }

    return {
      status: VerdictStatus.Mixed,
      message: 'The analysis models produced conflicting or varied results. Proceed with extreme caution.',
      classification: 'Mixed',
    };
  };

  const handleAnalyze = useCallback(async (newUrl: string) => {
    if (!newUrl) {
      setError('Please enter a URL to analyze.');
      return;
    }
    setUrl(newUrl);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setFinalVerdict(null);

    try {
      // analyzeUrl now returns the correct 4-model structure
      const result: UrlAnalysis = await analyzeUrl(newUrl); 
      const verdict = getFinalVerdict(result);
      setAnalysisResult(result);
      setFinalVerdict(verdict);

       // Add to history
      const newHistoryItem: HistoryItem = {
        url: newUrl,
        analysisResult: result,
        finalVerdict: verdict,
        timestamp: Date.now()
      };
      
      // Remove any existing entry with the same URL, add new one to the top, and limit size
      const updatedHistory = [
        newHistoryItem,
        ...history.filter(item => item.url !== newUrl)
      ].slice(0, MAX_HISTORY_ITEMS);
      
      updateHistory(updatedHistory);

    } catch (e) {
      console.error(e);
      setError(`An error occurred during analysis: ${(e as Error).message}. Please check the URL or try again later.`);
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setUrl(item.url);
    setAnalysisResult(item.analysisResult);
    setFinalVerdict(item.finalVerdict);
    setError(null);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    updateHistory([]);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <header className="text-center">
            <div className="flex justify-center items-center gap-4 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">Smart URL Analyzer</h1>
            </div>
        </header>

        <UrlInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        
        {error && (
            <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-md text-center" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <HistoryDisplay 
            history={history}
            onSelectItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
        />

        <ResultsDisplay
          isLoading={isLoading}
          analysisResult={analysisResult}
          finalVerdict={finalVerdict}
          url={url}
        />

      </main>
      <footer className="w-full max-w-4xl mx-auto text-center mt-auto pt-8">
        <p className="text-dark-subtext text-sm">
          Built with React, TypeScript, Tailwind CSS, and the Gemini API.
        </p>
        <a href="https://github.com/google-gemini" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-dark-subtext hover:text-brand-primary transition-colors mt-2">
            <GithubIcon />
            View Gemini on GitHub
        </a>
      </footer>
    </div>
  );
};

export default App;