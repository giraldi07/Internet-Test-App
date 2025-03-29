import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface SpeedMeterProps {
  value: number;
  type: string;
  icon: LucideIcon;
  testing: boolean;
  testPhase: string | null;
  darkMode: boolean;
}

export const SpeedMeter = ({ value, type, icon: Icon, testing, testPhase, darkMode }: SpeedMeterProps) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{type}</span>
    </div>
    <div className="text-2xl font-bold">{value.toFixed(2)} {type === 'Ping' || type === 'Jitter' ? 'ms' : 'Mbps'}</div>
    {testing && testPhase?.toLowerCase() === type.toLowerCase() && (
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 2 }}
        className="h-1 bg-blue-400 mt-2 rounded-full"
      />
    )}
  </motion.div>
);