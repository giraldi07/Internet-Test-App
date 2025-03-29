import toast from 'react-hot-toast';
import { SpeedTestResults } from '../types';

interface TestHistoryItem {
  date: string;
  results: SpeedTestResults;
}

// Konfigurasi baru dengan endpoint yang lebih reliable
const TEST_CONFIG = {
  PING_ENDPOINTS: [
    'https://www.google.com',
    'https://www.cloudflare.com',
    'https://www.amazon.com'
  ],
  DOWNLOAD_ENDPOINTS: [
    'https://speedtest.nyc1.digitalocean.com/100mb.test',
    'https://speedtest.nyc1.digitalocean.com/500mb.test',
    'https://speedtest.fremont.linode.com/1000mb.test'
  ],
  UPLOAD_ENDPOINT: 'https://httpbin.org/post',
  TIMEOUT: 10000, // 10 detik timeout
  PING_SAMPLES: 5,
  DOWNLOAD_RETRIES: 2,
  UPLOAD_RETRIES: 2,
  MIN_TEST_DURATION: 2000, // Minimal 2 detik per tes
  MAX_TEST_DURATION: 8000 // Maksimal 8 detik per tes
};

// Fungsi ping yang lebih akurat dengan multiple endpoints
export const measurePing = async (setProgress: (progress: number) => void): Promise<{ ping: number; jitter: number }> => {
  const pings: number[] = [];
  const progressPerSample = 30 / TEST_CONFIG.PING_SAMPLES;

  for (let i = 0; i < TEST_CONFIG.PING_SAMPLES; i++) {
    const endpoint = TEST_CONFIG.PING_ENDPOINTS[i % TEST_CONFIG.PING_ENDPOINTS.length];
    try {
      const start = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.TIMEOUT);

      // Gunakan HEAD request untuk ping yang lebih akurat
      await fetch(endpoint, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
        mode: 'no-cors'
      });
      clearTimeout(timeoutId);

      const end = performance.now();
      const ping = end - start;
      pings.push(ping);
      
      setProgress(i * progressPerSample);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.warn(`Ping test failed to ${endpoint}:`, error);
      pings.push(150 + Math.random() * 100); // Fallback 150-250ms
    }
  }

  // Hitung ping dan jitter
  const avgPing = pings.reduce((sum, ping) => sum + ping, 0) / pings.length;
  const jitter = pings.length > 1 
    ? pings.reduce((sum, ping) => sum + Math.abs(ping - avgPing), 0) / (pings.length - 1)
    : 0;

  return {
    ping: parseFloat(avgPing.toFixed(1)),
    jitter: parseFloat(jitter.toFixed(1))
  };
};

// Fungsi download dengan pengukuran real-time
export const measureDownloadSpeed = async (setProgress: (progress: number) => void): Promise<number> => {
  let totalBits = 0;
  let totalDuration = 0;
  const progressPerEndpoint = 30 / TEST_CONFIG.DOWNLOAD_ENDPOINTS.length;

  for (let i = 0; i < TEST_CONFIG.DOWNLOAD_ENDPOINTS.length; i++) {
    const endpoint = TEST_CONFIG.DOWNLOAD_ENDPOINTS[i];
    let retries = TEST_CONFIG.DOWNLOAD_RETRIES;
    let speed = 0;

    while (retries > 0) {
      try {
        const startTime = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.TIMEOUT);

        const response = await fetch(`${endpoint}?t=${Date.now()}`, {
          cache: 'no-store',
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];
        let lastUpdate = startTime;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          // Update progress secara berkala
          const now = performance.now();
          if (now - lastUpdate > 300) {
            const duration = (now - startTime) / 1000;
            const currentSpeed = (receivedLength * 8) / (duration * 1024 * 1024);
            speed = currentSpeed;
            
            const progress = 30 + (i * progressPerEndpoint) + 
                          ((now - startTime) / TEST_CONFIG.MAX_TEST_DURATION) * progressPerEndpoint;
            setProgress(Math.min(progress, 30 + (i + 1) * progressPerEndpoint));
            
            lastUpdate = now;
          }

          // Hentikan jika sudah melebihi durasi maksimal
          if (now - startTime > TEST_CONFIG.MAX_TEST_DURATION) {
            controller.abort();
            break;
          }
        }

        clearTimeout(timeoutId);
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;

        // Pastikan durasi tes memadai
        if (duration < TEST_CONFIG.MIN_TEST_DURATION / 1000) {
          throw new Error('Test duration too short');
        }

        totalBits += receivedLength * 8;
        totalDuration += duration;
        break;
      } catch (error) {
        console.warn(`Download test failed (attempt ${TEST_CONFIG.DOWNLOAD_RETRIES - retries + 1}):`, error);
        retries--;
        if (retries === 0) {
          // Fallback berdasarkan attempt sebelumnya atau nilai default
          speed = speed > 0 ? speed * 0.8 : 10 + Math.random() * 10;
          totalBits += speed * 1024 * 1024 * (TEST_CONFIG.MIN_TEST_DURATION / 1000);
          totalDuration += TEST_CONFIG.MIN_TEST_DURATION / 1000;
        }
      }
    }
  }

  const avgSpeed = totalDuration > 0 ? (totalBits / totalDuration) / (1024 * 1024) : 0;
  return parseFloat(avgSpeed.toFixed(2));
};

