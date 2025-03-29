import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, ChevronDown } from 'lucide-react';
import { gameRequirements } from '../data/gameRequirements';
import { SpeedTestResults } from '../types';

interface GameCompatibilityProps {
  results: SpeedTestResults;
  showGameCompat: boolean;
  setShowGameCompat: (show: boolean) => void;
  darkMode: boolean;
}

export const GameCompatibility = ({ results, showGameCompat, setShowGameCompat, darkMode }: GameCompatibilityProps) => {
  const checkGameCompatibility = (game: typeof gameRequirements[0]) => {
    const { download, upload, ping } = results;
    return (
      download >= game.requirements.download &&
      upload >= game.requirements.upload &&
      ping <= game.requirements.ping
    );
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: showGameCompat ? 'auto' : '48px' }}
      className={`rounded-xl shadow-xl overflow-hidden mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
    >
      <button
        onClick={() => setShowGameCompat(!showGameCompat)}
        className={`w-full p-4 flex items-center justify-between hover:bg-opacity-50 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-900'}`}
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
            className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="space-y-4">
              {gameRequirements.map((game, index) => {
                const isCompatible = checkGameCompatibility(game);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      isCompatible 
                        ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                        : darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                    } border`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{game.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          isCompatible
                            ? darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'
                            : darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isCompatible ? 'Compatible' : 'Not Compatible'}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      Requirements: ↓{game.requirements.download}Mbps ↑{game.requirements.upload}Mbps 
                      Ping: {game.requirements.ping}ms
                    </p>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
  );
};