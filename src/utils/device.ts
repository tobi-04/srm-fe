// Generate a unique device ID for this browser
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');

  if (!deviceId) {
    // Generate a unique ID using timestamp and random string
    deviceId = `web-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('device_id', deviceId);
  }

  return deviceId;
};

// Get device information
export const getDeviceInfo = () => {
  const deviceId = getDeviceId();

  // Get browser and OS info
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown Browser';
  let osName = 'Unknown OS';

  // Detect browser
  if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera';
  } else if (userAgent.indexOf('Trident') > -1) {
    browserName = 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
  }

  // Detect OS
  if (userAgent.indexOf('Win') > -1) osName = 'Windows';
  else if (userAgent.indexOf('Mac') > -1) osName = 'MacOS';
  else if (userAgent.indexOf('Linux') > -1) osName = 'Linux';
  else if (userAgent.indexOf('Android') > -1) osName = 'Android';
  else if (userAgent.indexOf('iOS') > -1) osName = 'iOS';

  return {
    device_id: deviceId,
    device_name: `${browserName} on ${osName}`,
    device_type: 'web',
    device_token: '', // Can be used for push notifications if needed
  };
};
