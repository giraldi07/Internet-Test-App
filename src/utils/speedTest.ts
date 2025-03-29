import toast from 'react-hot-toast';
import { SpeedTestResults } from '../types';

export const measurePing = async (setProgress: (progress: number) => void): Promise<{ ping: number; jitter: number }> => {
  const samples = 10;
  let totalPing = 0;
  let pings: number[] = [];
  
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    try {
      await fetch('https://httpbin.org/get?t=' + new Date().getTime(), {
        cache: 'no-store'
      });
      const end = performance.now();
      const ping = end - start;
      totalPing += ping;
      pings.push(ping);
      setProgress((i / samples) * 30);
    } catch (error) {
      console.error('Ping test error:', error);
    }
  }
  
  const avgPing = totalPing / samples;
  const jitter = pings.reduce((sum, ping) => sum + Math.abs(ping - avgPing), 0) / samples;
  
  return { ping: avgPing, jitter };
};

export const measureDownloadSpeed = async (setProgress: (progress: number) => void): Promise<number> => {
  const testFiles = [
    'https://cdn.jsdelivr.net/gh/mathiasbynens/small/sample.jpg',
    'https://cdn.jsdelivr.net/gh/mathiasbynens/small/sample.png',
    'https://cdn.jsdelivr.net/gh/mathiasbynens/small/sample.webp'
  ];
  
  let totalSpeed = 0;
  let completedTests = 0;
  
  for (const testFile of testFiles) {
    try {
      const startTime = performance.now();
      const response = await fetch(testFile + '?t=' + new Date().getTime(), {
        cache: 'no-store'
      });
      const blob = await response.blob();
      const endTime = performance.now();
      
      const durationInSeconds = (endTime - startTime) / 1000;
      const bitsLoaded = blob.size * 8;
      const speedMbps = (bitsLoaded / (1024 * 1024)) / durationInSeconds;
      
      totalSpeed += speedMbps;
      completedTests++;
      
      setProgress(30 + (completedTests / testFiles.length) * 30);
    } catch (error) {
      console.error('Download test error:', error);
    }
  }
  
  return completedTests > 0 ? totalSpeed / completedTests : 0;
};

export const measureUploadSpeed = async (setProgress: (progress: number) => void): Promise<number> => {
  const sizes = [1024 * 256, 1024 * 512, 1024 * 1024];
  let totalSpeed = 0;
  let completedTests = 0;
  
  for (const size of sizes) {
    try {
      const testData = new Blob([new ArrayBuffer(size)]);
      const startTime = performance.now();
      
      await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: testData,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });
      
      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedMbps = (size * 8) / (1024 * 1024) / durationInSeconds;
      
      totalSpeed += speedMbps;
      completedTests++;
      
      setProgress(60 + (completedTests / sizes.length) * 30);
    } catch (error) {
      console.error('Upload test error:', error);
    }
  }
  
  return completedTests > 0 ? totalSpeed / completedTests : 0;
};

export const runSpeedTest = async (
  setTesting: (testing: boolean) => void,
  setProgress: (progress: number) => void,
  setResults: (results: SpeedTestResults | ((prev: SpeedTestResults) => SpeedTestResults)) => void,
  setTestPhase: (phase: 'ping' | 'download' | 'upload' | null) => void,
  testHistory: any[],
  setTestHistory: (history: any[]) => void,
) => {
  setTesting(true);
  setProgress(0);
  setResults({ download: 0, upload: 0, ping: 0, jitter: 0 });

  const toastId = toast.loading('Starting speed test...');

  try {
    setTestPhase('ping');
    toast.loading('Measuring ping...', { id: toastId });
    const { ping, jitter } = await measurePing(setProgress);
    setResults(prev => ({ ...prev, ping, jitter }));

    setTestPhase('download');
    toast.loading('Testing download speed...', { id: toastId });
    const downloadSpeed = await measureDownloadSpeed(setProgress);
    setResults(prev => ({ ...prev, download: downloadSpeed }));

    setTestPhase('upload');
    toast.loading('Testing upload speed...', { id: toastId });
    const uploadSpeed = await measureUploadSpeed(setProgress);
    setResults(prev => ({ ...prev, upload: uploadSpeed }));

    const newHistory = [{
      date: new Date().toLocaleString(),
      results: { download: downloadSpeed, upload: uploadSpeed, ping, jitter }
    }, ...testHistory.slice(0, 9)];
    setTestHistory(newHistory);
    localStorage.setItem('speedTestHistory', JSON.stringify(newHistory));

    toast.success('Speed test completed!', { id: toastId });
  } catch (error) {
    console.error('Speed test error:', error);
    toast.error('Error during speed test', { id: toastId });
  } finally {
    setTestPhase(null);
    setTesting(false);
  }
};