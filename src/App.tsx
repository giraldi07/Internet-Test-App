import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Signal, RefreshCw, Sun, Moon, Zap, Github, Info } from 'lucide-react';
import { SpeedMeter } from './components/SpeedMeter';
import { GameCompatibility } from './components/GameCompatibility';
import { TestHistory } from './components/TestHistory';
import { NetworkDetails } from './components/NetworkDetails';
import { runSpeedTest } from './utils/speedTest';
import { fetchIPInfo, getConnectionType } from './utils/networkInfo';
import type { SpeedTestResults, IpInfo, TestHistoryItem } from './types';

function App() {
  // State management with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testPhase, setTestPhase] = useState<'ping' | 'download' | 'upload' | null>(null);
  const [results, setResults] = useState<SpeedTestResults>({ 
    download: 0, 
    upload: 0, 
    ping: 0, 
    jitter: 0 
  });
  
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('speedTestHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [showHistory, setShowHistory] = useState(false);
  const [showGameCompat, setShowGameCompat] = useState(false);
  const [ipInfo, setIpInfo] = useState<IpInfo>({
    ip: 'Mengambil data...',
    isp: 'Mengambil data...',
    location: 'Mengambil data...',
    city: 'Mengambil data...',
    region: 'Mengambil data...',
    country: 'Mengambil data...',
    timezone: 'Mengambil data...'
  });

  // Toggle dark mode with system preference fallback
  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  }, [darkMode]);

  // Initialize dark mode and fetch IP info
  useEffect(() => {
    // Apply dark mode class on initial load
    document.documentElement.classList.toggle('dark', darkMode);
    
    // Fetch IP info with error handling
    const fetchNetworkInfo = async () => {
      try {
        const info = await fetchIPInfo();
        setIpInfo(info);
      } catch (error) {
        console.error('Failed to fetch IP info:', error);
        setIpInfo(prev => ({
          ...prev,
          ip: 'Gagal mengambil data',
          isp: 'Gagal mengambil data',
          location: 'Gagal mengambil data'
        }));
      }
    };
    
    fetchNetworkInfo();
  }, [darkMode]);

  // Handle speed test with cleanup
  const handleSpeedTest = useCallback(async () => {
    if (testing) return;
    
    try {
      await runSpeedTest(
        setTesting,
        setProgress,
        setResults,
        setTestPhase,
        testHistory,
        setTestHistory
      );
    } catch (error) {
      console.error('Speed test error:', error);
    } finally {
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [testing, testHistory]);

  // Get connection type with fallback
  const connectionType = getConnectionType();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-50 to-white text-gray-900'
    }`}>
      <Helmet>
        <title>Internet Speed Test - Pengukur Kecepatan Jaringan</title>
        <meta name="description" content="Ukur kecepatan internet Anda dengan akurat. Tes download, upload, ping, dan jitter secara gratis." />
        <meta name="keywords" content="tes kecepatan internet, speed test, ukur bandwidth, ping test, jaringan internet" />
        <meta property="og:title" content="Internet Speed Test" />
        <meta property="og:description" content="Alat pengukur kecepatan internet yang akurat dan mudah digunakan" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Header */}
      <header className={`sticky top-0 z-10 py-4 shadow-md transition-colors duration-300 ${
        darkMode ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Signal className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                SpeedTest ID
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <a 
                href="https://github.com/giraldi07/speed-test-app" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-all ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Pengukur Kecepatan Internet</h2>
              <p className={`text-lg mb-4 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Ukur kecepatan download, upload, ping, dan jitter jaringan Anda
              </p>
            </div>

            {/* Speed Test Container */}
            <div className={`rounded-2xl p-6 mb-8 shadow-xl border transition-colors duration-300 ${
              darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              {/* Speed Meters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SpeedMeter
                  value={results.download}
                  type="Download"
                  icon={Signal}
                  testing={testing}
                  testPhase={testPhase}
                  darkMode={darkMode}
                />
                <SpeedMeter
                  value={results.upload}
                  type="Upload"
                  icon={Signal}
                  testing={testing}
                  testPhase={testPhase}
                  darkMode={darkMode}
                />
                <SpeedMeter
                  value={results.ping}
                  type="Ping"
                  icon={Signal}
                  testing={testing}
                  testPhase={testPhase}
                  darkMode={darkMode}
                />
                <SpeedMeter
                  value={results.jitter}
                  type="Jitter"
                  icon={Signal}
                  testing={testing}
                  testPhase={testPhase}
                  darkMode={darkMode}
                />
              </div>

              {/* Progress Bar */}
              {testing && (
                <div className="w-full max-w-md mx-auto mb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`text-sm font-medium min-w-[40px] ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {progress.toFixed(0)}%
                    </span>
                    <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <motion.div
                        className={`h-full rounded-full ${
                          testPhase === 'ping' ? 'bg-blue-500' :
                          testPhase === 'download' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  <div className={`text-center text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {testPhase === 'ping' && 'Mengukur ping dan jitter...'}
                    {testPhase === 'download' && 'Mengukur kecepatan download...'}
                    {testPhase === 'upload' && 'Mengukur kecepatan upload...'}
                  </div>
                </div>
              )}

              {/* Test Button */}
              <motion.button
                onClick={handleSpeedTest}
                disabled={testing}
                whileTap={!testing ? { scale: 0.98 } : {}}
                className={`
                  w-full px-8 py-4 rounded-full font-medium
                  flex items-center justify-center gap-3
                  ${testing
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'}
                  transition-all duration-300 shadow-lg
                `}
              >
                {testing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.div>
                    Sedang Menguji...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Mulai Tes Kecepatan
                  </>
                )}
              </motion.button>
            </div>

            {/* Additional Components */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <GameCompatibility
                  results={results}
                  showGameCompat={showGameCompat}
                  setShowGameCompat={setShowGameCompat}
                  darkMode={darkMode}
                />
              </div>
              <div>
                <TestHistory
                  testHistory={testHistory}
                  showHistory={showHistory}
                  setShowHistory={setShowHistory}
                  darkMode={darkMode}
                />
              </div>
            </div>

            <NetworkDetails
              ipInfo={ipInfo}
              connectionType={connectionType}
              darkMode={darkMode}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-6 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800/90 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-200'
      } border-t`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center gap-3 mb-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <Info className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <p className="text-sm">
                  Hasil tes dapat bervariasi tergantung pada kondisi jaringan dan beban server.
                </p>
              </div>
              <p className="text-xs opacity-80">
                Untuk hasil terbaik, tutup aplikasi lain yang menggunakan bandwidth selama pengujian.
              </p>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} SpeedTest ID - Dibuat oleh Giraldi Prama Yudistira
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;