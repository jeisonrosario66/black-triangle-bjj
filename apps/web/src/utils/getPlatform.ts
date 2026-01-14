export const getPlatform = () => {
    const userAgent = navigator.userAgent;
  
    if (/android/i.test(userAgent)) return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent)) return "iOS";
    if (/Windows NT/.test(userAgent)) return "Windows";
    if (/Mac OS X/.test(userAgent)) return "macOS";
    if (/Linux/.test(userAgent)) return "Linux";
  
    return "Unknown";
  };