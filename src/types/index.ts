export interface NetworkInformation {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  onchange?: EventListener;
}

export interface SpeedTestResults {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
}

export interface IpInfo {
  ip: string;
  isp: string;
  location: string;
  city: string;
  region: string;
  country: string;
  timezone: string;
}

export interface GameRequirement {
  name: string;
  requirements: {
    download: number;
    upload: number;
    ping: number;
  };
  examples: string[];
  platforms: string[];
}

export interface TestHistoryItem {
  date: string;
  results: SpeedTestResults;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}