import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SpeedMeterProps {
  value: number;
  type: string;
  icon: LucideIcon;
  testing: boolean;
  testPhase: string | null;
  darkMode: boolean;
}

export const SpeedMeter = ({ 
  value, 
  type, 
  icon: Icon, 
  testing, 
  testPhase, 
  darkMode 
}: SpeedMeterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const controls = useAnimation();
  const isActive = testing && testPhase?.toLowerCase() === type.toLowerCase();
  
  const maxValue = type === 'Ping' || type === 'Jitter' ? 200 : 1000;
  const percentage = Math.min((value / maxValue) * 180, 180);
  
  const getColor = () => {
    if (type === 'Ping' || type === 'Jitter') {
      if (value < 50) return '#10B981';
      if (value < 100) return '#F59E0B';
      return '#EF4444';
    } else {
      if (value > 500) return '#10B981';
      if (value > 100) return '#F59E0B';
      return '#EF4444';
    }
  };

  // Reset to zero when testing starts
  useEffect(() => {
    if (testing && !isActive) {
      setDisplayValue(0);
      controls.start({
        rotate: -90,
        transition: { duration: 0.3 }
      });
    }
  }, [testing, isActive, controls]);

  // Initialize needle at zero position
  useEffect(() => {
    if (!isInitialized) {
      controls.start({
        rotate: -90,
        transition: { duration: 0 }
      }).then(() => setIsInitialized(true));
    }
  }, [controls, isInitialized]);

  // Animate the displayed value with easing
  useEffect(() => {
    if (!isInitialized) return;

    const animationControls = animate(displayValue, value, {
      duration: isActive ? 0.3 : 0.8,
      ease: isActive ? "linear" : [0.4, 0, 0.2, 1],
      onUpdate(value) {
        setDisplayValue(parseFloat(value.toFixed(2)));
      },
    });
    
    return () => animationControls.stop();
  }, [value, displayValue, isInitialized, isActive]);

  // Animate the needle with spring physics
  useEffect(() => {
    if (!isInitialized) return;

    controls.start({
      rotate: percentage - 90,
      transition: { 
        type: 'spring',
        damping: isActive ? 8 : 15,
        stiffness: isActive ? 30 : 40,
        mass: isActive ? 0.5 : 0.8,
        restDelta: 0.001
      }
    });
  }, [percentage, controls, isInitialized, isActive]);

  return (
    <motion.div
      className={`relative p-6 rounded-2xl overflow-hidden transition-all ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
      } shadow-lg h-full flex flex-col`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${
        isActive ? 'from-blue-50/10 to-indigo-50/10' : 'from-transparent to-transparent'
      } transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-blue-400' : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
            </div>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {type}
            </span>
          </div>
          <motion.div 
            className={`text-2xl font-bold ${
              isActive 
                ? 'text-blue-500' 
                : darkMode ? 'text-white' : 'text-gray-900'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {displayValue.toFixed(type === 'Ping' || type === 'Jitter' ? 0 : 1)}
            <span className="text-sm ml-1 opacity-70">
              {type === 'Ping' || type === 'Jitter' ? 'ms' : 'Mbps'}
            </span>
          </motion.div>
        </div>

        <div className="relative h-[160px]">
          <svg 
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 200 200"
          >
            {/* Background track with gradient */}
            <defs>
              <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={darkMode ? '#374151' : '#E5E7EB'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset="125.6"
              className="transition-colors duration-300"
            />
            
            {/* Active track with dynamic color */}
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={getColor()}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ 
                strokeDashoffset: 251.2 - (percentage / 180) * 125.6,
                transition: {
                  duration: isActive ? 0.3 : 0.8,
                  ease: isActive ? "linear" : "easeOut"
                }
              }}
            />

            {/* Tick marks with different sizes */}
            {Array.from({ length: 19 }).map((_, i) => {
              const angle = (i * 10 - 90) * (Math.PI / 180);
              const x1 = 100 + 70 * Math.cos(angle);
              const y1 = 100 + 70 * Math.sin(angle);
              const x2 = 100 + (i % 3 === 0 ? 85 : 80) * Math.cos(angle);
              const y2 = 100 + (i % 3 === 0 ? 85 : 80) * Math.sin(angle);
              
              return (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={darkMode ? '#4B5563' : '#D1D5DB'}
                  strokeWidth={i % 3 === 0 ? "2" : "1"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                />
              );
            })}

            {/* Animated needle */}
            <motion.g
              animate={controls}
              style={{ originX: "100px", originY: "100px" }}
            >
              <motion.line
                x1="100"
                y1="100"
                x2="180"
                y2="100"
                stroke={darkMode ? '#E5E7EB' : '#1F2937'}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="180"
                cy="100"
                r="3"
                fill={darkMode ? '#E5E7EB' : '#1F2937'}
              />
            </motion.g>

            {/* Center dot with shadow */}
            <circle
              cx="100"
              cy="100"
              r="6"
              fill={darkMode ? '#1F2937' : '#E5E7EB'}
              className="transition-colors duration-300"
            />
            <circle
              cx="100"
              cy="100"
              r="4"
              fill={darkMode ? '#E5E7EB' : '#1F2937'}
              className="transition-colors duration-300"
            />
          </svg>
        </div>

        {/* Status indicator with animation */}
        <motion.div 
          className="flex items-center justify-center mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className={`h-2 w-2 rounded-full ${
              value > maxValue * 0.8 ? 'bg-red-500' :
              value > maxValue * 0.5 ? 'bg-yellow-500' : 'bg-green-500'
            } mr-2`}
            animate={{ 
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [0.5, 1, 0.5] : 1
            }}
            transition={{ 
              duration: 1,
              repeat: isActive ? Infinity : 0,
              repeatType: "reverse"
            }}
          />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {value > maxValue * 0.8 ? 'Critical' :
             value > maxValue * 0.5 ? 'Warning' : 'Good'}
          </span>
        </motion.div>
      </div>

      {/* Active test indicator with pulse animation */}
      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [1, 1.02, 1],
            transition: { 
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut'
            } 
          }}
        />
      )}
    </motion.div>
  );
};