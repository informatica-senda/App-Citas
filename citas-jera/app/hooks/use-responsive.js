// hooks/use-responsive.js
import { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';

export const useResponsive = () => {
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(Dimensions.get('window'));
    };

    // Add event listener for window resize on web
    if (Platform.OS === 'web') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    // For mobile, use Dimensions change event
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => subscription.remove();
  }, []);

  return {
    width: windowDimensions.width,
    height: windowDimensions.height,
    isDesktop: windowDimensions.width >= 1024,
    isTablet: windowDimensions.width >= 768 && windowDimensions.width < 1024,
    isMobile: windowDimensions.width < 768,
    isWeb: Platform.OS === 'web',
  };
};

export default useResponsive;