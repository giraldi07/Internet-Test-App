import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, Trash2 } from 'lucide-react';
import { TestHistoryItem } from '../types';

interface TestHistoryProps {
  testHistory: TestHistoryItem[];
  setTestHistory: (history: TestHistoryItem[]) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  darkMode: boolean;
}

export const TestHistory = ({ 
  testHistory, 
  setTestHistory, 
  showHistory, 
  setShowHistory, 
  darkMode 
}: TestHistoryProps) => {
  const handleDelete = (index: number) => {
    const newHistory = testHistory.filter((_, i) => i !== index);
    setTestHistory(newHistory);
  };

  const clearHistory = () => {
    setTestHistory([]);
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: showHistory ? 'auto' : '48px' }}
      className={`rounded-xl shadow-xl overflow-hidden mb-8 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}
    >
      <button
        onClick={() => setShowHistory(!showHistory)}
        className={`w-full p-4 flex items-center justify-between hover:bg-opacity-50 ${
          darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          <span className="font-semibold">Riwayat Tes</span>
          {testHistory.length > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {testHistory.length}
            </span>
          )}
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
            className={`p-4 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            {testHistory.length > 0 ? (
              <div className="space-y-4">
                {testHistory.map((test, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl relative ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{test.date}</span>
                      <button 
                        onClick={() => handleDelete(index)} 
                        className={`p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-200 text-red-500'
                        }`}
                        aria-label="Delete test"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Download</div>
                        <div className="font-bold">{test.results.download.toFixed(2)} Mbps</div>
                      </div>
                      <div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Upload</div>
                        <div className="font-bold">{test.results.upload.toFixed(2)} Mbps</div>
                      </div>
                      <div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Ping</div>
                        <div className="font-bold">{test.results.ping.toFixed(0)} ms</div>
                      </div>
                      <div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Jitter</div>
                        <div className="font-bold">{test.results.jitter.toFixed(1)} ms</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <motion.button
                  onClick={clearHistory}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-center font-semibold mt-4 p-2 rounded-lg ${
                    darkMode 
                      ? 'text-red-400 hover:bg-gray-700' 
                      : 'text-red-500 hover:bg-gray-200'
                  }`}
                >
                  Hapus Semua Riwayat
                </motion.button>
              </div>
            ) : (
              <p className={`text-center ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Tidak ada riwayat tes</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};