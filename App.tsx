import React, { useState, useCallback, useEffect } from 'react';
import { generatePoemFromCoords } from './services/geminiService';
import type { Status, PoemData } from './types';

// --- Helper Components (defined outside App to prevent re-creation on re-renders) ---

const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-3.48-2.146l-3.114 1.04a2.25 2.25 0 00-1.884 2.146l.208 1.042a2.25 2.25 0 002.146 1.884l1.042.208a2.25 2.25 0 002.146-1.884l1.04-3.114a3 3 0 00-2.146-3.48z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.47 11.878a3 3 0 00-3.48-2.146l-3.114 1.04a2.25 2.25 0 00-1.884 2.146l.208 1.042a2.25 2.25 0 002.146 1.884l1.042.208a2.25 2.25 0 002.146-1.884l1.04-3.114a3 3 0 00-2.146-3.48zM15 9.75a3 3 0 013-3h.008v.008a3 3 0 01-3 3h-.008v-.008z" />
  </svg>
);

const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.044.586.059a2.25 2.25 0 012.138 2.138c.015.196.034.39.059.586m0 0a2.25 2.25 0 002.186 0m-2.186 0c-.196-.015-.39-.034-.586-.059a2.25 2.25 0 00-2.138-2.138c-.025-.195-.044-.39-.059-.586m0 0a2.25 2.25 0 000 2.186" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);


const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


const LoadingIndicator: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 text-cyan-200">
    <div className="relative flex h-5 w-5 items-center justify-center">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
    </div>
    <p className="mt-4 text-lg animate-pulse">{text}</p>
  </div>
);

const GeneratingCard: React.FC<{ text: string }> = ({ text }) => (
  <div 
    className="animate-fade-in w-full max-w-lg bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl shadow-purple-500/10 p-8 flex flex-col items-center justify-center text-center transition-all duration-500 animate-generating-bg"
    style={{ minHeight: '280px' }}
  >
    <LoadingIndicator text={text} />
  </div>
);


interface PoemCardProps {
  data: PoemData;
  onRegenerate: () => void;
  onShare: () => void;
  isCopied: boolean;
}

