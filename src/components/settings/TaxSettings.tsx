import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GSTSettings from './tax/GSTSettings';
import TaxRates from './tax/TaxRates';

const TaxSettings = () => {
  const [activeTab, setActiveTab] = useState('gst');
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="gst">GST Settings</TabsTrigger>
          <TabsTrigger value="tax-rates">Tax Rates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gst" className="space-y-4">
          <GSTSettings />
        </TabsContent>
        
        <TabsContent value="tax-rates" className="space-y-4">
          <TaxRates   />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxSettings;
