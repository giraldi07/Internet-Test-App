import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  Signal,
  Globe,
  Activity,
  Server,
  Wifi,
  Share2,
  RefreshCw,
  ChevronDown,
  History,
  Gamepad2,
  Github,
} from 'lucide-react';

function App() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState({
    download: 0,
    upload: 0,
    ping: 0,
    jitter: 0,
  });
  const [progress, setProgress] = useState(0);
  const [ipInfo, setIpInfo] = useState({
    ip: '',
    isp: '',
    location: '',
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showGameCompat, setShowGameCompat] = useState(false);
  const [testHistory, setTestHistory] = useState<Array<{
    date: string;
    results: typeof results;
  }>>([]);
  const [testPhase, setTestPhase] = useState<'ping' | 'download' | 'upload' | null>(null);

  const gameRequirements = [
    {
      name: "Online FPS Games",
      requirements: {
        download: 15,
        upload: 5,
        ping: 50,
      },
      examples: ["Valorant", "CS:GO", "Apex Legends"],
      platforms: ["PC", "PlayStation", "Xbox"],
    },
    {
      name: "Battle Royale Games",
      requirements: {
        download: 20,
        upload: 5,
        ping: 60,
      },
      examples: ["Fortnite", "PUBG", "Warzone"],
      platforms: ["PC", "PlayStation", "Xbox", "Mobile"],
    },
    {
      name: "MOBA Games",
      requirements: {
        download: 10,
        upload: 3,
        ping: 100,
      },
      examples: ["Dota 2", "League of Legends", "Mobile Legends"],
      platforms: ["PC", "Mobile"],
    },
    {
      name: "Cloud Gaming",
      requirements: {
        download: 35,
        upload: 10,
        ping: 40,
      },
      examples: ["Xbox Cloud Gaming", "GeForce NOW", "PlayStation Now"],
      platforms: ["PC", "Mobile", "Smart TV"],
    },
  ];

  useEffect(() => {
    fetchIPInfo();
    const savedHistory = localStorage.getItem('speedTestHistory');
    if (savedHistory) {
      setTestHistory(JSON.parse(savedHistory));
    }
  }, []);

  const fetchIPInfo = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      setIpInfo({
        ip: data.ip,
        isp: data.org,
        location: `${data.city}, ${data.country_code}`,
      });
    } catch (error) {
      console.error('Error fetching IP info:', error);
    }
  };

  const measureDownloadSpeed = async () => {
    const fileSize = 5 * 1024 * 1024;
    const testFile = 'https://cdn.jsdelivr.net/gh/mathiasbynens/small/jquery-3.6.0.min.js';
    const startTime = performance.now();
    
    try {
      const response = await fetch(testFile);
      const reader = response.body?.getReader();
      let receivedLength = 0;

      if (!reader) throw new Error('Reader not available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedLength += value.length;
        const currentProgress = (receivedLength / fileSize) * 100;
        setProgress(30 + (currentProgress * 0.3));
      }

      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedMbps = (receivedLength * 8) / (1024 * 1024 * durationInSeconds);
      
      return speedMbps;
    } catch (error) {
      console.error('Download speed test error:', error);
      return 0;
    }
  };

  const measureUploadSpeed = async () => {
    const dataSize = 2 * 1024 * 1024;
    const testData = new Blob([new ArrayBuffer(dataSize)]);
    const startTime = performance.now();

    try {
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: testData,
      });

      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedMbps = (dataSize * 8) / (1024 * 1024 * durationInSeconds);

      return speedMbps;
    } catch (error) {
      console.error('Upload speed test error:', error);
      return 0;
    }
  };

  const measurePing = async () => {
    const pings = [];
    const attempts = 4;

    for (let i = 0; i < attempts; i++) {
      const start = performance.now();
      try {
        await fetch('https://httpbin.org/get', { cache: 'no-store' });
        const end = performance.now();
        pings.push(end - start);
        setProgress((i + 1) * (10 / attempts));
      } catch (error) {
        console.error('Ping measurement error:', error);
      }
    }

    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = pings.reduce((sum, ping) => 
      sum + Math.abs(ping - avgPing), 0) / pings.length;

    return { ping: avgPing, jitter };
  };

  const runSpeedTest = async () => {
    setTesting(true);
    setProgress(0);
    setResults({ download: 0, upload: 0, ping: 0, jitter: 0 });

    try {
      setTestPhase('ping');
      const { ping, jitter } = await measurePing();
      setResults(prev => ({ ...prev, ping, jitter }));

      setTestPhase('download');
      const downloadSpeed = await measureDownloadSpeed();
      setResults(prev => ({ ...prev, download: downloadSpeed }));

      setTestPhase('upload');
      const uploadSpeed = await measureUploadSpeed();
      setResults(prev => ({ ...prev, upload: uploadSpeed }));

      const newHistory = [{
        date: new Date().toLocaleString(),
        results: { download: downloadSpeed, upload: uploadSpeed, ping, jitter }
      }, ...testHistory.slice(0, 9)];
      setTestHistory(newHistory);
      localStorage.setItem('speedTestHistory', JSON.stringify(newHistory));

    } catch (error) {
      console.error('Speed test error:', error);
    } finally {
      setTestPhase(null);
      setTesting(false);
    }
  };

  useEffect(() => {
    runSpeedTest();
  }, []);

  const SpeedMeter = ({ value, type, icon: Icon }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gray-800 rounded-lg p-6 shadow-lg relative overflow-hidden border border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-200">{type}</h3>
      </div>
      <motion.div
        key={value}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold text-blue-400 mb-2"
      >
        {value.toFixed(2)}
        <span className="text-lg ml-1">
          {type === 'Ping' || type === 'Jitter' ? 'ms' : 'Mbps'}
        </span>
      </motion.div>
      {testing && testPhase?.toLowerCase() === type.toLowerCase() && (
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2 }}
          className="absolute bottom-0 left-0 h-1 bg-blue-400"
        />
      )}
    </motion.div>
  );

  const checkGameCompatibility = (game) => {
    const { download, upload, ping } = results;
    const meetsRequirements = 
      download >= game.requirements.download &&
      upload >= game.requirements.upload &&
      ping <= game.requirements.ping;
    
    return meetsRequirements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center items-center gap-2 mb-4">
              <Signal className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-100">Speed Test</h1>
            </div>
            <p className="text-gray-400">
              Test your internet connection speed and quality
            </p>
          </motion.div>

          {/* Main Speed Test Section */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-8 mb-8 border border-gray-700">
            {testing ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="relative h-40 w-40 mx-auto mb-6">
                  <div className="absolute inset-0">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-700 stroke-current"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                      />
                      <motion.circle
                        className="text-blue-400 progress-ring stroke-current"
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        style={{
                          strokeDasharray: '251.2',
                          strokeDashoffset: 251.2 - (progress / 100) * 251.2,
                        }}
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-2xl font-semibold text-gray-200">
                      {Math.round(progress)}%
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      Testing {testPhase}...
                    </div>
                  </div>
                </div>
                <p className="text-gray-400">Testing your connection...</p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SpeedMeter
                    value={results.download}
                    type="Download"
                    icon={Download}
                  />
                  <SpeedMeter
                    value={results.upload}
                    type="Upload"
                    icon={Upload}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SpeedMeter
                    value={results.ping}
                    type="Ping"
                    icon={Activity}
                  />
                  <SpeedMeter
                    value={results.jitter}
                    type="Jitter"
                    icon={Signal}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={runSpeedTest}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Test Again
                </motion.button>
              </div>
            )}
          </div>

          {/* Game Compatibility */}
          <motion.div
            initial={false}
            animate={{ height: showGameCompat ? 'auto' : '48px' }}
            className="bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8 border border-gray-700"
          >
            <button
              onClick={() => setShowGameCompat(!showGameCompat)}
              className="w-full p-4 flex items-center justify-between text-gray-200 hover:bg-gray-700"
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Game Compatibility</span>
              </div>
              <motion.div
                animate={{ rotate: showGameCompat ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>
            <AnimatePresence>
              {showGameCompat && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 border-t border-gray-700"
                >
                  <div className="space-y-4">
                    {gameRequirements.map((game, index) => {
                      const isCompatible = checkGameCompatibility(game);
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            isCompatible ? 'bg-green-900/20' : 'bg-red-900/20'
                          } border ${
                            isCompatible ? 'border-green-700' : 'border-red-700'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-200">{game.name}</h3>
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                isCompatible
                                  ? 'bg-green-900/40 text-green-400'
                                  : 'bg-red-900/40 text-red-400'
                              }`}
                            >
                              {isCompatible ? 'Compatible' : 'Not Compatible'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            Requirements: ↓{game.requirements.download}Mbps ↑{game.requirements.upload}Mbps 
                            Ping: {game.requirements.ping}ms
                          </p>
                          <div className="text-sm text-gray-400">
                            <p>Games: {game.examples.join(', ')}</p>
                            <p>Platforms: {game.platforms.join(', ')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Test History */}
          <motion.div
            initial={false}
            animate={{ height: showHistory ? 'auto' : '48px' }}
            className="bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8 border border-gray-700"
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full p-4 flex items-center justify-between text-gray-200 hover:bg-gray-700"
            >
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Test History</span>
              </div>
              <motion.div
                animate={{ rotate: showHistory ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 border-t border-gray-700"
                >
                  {testHistory.length > 0 ? (
                    <div className="space-y-4">
                      {testHistory.map((test, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-5 gap-4 text-sm border-b border-gray-700 pb-2"
                        >
                          <div className="text-gray-400">{test.date}</div>
                          <div className="text-gray-300">↓ {test.results.download.toFixed(2)} Mbps</div>
                          <div className="text-gray-300">↑ {test.results.upload.toFixed(2)} Mbps</div>
                          <div className="text-gray-300">{test.results.ping.toFixed(2)} ms</div>
                          <div className="text-gray-300">{test.results.jitter.toFixed(2)} ms</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">No test history available</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-4 shadow-md flex items-center gap-3 border border-gray-700"
            >
              <Server className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Server</p>
                <p className="font-semibold text-gray-200">{ipInfo.location || 'Detecting...'}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-4 shadow-md flex items-center gap-3 border border-gray-700"
            >
              <Globe className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">ISP</p>
                <p className="font-semibold text-gray-200">{ipInfo.isp || 'Detecting...'}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-4 shadow-md flex items-center gap-3 border border-gray-700"
            >
              <Wifi className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Connection</p>
                <p className="font-semibold text-gray-200">
                  {navigator.connection?.type || 'Wi-Fi'}
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-lg p-4 shadow-md flex items-center gap-3 border border-gray-700"
            >
              <Share2 className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">IP Address</p>
                <p className="font-semibold text-gray-200">{ipInfo.ip || 'Detecting...'}</p>
              </div>
            </motion.div>
          </div>

          {/* Creator Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-gray-400"
          >
            <p className="text-sm">Created by Giraldi Prama Yudistira</p>
            <a
              href="https://github.com/giraldi07"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-2"
            >
              <Github className="w-4 h-4" />
              github.com/giraldi07
            </a>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .progress-ring {
          transition: stroke-dashoffset 0.1s;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
      `}</style>
    </div>
  );
}

export default App;