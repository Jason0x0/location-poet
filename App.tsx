
import React, { useState, useCallback } from 'react';
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


const LoadingIndicator: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 text-cyan-200">
    <div className="relative flex h-5 w-5 items-center justify-center">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
    </div>
    <p className="mt-4 text-lg animate-pulse">{text}</p>
  </div>
);

interface PoemCardProps {
  data: PoemData;
  onRegenerate: () => void;
}

const PoemCard: React.FC<PoemCardProps> = ({ data, onRegenerate }) => (
    <div className="w-full max-w-lg bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl shadow-purple-500/10 p-8 flex flex-col items-center text-center transition-all duration-500">
        <h2 className="text-3xl font-bold text-cyan-300 tracking-wider">{data.cityName}</h2>
        <div className="w-24 h-px bg-cyan-300/50 my-4"></div>
        <div className="font-lora text-lg md:text-xl text-gray-200 leading-relaxed my-4">
            {data.poem.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
            ))}
        </div>
        <button
            onClick={onRegenerate}
            className="mt-6 flex items-center gap-2 px-6 py-2 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30 hover:bg-cyan-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
            <WandIcon className="h-5 w-5" />
            Another Verse
        </button>
    </div>
);

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


// --- Main App Component ---

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [poemData, setPoemData] = useState<PoemData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePoemGeneration = useCallback(async () => {
    setStatus('locating');
    setError(null);
    
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

  const renderContent = () => {
    switch (status) {
      case 'locating':
        return <LoadingIndicator text="Finding your place in the cosmos..." />;
      case 'generating':
        return <LoadingIndicator text="Translating the skyline into verse..." />;
      case 'success':
        return poemData ? <PoemCard data={poemData} onRegenerate={handlePoemGeneration} /> : null;
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
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-3xl transition-opacity duration-700">
        {renderContent()}
      </div>
    </main>
  );
}

export default App;
