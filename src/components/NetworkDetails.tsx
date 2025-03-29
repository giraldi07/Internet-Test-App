import { motion } from 'framer-motion';
import { Server, Globe, Wifi, Share2 } from 'lucide-react';
import { IpInfo } from '../types';

interface NetworkDetailsProps {
  ipInfo: IpInfo;
  connectionType: string;
  darkMode: boolean;
}

export const NetworkDetails = ({ ipInfo, connectionType, darkMode }: NetworkDetailsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={`rounded-lg p-4 shadow-md flex items-center gap-3 border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <Server className="w-5 h-5 text-blue-400" />
      <div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Server</p>
        <p className="font-semibold">{ipInfo.location || 'Detecting...'}</p>
      </div>
    </motion.div>
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={`rounded-lg p-4 shadow-md flex items-center gap-3 border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <Globe className="w-5 h-5 text-blue-400" />
      <div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ISP</p>
        <p className="font-semibold">{ipInfo.isp || 'Detecting...'}</p>
      </div>
    </motion.div>
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className={`rounded-lg p-4 shadow-md flex items-center gap-3 border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <Wifi className="w-5 h-5 text-blue-400" />
      <div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Connection</p>
        <p className="font-semibold">{connectionType}</p>
      </div>
    </motion.div>
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className={`rounded-lg p-4 shadow-md flex items-center gap-3 border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <Share2 className="w-5 h-5 text-blue-400" />
      <div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>IP Address</p>
        <p className="font-semibold">{ipInfo.ip || 'Detecting...'}</p>
      </div>
    </motion.div>
  </div>
);