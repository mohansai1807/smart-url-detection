import React from 'react';
import { HistoryItem, Classification } from '../types';

const getStatusStyles = (classification: Classification | 'Mixed') => {
  switch (classification) {
    case 'Benign':
      return 'bg-success';
    case 'Phishing':
    case 'Malware':
    case 'Defacement':
      return 'bg-danger';
    case 'Suspicious':
    case 'Mixed':
      return 'bg-warning';
    default:
      return 'bg-gray-500';
  }
};

const timeAgo = (timestamp: number): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp) / 1000);

    if (seconds < 60) return "just now";
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

interface HistoryDisplayProps {
    history: HistoryItem[];
    onSelectItem: (item: HistoryItem) => void;
    onClearHistory: () => void;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onSelectItem, onClearHistory }) => {
    if (history.length === 0) {
        return null;
    }

    return (
        <section className="bg-dark-card p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-white">Analysis History</h2>
                <button
                    onClick={onClearHistory}
                    className="text-sm text-dark-subtext hover:text-danger transition-colors focus:outline-none"
                    aria-label="Clear analysis history"
                >
                    Clear History
                </button>
            </div>
            <div className="max-h-60 overflow-y-auto pr-2">
                 <ul className="space-y-2">
                    {history.map((item) => (
                        <li key={item.timestamp}>
                            <button
                                onClick={() => onSelectItem(item)}
                                className="w-full text-left p-3 bg-dark-bg rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                aria-label={`View analysis for ${item.url}`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span 
                                            className={`flex-shrink-0 w-3 h-3 rounded-full ${getStatusStyles(item.finalVerdict.classification)}`}
                                            aria-label={`Verdict: ${item.finalVerdict.classification}`}
                                            title={`Verdict: ${item.finalVerdict.classification}`}
                                        ></span>
                                        <p className="text-dark-text truncate" title={item.url}>{item.url}</p>
                                    </div>
                                    <span className="text-xs text-dark-subtext flex-shrink-0">{timeAgo(item.timestamp)}</span>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default HistoryDisplay;