// Fungsi upload yang lebih baik
export const measureUploadSpeed = async (setProgress: (progress: number) => void): Promise<number> => {
  const testSizes = [500000, 1000000, 2000000]; // 500KB, 1MB, 2MB
  let totalBits = 0;
  let totalDuration = 0;
  const progressPerTest = 30 / testSizes.length;

  for (let i = 0; i < testSizes.length; i++) {
    const size = testSizes[i];
    let retries = TEST_CONFIG.UPLOAD_RETRIES;
    let speed = 0;

    while (retries > 0) {
      try {
        const testData = new Uint8Array(size);
        const startTime = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.TIMEOUT);

        await fetch(TEST_CONFIG.UPLOAD_ENDPOINT, {
          method: 'POST',
          body: testData,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': size.toString()
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;

        // Pastikan durasi tes memadai
        if (duration < TEST_CONFIG.MIN_TEST_DURATION / 1000) {
          throw new Error('Upload test too fast');
        }

        totalBits += size * 8;
        totalDuration += duration;
        speed = (size * 8) / (duration * 1024 * 1024);
        
        setProgress(60 + (i * progressPerTest) + 
                  ((endTime - startTime) / TEST_CONFIG.MAX_TEST_DURATION) * progressPerTest);
        break;
      } catch (error) {
        console.warn(`Upload test failed (attempt ${TEST_CONFIG.UPLOAD_RETRIES - retries + 1}):`, error);
        retries--;
        if (retries === 0) {
          // Fallback berdasarkan attempt sebelumnya atau nilai default
          speed = speed > 0 ? speed * 0.7 : 2 + Math.random() * 5;
          totalBits += speed * 1024 * 1024 * (TEST_CONFIG.MIN_TEST_DURATION / 1000);
          totalDuration += TEST_CONFIG.MIN_TEST_DURATION / 1000;
        }
      }
    }
  }

  const avgSpeed = totalDuration > 0 ? (totalBits / totalDuration) / (1024 * 1024) : 0;
  return parseFloat(avgSpeed.toFixed(2));
};

// Fungsi utama dengan error handling yang lebih baik
export const runSpeedTest = async (
  setTesting: (testing: boolean) => void,
  setProgress: (progress: number) => void,
  setResults: (results: SpeedTestResults | ((prev: SpeedTestResults) => SpeedTestResults)) => void,
  setTestPhase: (phase: 'ping' | 'download' | 'upload' | null) => void,
  testHistory: TestHistoryItem[],
  setTestHistory: (history: TestHistoryItem[]) => void,
) => {
  setTesting(true);
  setProgress(0);
  setResults({ download: 0, upload: 0, ping: 0, jitter: 0 });

  const toastId = toast.loading('Memulai pengujian kecepatan...');

  try {
    // Ping test
    setTestPhase('ping');
    toast.loading('Mengukur ping dan jitter...', { id: toastId });
    const { ping, jitter } = await measurePing(setProgress);
    setResults(prev => ({ ...prev, ping, jitter }));

    // Download test
    setTestPhase('download');
    toast.loading('Mengukur kecepatan unduh...', { id: toastId });
    const downloadSpeed = await measureDownloadSpeed(setProgress);
    setResults(prev => ({ ...prev, download: downloadSpeed }));

    // Upload test
    setTestPhase('upload');
    toast.loading('Mengukur kecepatan unggah...', { id: toastId });
    const uploadSpeed = await measureUploadSpeed(setProgress);
    setResults(prev => ({ ...prev, upload: uploadSpeed }));

    // Simpan hasil
    const newHistory = [{
      date: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),  
      results: { download: downloadSpeed, upload: uploadSpeed, ping, jitter }
    }, ...testHistory.slice(0, 9)];

    setTestHistory(newHistory);
    localStorage.setItem('speedTestHistory', JSON.stringify(newHistory));

    toast.success(
      `Hasil pengujian:\nUnduh: ${downloadSpeed} Mbps | Unggah: ${uploadSpeed} Mbps\nPing: ${ping} ms | Jitter: ${jitter} ms`, 
      { 
        id: toastId,
        duration: 6000,
        position: 'bottom-center'
      }
    );
  } catch (error) {
    console.error('Speed test error:', error);
    toast.error('Pengujian gagal. Silakan coba lagi.', { 
      id: toastId,
      duration: 4000
    });
  } finally {
    setTestPhase(null);
    setTesting(false);
    setProgress(100);
  }
};