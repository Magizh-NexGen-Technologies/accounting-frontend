import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Building, ShoppingCart, Users, FileText, Receipt, Package, MessageSquare, Calculator, CreditCard } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import GeneralSettings from '@/components/settings/GeneralSettings';
// import UserSettings from '@/components/settings/UserSettings';
import InvoiceSettings from '@/components/settings/InvoiceSettings';
import EmailSettings from '@/components/settings/EmailSettings';
// import IntegrationSettings from '@/components/settings/IntegrationSettings';
import TaxSettings from '@/components/settings/TaxSettings';
import InventorySettings from '@/components/settings/InventorySettings';
import SalesSettings from '@/components/settings/SalesSettings';
import PurchaseSettings from '@/components/settings/PurchaseSettings';
// import WhatsAppSettings from '@/components/settings/WhatsAppSettings'; 

interface SettingsProps {
  organizationId?: string;
}

const Settings: React.FC<SettingsProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  
  // Extract the tab from the URL path
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const tabFromUrl = pathParts[pathParts.length - 1];
    if (tabFromUrl && tabFromUrl !== 'settings') {
      setActiveTab(tabFromUrl);
    } else {
      // If no tab is specified, redirect to general settings
      navigate(`/${organizationId}/settings/general`, { replace: true });
    }
  }, [location.pathname, organizationId, navigate]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/${organizationId}/settings/${value}`);
  };

  // If no organizationId is present, redirect to home
  useEffect(() => {
    if (!organizationId) {
      navigate('/');
    }
  }, [organizationId, navigate]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <SettingsIcon className="h-6 w-6 mr-2 text-primary" />
            System Settings
          </h2>
          <p className="text-muted-foreground">
            Configure system-wide settings for your organization
          </p>
        </div>
      </div>
      <Separator />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-1">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          {/* <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>  */}
          <TabsTrigger value="invoice" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Invoice</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">Email</span>
          </TabsTrigger>
          {/* <TabsTrigger value="integrations" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span className="hidden md:inline">Integrations</span>
          </TabsTrigger> */}
          <TabsTrigger value="tax" className="flex items-center gap-1">
            <Calculator className="h-4 w-4" />
            <span className="hidden md:inline">Tax</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span className="hidden md:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-1">
            <Receipt className="h-4 w-4" />
            <span className="hidden md:inline">Sales</span>
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline">Purchases</span>
          </TabsTrigger>
          {/* <TabsTrigger value="whatsapp" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">WhatsApp</span>
          </TabsTrigger> */}
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your organization profile and basic settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users & Permissions</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSettings />
            </CardContent>
          </Card>
        </TabsContent> */}
        
        <TabsContent value="invoice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>
                Customize invoice templates and numbering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email SMTP</CardTitle>
              <CardDescription>
                Customize email notifications and templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect with third-party services and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationSettings />
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>
                Configure tax rates, GST settings and tax categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaxSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
              <CardDescription>
                Configure inventory management preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventorySettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Settings</CardTitle>
              <CardDescription>
                Configure sales workflows and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Settings</CardTitle>
              <CardDescription>
                Configure purchase and vendor preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Settings</CardTitle>
              <CardDescription>
                Configure WhatsApp Business API integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WhatsAppSettings />
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default Settings;
