import { motion, useAnimation, useMotionValue, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { AnimationPlaybackControls } from 'framer-motion';

interface SpeedMeterProps {
  value: number;
  type: 'Download' | 'Upload' | 'Ping' | 'Jitter';
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
  const displayValue = useMotionValue(0);
  const controls = useAnimation();
  const prevValue = useRef(0);
  const isActive = testing && testPhase?.toLowerCase() === type.toLowerCase();
  
  // Konfigurasi berdasarkan tipe
  const config = {
    maxValue: type === 'Ping' ? 200 : 
              type === 'Jitter' ? 100 : 
              type === 'Download' ? 500 : 200,
    unit: type === 'Ping' || type === 'Jitter' ? 'ms' : 'Mbps',
    decimals: type === 'Ping' || type === 'Jitter' ? 0 : 1
  };

  // Warna berdasarkan nilai
  const getColor = () => {
    const ratio = value / config.maxValue;
    if (type === 'Ping' || type === 'Jitter') {
      if (ratio < 0.25) return '#10B981'; // Green (good)
      if (ratio < 0.5) return '#F59E0B'; // Yellow (average)
      return '#EF4444'; // Red (poor)
    } else {
      if (ratio > 0.75) return '#10B981'; // Green (fast)
      if (ratio > 0.25) return '#F59E0B'; // Yellow (moderate)
      return '#EF4444'; // Red (slow)
    }
  };

  // Hitung posisi jarum
  const percentage = Math.min(Math.max((value / config.maxValue) * 180, 0), 180);
  const needleRotation = percentage - 90;

  // Animasi nilai dan jarum
  useEffect(() => {
    let animationStop: AnimationPlaybackControls | undefined;

    if (!testing) {
      // Animasi halus saat tidak testing
      animationStop = animate(displayValue, value, {
        duration: 1.5,
        ease: [0.4, 0, 0.2, 1],
        onUpdate: (latest) => {
          displayValue.set(parseFloat(latest.toFixed(config.decimals)));
        }
      });

      controls.start({
        rotate: needleRotation,
        transition: {
          type: 'spring',
          damping: 15,
          stiffness: 40,
          mass: 0.8
        }
      });
    } else if (isActive) {
      // Animasi langsung saat aktif testing
      displayValue.set(parseFloat(value.toFixed(config.decimals)));
      controls.start({
        rotate: needleRotation,
        transition: {
          type: 'spring',
          damping: 8,
          stiffness: 30,
          mass: 0.5
        }
      });
    } else {
      // Reset saat test dimulai
      displayValue.set(0);
      controls.start({
        rotate: -90,
        transition: { duration: 0.3 }
      });
    }

    prevValue.current = value;
    return () => {
      if (animationStop) {
        animationStop.stop();
      }
    };
  }, [value, testing, isActive, percentage, config.decimals, controls, displayValue, needleRotation]);

  return (
    <motion.div
      className={`relative p-6 rounded-2xl overflow-hidden transition-all ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border shadow-lg h-full flex flex-col`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: testing ? 1 : 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Active test overlay */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            } transition-colors duration-300`}>
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-blue-400' : 
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } transition-colors duration-300`} />
            </div>
            <span className={`text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } transition-colors duration-300`}>
              {type}
            </span>
          </div>
          
          {/* Nilai */}
          <motion.div 
            className={`text-2xl font-bold ${
              isActive ? 'text-blue-500' : 
              darkMode ? 'text-white' : 'text-gray-900'
            } transition-colors duration-300`}
          >
            {displayValue.get().toFixed(config.decimals)}
            <span className="text-sm ml-1 opacity-70">
              {config.unit}
            </span>
          </motion.div>
        </div>

        {/* Speed meter */}
        <div className="relative flex-1 min-h-[160px]">
          <svg 
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 200 200"
          >
            {/* Background track */}
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
            />
            
            {/* Active track */}
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
                  duration: isActive ? 0.5 : 1,
                  ease: "easeOut"
                }
              }}
            />

            {/* Tick marks */}
            {Array.from({ length: 19 }).map((_, i) => {
              const angle = (i * 10 - 90) * (Math.PI / 180);
              const isMajor = i % 3 === 0;
              const length = isMajor ? 15 : 10;
              const x1 = 100 + 70 * Math.cos(angle);
              const y1 = 100 + 70 * Math.sin(angle);
              const x2 = 100 + (70 + length) * Math.cos(angle);
              const y2 = 100 + (70 + length) * Math.sin(angle);
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={darkMode ? '#4B5563' : '#D1D5DB'}
                  strokeWidth={isMajor ? 2 : 1}
                />
              );
            })}

            {/* Needle */}
            <motion.g
              animate={controls}
              style={{ originX: "100px", originY: "100px" }}
            >
              <line
                x1="100"
                y1="100"
                x2="180"
                y2="100"
                stroke={darkMode ? '#E5E7EB' : '#1F2937'}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy="100"
                r="4"
                fill={darkMode ? '#1F2937' : '#E5E7EB'}
              />
              <circle
                cx="180"
                cy="100"
                r="3"
                fill={darkMode ? '#E5E7EB' : '#1F2937'}
              />
            </motion.g>
          </svg>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center mt-2">
          <motion.div 
            className={`h-2 w-2 rounded-full mr-2 ${
              value > config.maxValue * 0.8 ? 'bg-red-500' :
              value > config.maxValue * 0.5 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            animate={{ 
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [0.8, 1, 0.8] : 1
            }}
            transition={{ 
              duration: 1.5,
              repeat: isActive ? Infinity : 0,
              repeatType: "loop"
            }}
          />
          <span className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {value > config.maxValue * 0.8 ? 'Kurang' :
             value > config.maxValue * 0.5 ? 'Sedang' : 'Baik'}
          </span>
        </div>
      </div>

      {/* Active test border animation */}
      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-400 rounded-2xl pointer-events-none"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: [0, 0.3, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.div>
  );
};