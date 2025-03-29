import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Signal, RefreshCw, Sun, Moon, Zap } from 'lucide-react';
import { SpeedMeter } from './components/SpeedMeter';
import { GameCompatibility } from './components/GameCompatibility';
import { TestHistory } from './components/TestHistory';
import { NetworkDetails } from './components/NetworkDetails';
import { runSpeedTest } from './utils/speedTest';
import { fetchIPInfo, getConnectionType } from './utils/networkInfo';
import type { SpeedTestResults, IpInfo, TestHistoryItem } from './types';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testPhase, setTestPhase] = useState<'ping' | 'download' | 'upload' | null>(null);
  const [results, setResults] = useState<SpeedTestResults>({ download: 0, upload: 0, ping: 0, jitter: 0 });
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>(() => {
    const saved = localStorage.getItem('speedTestHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showGameCompat, setShowGameCompat] = useState(false);
  const [ipInfo, setIpInfo] = useState<IpInfo>({
    ip: '',
    isp: '',
    location: '',
    city: '',
    region: '',
    country: '',
    timezone: ''
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', JSON.stringify(!darkMode));
  };

  useEffect(() => {
    fetchIPInfo().then(setIpInfo);
    const savedHistory = localStorage.getItem('speedTestHistory');
    if (savedHistory) {
      setTestHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSpeedTest = () => {
    runSpeedTest(
      setTesting,
      setProgress,
      setResults,
      setTestPhase,
      testHistory,
      setTestHistory
    );
  };

  const connectionType = getConnectionType();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-100 to-white text-gray-900'}`}>
      <Helmet>
        <title>Internet Speed Test - Check Your Connection Speed</title>
        <meta name="description" content="Test your internet connection speed with our fast and accurate speed test tool. Measure download speed, upload speed, ping, and more." />
        <meta name="keywords" content="internet speed test, network speed, bandwidth test, connection speed, ping test, latency test" />
        <meta property="og:title" content="Internet Speed Test" />
        <meta property="og:description" content="Check your internet connection speed with our comprehensive testing tool." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Internet Speed Test" />
        <meta name="twitter:description" content="Check your internet connection speed with our comprehensive testing tool." />
      </Helmet>

      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 p-2 rounded-full ${
          darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-900'
        }`}
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Signal className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold">Internet Speed Test</h1>
            </div>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Test your connection speed with our fast and accurate tool
            </p>
          </div>

          <div className={`rounded-2xl p-8 mb-8 shadow-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

            {testing && (
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                  <div className={`flex-1 h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-center text-sm opacity-80">
                  {testPhase && `Testing ${testPhase}...`}
                </div>
              </div>
            )}

            <button
              onClick={handleSpeedTest}
              disabled={testing}
              className={`
                w-full px-8 py-4 rounded-full text-white font-medium
                flex items-center justify-center gap-2
                ${testing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'}
                transition-colors
              `}
            >
              {testing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Start Speed Test
                </>
              )}
            </button>
          </div>

          <GameCompatibility
            results={results}
            showGameCompat={showGameCompat}
            setShowGameCompat={setShowGameCompat}
            darkMode={darkMode}
          />

          <TestHistory
            testHistory={testHistory}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            darkMode={darkMode}
          />

          <NetworkDetails
            ipInfo={ipInfo}
            connectionType={connectionType}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
}

export default App;