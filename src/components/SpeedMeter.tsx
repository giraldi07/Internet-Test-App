import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { animate } from 'framer-motion';

interface SpeedMeterProps {
  value: number;
  type: string;
  icon: typeof LucideIcon;
  testing: boolean;
  testPhase: string | null;
  darkMode: boolean;
  progress?: number; // Tambahan prop untuk progress test
}

export const SpeedMeter = ({ 
  value, 
  type, 
  icon: Icon, 
  testing, 
  testPhase, 
  darkMode,
  progress = 0 
}: SpeedMeterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();
  const progressMotion = useMotionValue(0);
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

  // Animasi nilai display
  useEffect(() => {
    const animationControls = animate(displayValue, value, {
      duration: 1,
      ease: 'easeOut',
      onUpdate(value) {
        setDisplayValue(parseFloat(value.toFixed(2)));
      },
    });
    
    return () => animationControls.stop();
  }, [value, displayValue]);

  // Animasi jarum dengan progress test
  useEffect(() => {
    if (testing && isActive) {
      // Animasi real-time saat test berjalan
      const updateNeedle = () => {
        const currentProgress = progress / 100;
        const currentValue = value * currentProgress;
        const currentPercentage = Math.min((currentValue / maxValue) * 180, 180);
        
        controls.start({
          rotate: currentPercentage - 90,
          transition: { 
            type: 'spring',
            damping: 10,
            stiffness: 100,
            mass: 0.5
          }
        });
      };

      updateNeedle();
    } else {
      // Animasi normal ketika test selesai
      controls.start({
        rotate: percentage - 90,
        transition: { 
          type: 'spring',
          damping: 15,
          stiffness: 60,
          mass: 0.7
        }
      });
    }
  }, [percentage, controls, testing, isActive, progress, value, maxValue]);

  // Animasi progress bar
  useEffect(() => {
    if (isActive) {
      progressMotion.set(progress);
    }
  }, [progress, isActive, progressMotion]);

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
      {/* Active test overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        isActive ? 'from-blue-50 to-indigo-50' : 'from-transparent to-transparent'
      } transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

      {/* Progress bar */}
      {isActive && (
        <motion.div 
          className="absolute top-0 left-0 h-1 bg-blue-500"
          style={{ width: progressMotion }}
          transition={{ duration: 0.1 }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Icon className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {type}
            </span>
          </div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {displayValue.toFixed(type === 'Ping' || type === 'Jitter' ? 0 : 1)}
            <span className="text-sm ml-1 opacity-70">
              {type === 'Ping' || type === 'Jitter' ? 'ms' : 'Mbps'}
            </span>
          </div>
        </div>

        <div className="relative h-[160px]">
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
              strokeDashoffset={251.2 - (percentage / 180) * 125.6}
              className="transition-all duration-300 ease-out"
              animate={controls}
            />

            {/* Tick marks */}
            {Array.from({ length: 19 }).map((_, i) => {
              const angle = (i * 10 - 90) * (Math.PI / 180);
              const x1 = 100 + 70 * Math.cos(angle);
              const y1 = 100 + 70 * Math.sin(angle);
              const x2 = 100 + 80 * Math.cos(angle);
              const y2 = 100 + 80 * Math.sin(angle);
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={darkMode ? '#4B5563' : '#D1D5DB'}
                  strokeWidth={i % 3 === 0 ? "2" : "1"}
                  className="transition-colors duration-300"
                />
              );
            })}

            {/* Needle - lebih responsif */}
            <motion.line
              x1="100"
              y1="100"
              x2="180"
              y2="100"
              stroke={darkMode ? '#E5E7EB' : '#1F2937'}
              strokeWidth="2"
              strokeLinecap="round"
              animate={controls}
              style={{ 
                transformOrigin: '100px 100px',
                transformBox: 'fill-box'
              }}
            />

            {/* Center dot */}
            <circle
              cx="100"
              cy="100"
              r="4"
              fill={darkMode ? '#E5E7EB' : '#1F2937'}
              className="transition-colors duration-300"
            />
          </svg>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center mt-2">
          <div className={`h-2 w-2 rounded-full ${
            value > maxValue * 0.8 ? 'bg-red-500' :
            value > maxValue * 0.5 ? 'bg-yellow-500' : 'bg-green-500'
          } mr-2`} />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {value > maxValue * 0.8 ? 'Critical' :
             value > maxValue * 0.5 ? 'Warning' : 'Good'}
          </span>
        </div>
      </div>

      {/* Active test indicator */}
      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [1, 1.02, 1],
            transition: { 
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut'
            } 
          }}
        />
      )}
    </motion.div>
  );
};