import React, { useState } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface UrlInputFormProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const UrlInputForm: React.FC<UrlInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepend http:// if no scheme is present
    let urlToAnalyze = inputValue.trim();
    if (urlToAnalyze && !/^(https?:\/\/|ftp:\/\/)/i.test(urlToAnalyze)) {
        urlToAnalyze = 'http://' + urlToAnalyze;
    }
    onAnalyze(urlToAnalyze);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 bg-dark-card p-4 rounded-lg shadow-lg">
      <div className="relative w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-dark-subtext" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
          </svg>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a URL to analyze (e.g., example.com)"
          className="w-full bg-dark-bg border border-gray-600 text-dark-text rounded-md py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          disabled={isLoading}
          aria-label="URL Input"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-primary disabled:bg-brand-secondary disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
            <>
                <SpinnerIcon />
                Analyzing...
            </>
        ) : (
          'Analyze URL'
        )}
      </button>
    </form>
  );
};

export default UrlInputForm;
