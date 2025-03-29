import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown } from 'lucide-react';
import { TestHistoryItem } from '../types';

interface TestHistoryProps {
  testHistory: TestHistoryItem[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  darkMode: boolean;
}

export const TestHistory = ({ testHistory, showHistory, setShowHistory, darkMode }: TestHistoryProps) => (
  <motion.div
    initial={false}
    animate={{ height: showHistory ? 'auto' : '48px' }}
    className={`rounded-xl shadow-xl overflow-hidden mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
  >
    <button
      onClick={() => setShowHistory(!showHistory)}
      className={`w-full p-4 flex items-center justify-between hover:bg-opacity-50 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-900'}`}
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
          className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          {testHistory.length > 0 ? (
            <div className="space-y-4">
              {testHistory.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{test.date}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Download</div>
                      <div className="font-bold">{test.results.download.toFixed(2)} Mbps</div>
                    </div>
                    <div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upload</div>
                      <div className="font-bold">{test.results.upload.toFixed(2)} Mbps</div>
                    </div>
                    <div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ping</div>
                      <div className="font-bold">{test.results.ping.toFixed(0)} ms</div>
                    </div>
                    <div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jitter</div>
                      <div className="font-bold">{test.results.jitter.toFixed(1)} ms</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No test history available</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);