import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface BrandingContextType {
  faviconUrl: string;
  logoUrl: string;
  updateBranding: (favicon: string, logo: string) => void;
}

interface BrandingProviderProps { 
  children: React.ReactNode; 
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const getFileUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://')) return path.replace('http://', 'https://');
  if (path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
};

const updateFavicon = (url: string) => {
  // Remove all existing favicon links
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => link.parentNode?.removeChild(link));

  // Add new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  // Use correct type for your favicon (png, svg, ico)
  link.type = url.endsWith('.svg') ? 'image/svg+xml' : url.endsWith('.png') ? 'image/png' : 'image/x-icon';
  link.href = getFileUrl(url);
  document.head.appendChild(link);
};

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ children }) => {
  const [faviconUrl, setFaviconUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Function to update branding
  const updateBranding = (favicon: string, logo: string) => {
    setFaviconUrl(favicon);
    setLogoUrl(logo);
    updateFavicon(favicon);
  };

  // Fetch branding on component mount
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/superadmin/branding`);
        if (data) {
          updateBranding(data.favicon_url, data.logo_url);
        }
      } catch (error) {
        console.error('Failed to fetch branding:', error);
        // Fallback to default favicon if fetch fails
        updateFavicon('/favicon.ico');
      }
    };

    fetchBranding();
  }, []);

  const value = {
    faviconUrl,
    logoUrl,
    updateBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