const PoemCard: React.FC<PoemCardProps> = ({ data, onRegenerate, onShare, isCopied }) => {
    const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
    const canClipboardCopy = typeof navigator !== 'undefined' && !!navigator.clipboard;
    const supportsInteraction = canNativeShare || canClipboardCopy;

    return (
        <div className="animate-fade-in w-full max-w-lg bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl shadow-purple-500/10 p-8 flex flex-col items-center text-center transition-all duration-500">
            <h2 className="text-3xl font-bold text-cyan-300 tracking-wider">{data.cityName}</h2>
            <div className="w-24 h-px bg-cyan-300/50 my-4"></div>
            <div className="font-lora text-lg md:text-xl text-gray-200 leading-relaxed my-4">
                {data.poem.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
                <button
                    onClick={onRegenerate}
                    className="flex items-center gap-2 px-6 py-2 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30 hover:bg-cyan-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    <WandIcon className="h-5 w-5" />
                    Another Verse
                </button>
                {supportsInteraction && (
                    <button
                        onClick={onShare}
                        disabled={isCopied}
                        aria-label={canNativeShare ? "Share poem" : "Copy poem to clipboard"}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 hover:bg-purple-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCopied ? (
                            <>
                                <CheckIcon className="h-5 w-5 text-green-400" />
                                Copied!
                            </>
                        ) : (
                            <>
                                {canNativeShare ? <ShareIcon className="h-5 w-5" /> : <ClipboardIcon className="h-5 w-5" />}
                                {canNativeShare ? 'Share' : 'Copy Poem'}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void; }> = ({ message, onRetry }) => (
    <div className="w-full max-w-md bg-red-900/20 backdrop-blur-md rounded-xl border border-red-500/30 shadow-2xl shadow-red-500/10 p-8 flex flex-col items-center text-center">
        <h3 className="text-xl font-bold text-red-300">An Echo in the Void</h3>
        <p className="text-red-200 mt-2">{message}</p>
        <button
            onClick={onRetry}
            className="mt-6 px-6 py-2 bg-red-500/20 text-red-300 rounded-full border border-red-500/30 hover:bg-red-500/40 transition-all"
        >
            Try Again
        </button>
    </div>
);

interface HistoryPanelProps {
  history: PoemData[];
  onClose: () => void;
  onSelectPoem: (poem: PoemData) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClose, onSelectPoem }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-end"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="w-full max-w-md h-full bg-[#100e23] shadow-2xl shadow-purple-500/20 flex flex-col animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-cyan-300">Recent Verses</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close history"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.length > 0 ? (
            history.map((item, index) => (
              <button
                key={index}
                onClick={() => onSelectPoem(item)}
                className="w-full text-left bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <h4 className="font-bold text-cyan-400 text-lg">{item.cityName}</h4>
                <div className="w-16 h-px bg-cyan-400/50 my-2"></div>
                <p className="font-lora text-gray-300 whitespace-pre-wrap">{item.poem}</p>
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-8">Your poetic journey will be recorded here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [poemData, setPoemData] = useState<PoemData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [poemHistory, setPoemHistory] = useState<PoemData[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('poemHistory');
      if (storedHistory) {
        setPoemHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load poem history from localStorage:", error);
      localStorage.removeItem('poemHistory');
    }
  }, []);

  const handlePoemGeneration = useCallback(async () => {
    setStatus('locating');
    setError(null);
    setIsHistoryVisible(false);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus('generating');
        const { latitude, longitude } = position.coords;
        try {
          const data = await generatePoemFromCoords(latitude, longitude);
          setPoemData(data);
          setStatus('success');

          setPoemHistory(prevHistory => {
            const filteredHistory = prevHistory.filter(p => p.cityName !== data.cityName);
            const newHistory = [data, ...filteredHistory].slice(0, 5); 
            try {
              localStorage.setItem('poemHistory', JSON.stringify(newHistory));
            } catch (e) {
              console.error("Failed to save poem history to localStorage:", e);
            }
            return newHistory;
          });

        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "An unknown error occurred.");
          setStatus('error');
        }
      },
      (geoError) => {
        let errorMessage = "Could not get your location.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMessage = "Location access was denied. Please enable it in your browser settings to continue.";
        }
        setError(errorMessage);
        setStatus('error');
      }
    );
  }, []);

  const handleShare = useCallback(async () => {
    if (!poemData) return;

    const shareText = `I discovered a poem for ${poemData.cityName}:\n\n${poemData.poem}\n\nGenerated by Location-Based Poetry.`;

    if (navigator.share) { // Use Web Share API if available
        try {
            await navigator.share({
                title: `Poem for ${poemData.cityName}`,
                text: shareText,
            });
        } catch (err) {
            // It's common for users to cancel the share dialog, which throws an AbortError.
            // We don't need to log this as a failure.
            if (err instanceof Error && err.name !== 'AbortError') {
              console.error('Share failed:', err);
            }
        }
    } else if (navigator.clipboard) { // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(shareText);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
    }
  }, [poemData]);

  const handleSelectHistoryItem = (poem: PoemData) => {
    setPoemData(poem);
    setStatus('success');
    setIsHistoryVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (status) {
      case 'locating':
        return <LoadingIndicator text="Finding your place in the cosmos..." />;
      case 'generating':
        return <GeneratingCard text="Translating the skyline into verse..." />;
      case 'success':
        return poemData ? <PoemCard data={poemData} onRegenerate={handlePoemGeneration} onShare={handleShare} isCopied={isCopied} /> : null;
      case 'error':
        return <ErrorDisplay message={error || "Something went wrong."} onRetry={handlePoemGeneration} />;
      case 'idle':
      default:
        return (
          <div className="text-center flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 mb-4">
              Location-Based Poetry
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mb-8">
              Discover the hidden, surreal verse of your current location. Let AI weave a poem from the fabric of your city.
            </p>
            <button
              onClick={handlePoemGeneration}
              className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-gray-800 rounded-full overflow-hidden border border-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="absolute h-0 w-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 ease-out group-hover:h-32 group-hover:w-full"></span>
              <span className="relative flex items-center gap-3">
                <LocationIcon className="h-6 w-6"/>
                Reveal the Poem of this Place
              </span>
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-3xl transition-opacity duration-700">
          {renderContent()}
        </div>
      </main>
      {poemHistory.length > 0 && !isHistoryVisible && (
        <button
          onClick={() => setIsHistoryVisible(true)}
          className="fixed bottom-6 right-6 z-30 p-4 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 hover:bg-purple-500/40 backdrop-blur-md shadow-lg hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="View poem history"
        >
          <HistoryIcon className="h-6 w-6" />
        </button>
      )}
      {isHistoryVisible && <HistoryPanel history={poemHistory} onClose={() => setIsHistoryVisible(false)} onSelectPoem={handleSelectHistoryItem} />}
    </>
  );
}

export default App;
