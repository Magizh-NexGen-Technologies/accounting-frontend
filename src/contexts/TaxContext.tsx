import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

interface TaxRate {
  id: number;
  tax_name: string;
  tax_rate: string;
  tax_type: string;
  tax_description: string;
  created_at: string;
  updated_at: string;
}

interface GSTSettings {
  id: number;
  legal_name: string;
  gstin: string;
  business_type: string;
  state: string;
  payment_terms: string[];
  created_at: string;
  updated_at: string;
}

interface TaxContextType {
  taxRates: TaxRate[];
  gstSettings: GSTSettings | null;
  loading: boolean;
  error: string | null;
  refreshTaxData: () => Promise<void>;
}

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export const TaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { organizationId } = useParams();
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [gstSettings, setGstSettings] = useState<GSTSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaxData = async () => {
    if (!organizationId) {
      console.log('No organizationId available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try { 
     
      
      // Fetch tax rates
      const taxResponse = await axios.get(`${API_URL}/api/dashboard/${organizationId}/settings/tax`);
     
      if (taxResponse.data.success && Array.isArray(taxResponse.data.data)) {
        setTaxRates(taxResponse.data.data);
      } else {
        console.error('Invalid tax rates response format:', taxResponse.data);
        setTaxRates([]);
      }

      // Fetch GST settings
      const gstResponse = await axios.get(`${API_URL}/api/dashboard/${organizationId}/settings/tax/gst`);
     
      if (gstResponse.data.success && gstResponse.data.data) {
        setGstSettings(gstResponse.data.data);
      } else {
        console.error('Invalid GST settings response format:', gstResponse.data);
        setGstSettings(null);
      }
    } catch (err) {
      console.error('Error fetching tax data:', err);
      setError('Failed to fetch tax data');
      setTaxRates([]);
      setGstSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
    fetchTaxData();
  }, [organizationId]);

  const value = {
    taxRates,
    gstSettings,
    loading,
    error,
    refreshTaxData: fetchTaxData
  };

  return (
    <TaxContext.Provider value={value}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => {
  const context = useContext(TaxContext);
  if (context === undefined) {
    throw new Error('useTax must be used within a TaxProvider');
  }
  return context;
};

export default TaxContext;

export function getTaxGroupSummary(group: TaxRate, allTaxes: TaxRate[]): string {
  try {
    const desc = JSON.parse(group.tax_description || "{}");
    if (desc.taxes && Array.isArray(desc.taxes)) {
      return desc.taxes
        .map((id: number) => {
          const t = allTaxes.find(tax => Number(tax.id) === Number(id));
          return t ? `${t.tax_name} (${t.tax_type} ${t.tax_rate}%)` : "";
        })
        .filter(Boolean)
        .join(" + ");
    }
  } catch {
    // ignore JSON parse errors
  }
  return "";
}
