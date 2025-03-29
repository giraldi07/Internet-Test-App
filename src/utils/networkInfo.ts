import { IpInfo } from '../types';

export const fetchIPInfo = async (): Promise<IpInfo> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch IP info');
    
    const data = await response.json();
    return {
      ip: data.ip,
      isp: data.org || 'Unknown ISP',
      location: `${data.city}, ${data.country_name}`,
      city: data.city,
      region: data.region,
      country: data.country_name,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Error fetching IP info:', error);
    return {
      ip: 'Not available',
      isp: 'Not available',
      location: 'Not available',
      city: 'Not available',
      region: 'Not available',
      country: 'Not available',
      timezone: 'Not available'
    };
  }
};

export const getConnectionType = (): string => {
  const connection = navigator.connection;
  if (!connection) return 'Unknown';

  if (connection.type) {
    return connection.type.charAt(0).toUpperCase() + connection.type.slice(1);
  }

  return connection.effectiveType?.toUpperCase() || 'Wi-Fi';
};