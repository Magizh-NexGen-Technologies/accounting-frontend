import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Plus, X, Edit2, Trash2, CalendarIcon, ChevronDown } from 'lucide-react';
import { format, addYears, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

interface NumberCounter {
  id: number;
  financial_year_code: string;
  prefix: string;
  last_number: number;
  created_at: string;
  updated_at: string;
}

// Reusable DropdownInput component with Add/Update button and edit in main input
function DropdownInput({
  label,
  placeholder,
  values,
  value,
  onChange,
  onAdd,
  onEdit,
  onDelete,
  inputType = 'text',
  isNumber = false,
}) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // value being edited
  const inputRef = useRef(null);
  const [dropdownWidth, setDropdownWidth] = useState(0);

  // Only allow valid numbers for tax
  const validInput = isNumber
    ? input && !isNaN(Number(input)) && Number(input) >= 0 && Number(input) <= 100
    : input && input.trim().length > 0;

  const filtered = input
    ? values.filter(v => v.toString().toLowerCase().includes(input.toLowerCase()))
    : values;

  // Show Add if not editing and input is valid and not duplicate
  const showAdd = !editing && validInput && !values.map(v => v.toString().toLowerCase()).includes(input.toLowerCase());
  // Show Update if editing and input is valid and not duplicate (except for the value being edited)
  const showUpdate = editing !== null && validInput && (input.toLowerCase() === editing.toString().toLowerCase() || !values.map(v => v.toString().toLowerCase()).includes(input.toLowerCase()));

  // Ensure dropdown width matches input
  const handleFocus = () => {
    setOpen(true);
    if (inputRef.current) {
      setDropdownWidth(inputRef.current.offsetWidth);
    }
  };

  // Handle edit click: fill input, set editing
  const handleEditClick = (v) => {
    setEditing(v);
    setInput(v.toString());
    setOpen(false);
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 0);
    }
  };

  // Handle update
  const handleUpdate = () => {
    if (showUpdate) {
      onEdit(editing, isNumber ? Number(input) : input);
      setEditing(null);
      setInput('');
    }
  };

  // Handle add
  const handleAdd = () => {
    if (showAdd) {
      onAdd(isNumber ? Number(input) : input);
      setInput('');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditing(null);
    setInput('');
  };

  return (
    <div className="space-y-1 relative">
      <Label className="text-base font-medium mb-1 block">{label}</Label>
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type={inputType}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10 ${editing ? 'border-primary' : ''}`}
            onFocus={handleFocus}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            min={isNumber ? 0 : undefined}
            max={isNumber ? 100 : undefined}
            inputMode={isNumber ? 'numeric' : undefined}
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        {showAdd && (
          <button
            className="flex items-center px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 whitespace-nowrap"
            onMouseDown={e => {
              e.preventDefault();
              handleAdd();
            }}
            style={{ minWidth: 70 }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </button>
        )}
        {editing !== null && (
          <>
            <button
              className="flex items-center px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 whitespace-nowrap"
              onMouseDown={e => {
                e.preventDefault();
                handleUpdate();
              }}
              style={{ minWidth: 90 }}
              disabled={!showUpdate}
            >
              <Edit2 className="h-4 w-4 mr-1" /> Update
            </button>
            <button
              className="flex items-center px-2 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/70 whitespace-nowrap border border-input"
              onMouseDown={e => {
                e.preventDefault();
                handleCancelEdit();
              }}
              style={{ minWidth: 40 }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
      {open && (
        <div
          className="absolute z-10 mt-1 bg-white border rounded shadow-lg max-h-48 overflow-auto"
          style={{ minWidth: dropdownWidth, width: dropdownWidth }}
        >
          {filtered.length === 0 && !showAdd && (
            <div className="px-4 py-2 text-muted-foreground text-sm">No results</div>
          )}
          {filtered.map((v, idx) => (
            <div
              key={v}
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-muted justify-between ${value === v ? 'bg-primary/10' : ''}`}
              onMouseDown={() => {
                if (editing === null) onChange(v);
                setOpen(false);
                setInput('');
              }}
            >
              <span className="truncate">{v}{isNumber ? '%' : ''}</span>
              <div className="flex items-center gap-2 ml-2">
                <button
                  className="text-muted-foreground hover:text-primary"
                  onMouseDown={e => {
                    e.stopPropagation();
                    handleEditClick(v);
                  }}
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onMouseDown={e => {
                    e.stopPropagation();
                    onDelete(v);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PurchaseSettings = () => {
  const [saving, setSaving] = useState(false);
  const [poPrefixError, setPoPrefixError] = useState('');
  const [billPrefixError, setBillPrefixError] = useState('');
  
  // Default to April 1st this year and March 31st next year
  const getDefaultStartDate = () => new Date(new Date().getFullYear(), 3, 1);
  const getDefaultEndDate = () => new Date(new Date().getFullYear() + 1, 2, 31);
  const [financialStartDate, setFinancialStartDate] = useState<Date | undefined>(getDefaultStartDate());
  const [financialEndDate, setFinancialEndDate] = useState<Date | undefined>(getDefaultEndDate());
  const [financialYearCode, setFinancialYearCode] = useState('');
  
  // Number counters
  const [poCounters, setPoCounters] = useState<NumberCounter[]>([]);
  const [billCounters, setBillCounters] = useState<NumberCounter[]>([]);
  
  const [settings, setSettings] = useState({
    poPrefix: '',
    billPrefix: '',
    vendorCategories: ['General', 'Inventory', 'Services', 'Equipment'],
    selectedCategory: 'General'
  });

  const [vendorCategories, setVendorCategories] = useState<string[]>([]);

  const { organizationId } = useParams();

  const [hasSettings, setHasSettings] = useState(false);

  // Calculate financial year end date and code when start date changes
  useEffect(() => {
    if (financialStartDate) {
      const oneYearLater = addYears(financialStartDate, 1);
      const endDate = subDays(oneYearLater, 1);
      setFinancialEndDate(endDate);
      
      const startYear = financialStartDate.getFullYear() % 100;
      const endYear = endDate.getFullYear() % 100;
      setFinancialYearCode(`${startYear}-${endYear}`);
    }
  }, [financialStartDate]);

  // Validate PO prefix
  useEffect(() => {
    const prefix = settings.poPrefix.replace('-', '');
    if (prefix.length < 2) {
      setPoPrefixError('Prefix must be at least 2 characters');
    } else if (prefix.length > 3) {
      setPoPrefixError('Prefix cannot exceed 3 characters');
    } else {
      setPoPrefixError('');
    }
  }, [settings.poPrefix]);

  // Validate Bill prefix
  useEffect(() => {
    const prefix = settings.billPrefix.replace('-', '');
    if (prefix.length < 2) {
      setBillPrefixError('Prefix must be at least 2 characters');
    } else if (prefix.length > 3) {
      setBillPrefixError('Prefix cannot exceed 3 characters');
    } else {
      setBillPrefixError('');
    }
  }, [settings.billPrefix]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "dd MMM yyyy, hh:mm a");
  };

  // Format a counter for display
  const formatCounter = (counter: NumberCounter) => {
    return `${counter.prefix}/${counter.financial_year_code}/${counter.last_number + 1}`;
  };
  
  const handleInputChange = (name: string, value: string | number) => {
    setSettings({
      ...settings,
      [name]: value 
    });
  };

  // Fetch settings and counters on mount
  useEffect(() => {
    if (organizationId) fetchPurchaseSettings(organizationId);
  }, [organizationId]);

  // Fetch settings from backend
  const fetchPurchaseSettings = async (organizationId) => {
    try {
      const res = await axios.get(`${API_URL}/api/dashboard/${organizationId}/settings/purchase-settings`);
      const data = res.data.data;
      setSettings({
        poPrefix: data.po_prefix,
        billPrefix: data.bill_prefix,
        vendorCategories: data.vendor_categories || [],
        selectedCategory: data.selected_category || ''
      });
      setVendorCategories(data.vendor_categories || []);
      setPoCounters(data.counters.filter(c => c.type === 'PO'));
      setBillCounters(data.counters.filter(c => c.type === 'BILL'));
      setFinancialYearCode(data.financial_year_code);
      // If backend returns null/invalid, use sensible defaults
      const start = data.financial_year_start_date ? new Date(data.financial_year_start_date) : getDefaultStartDate();
      const end = data.financial_year_end_date ? new Date(data.financial_year_end_date) : getDefaultEndDate();
      setFinancialStartDate(isNaN(start.getTime()) ? getDefaultStartDate() : start);
      setFinancialEndDate(isNaN(end.getTime()) ? getDefaultEndDate() : end);
      setHasSettings(!!(data.po_prefix && data.bill_prefix && data.financial_year_start_date && data.financial_year_end_date));
    } catch (err) {
      setHasSettings(false);
      toast.error('Failed to fetch settings');
    }
  };

  // Save settings to backend
  const savePurchaseSettings = async (organizationId, data, isNew) => {
    try {
      if (isNew) {
        await axios.post(`${API_URL}/api/dashboard/${organizationId}/settings/purchase-settings`, data);
      } else {
        await axios.put(`${API_URL}/api/dashboard/${organizationId}/settings/purchase-settings`, data);
      }
      toast.success('Settings saved!');
      fetchPurchaseSettings(organizationId);
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  // Delete a vendor category from backend and update UI
  const handleDeleteVendorCategory = async (category) => {
    try {
      await axios.delete(`${API_URL}/api/dashboard/${organizationId}/settings/purchase-settings/0`, {
        data: { vendorCategory: category }
      });
      toast.success('Category deleted');
      fetchPurchaseSettings(organizationId);
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const handleSave = () => {
    if (poPrefixError || billPrefixError) {
      toast.error("Please fix the prefix errors before saving.");
      return;
    }
    setSaving(true);
    savePurchaseSettings(organizationId, {
      po_prefix: settings.poPrefix,
      bill_prefix: settings.billPrefix,
      financial_year_start_date: financialStartDate,
      financial_year_end_date: financialEndDate,
      vendor_categories: vendorCategories,
      selected_category: settings.selectedCategory
    }, !hasSettings).finally(() => setSaving(false));
  };

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, "MMMM d, yyyy") : "-";
  };

  const currentYearCounters = poCounters.filter(
    c => c.financial_year_code === financialYearCode
  );

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-6">
        {/* Purchase Order Settings */}
        <Card>
         
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="po-prefix" className="text-base font-medium">PO Number Prefix (2-3 characters)</Label>
                <Input 
                  id="po-prefix" 
                  value={settings.poPrefix}
                  onChange={(e) => handleInputChange('poPrefix', e.target.value)}
                  className={poPrefixError ? "border-red-500" : ""}
                />
                {poPrefixError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{poPrefixError}</AlertDescription>
                  </Alert>
                )}
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-2">PO Number Format:</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="px-3 py-1.5 bg-muted rounded">{settings.poPrefix}</div>
                    <span>/</span>
                    <div className="px-3 py-1.5 bg-muted rounded">{financialYearCode}</div>
                    <span>/</span>
                    <div className="px-3 py-1.5 bg-muted rounded">[number]</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="bill-prefix" className="text-base font-medium">Bill Number Prefix (2-3 characters)</Label>
                <Input 
                  id="bill-prefix" 
                  value={settings.billPrefix}
                  onChange={(e) => handleInputChange('billPrefix', e.target.value)}
                  className={billPrefixError ? "border-red-500" : ""}
                />
                {billPrefixError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{billPrefixError}</AlertDescription>
                  </Alert>
                )}
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-2">Bill Number Format:</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="px-3 py-1.5 bg-muted rounded">{settings.billPrefix}</div>
                    <span>/</span>
                    <div className="px-3 py-1.5 bg-muted rounded">{financialYearCode}</div>
                    <span>/</span>
                    <div className="px-3 py-1.5 bg-muted rounded">[number]</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Financial Year Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Financial Year Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Financial Year Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !financialStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {financialStartDate ? format(financialStartDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={financialStartDate}
                      onSelect={setFinancialStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Financial Year End Date</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {financialEndDate ? format(financialEndDate, "PPP") : "Auto-calculated"}
                </Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Current Financial Year:</span>
                  <span className="text-sm ml-2">{formatDate(financialStartDate)} to {formatDate(financialEndDate)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">Financial Year Code:</span>
                  <span className="text-sm ml-2 font-medium">{financialYearCode}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
         {/* Vendor Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Vendor Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DropdownInput
              label="Category"
              placeholder="Search or create category"
              values={vendorCategories}
              value={settings.selectedCategory}
              onChange={v => handleInputChange('selectedCategory', v)}
              onAdd={v => {
                setVendorCategories([...vendorCategories, v]);
                handleInputChange('selectedCategory', v);
              }}
              onEdit={(oldV, newV) => {
                setVendorCategories(vendorCategories.map(c => c === oldV ? newV : c));
                if (settings.selectedCategory === oldV) handleInputChange('selectedCategory', newV);
              }}
              onDelete={handleDeleteVendorCategory}
            />
          </CardContent>
        </Card>

        {/* Number History */} 
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Number History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="po" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="po">PO Numbers</TabsTrigger>
                <TabsTrigger value="bill">Bill Numbers</TabsTrigger>
              </TabsList>
              <TabsContent value="po" className="mt-4">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Financial Year</TableHead>
                      <TableHead className="text-left">Prefix</TableHead>
                      <TableHead className="text-left">Last Number</TableHead>
                      <TableHead className="text-left">Next Number</TableHead>
                      <TableHead className="text-left">Status</TableHead>
                      <TableHead className="text-left">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentYearCounters.map((counter) => {
                      const isCurrentCounter = counter.prefix === settings.poPrefix;
                      
                      return (
                        <TableRow key={counter.id} className={isCurrentCounter ? "bg-muted/40" : ""}>
                          <TableCell className="text-left">{counter.financial_year_code}</TableCell>
                          <TableCell className="text-left">{counter.prefix}</TableCell>
                          <TableCell className="text-left">{counter.last_number}</TableCell>
                          <TableCell className="text-left font-medium">{formatCounter(counter)}</TableCell>
                          <TableCell className="text-left">
                            <Badge variant={isCurrentCounter ? "default" : "outline"}>
                              {isCurrentCounter ? "Current" : "Previous"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-left text-xs text-muted-foreground">
                            {formatTimestamp(counter.updated_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="bill" className="mt-4">
                {billCounters.length > 0 ? (
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Financial Year</TableHead>
                        <TableHead className="text-left">Prefix</TableHead>
                        <TableHead className="text-left">Last Number</TableHead>
                        <TableHead className="text-left">Next Number</TableHead>
                        <TableHead className="text-left">Status</TableHead>
                        <TableHead className="text-left">Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billCounters.map((counter) => {
                        const isCurrentCounter = counter.financial_year_code === financialYearCode && 
                                               counter.prefix === settings.billPrefix;
                        
                        return (
                          <TableRow key={counter.id} className={isCurrentCounter ? "bg-muted/40" : ""}>
                            <TableCell className="text-left">{counter.financial_year_code}</TableCell>
                            <TableCell className="text-left">{counter.prefix}</TableCell>
                            <TableCell className="text-left">{counter.last_number}</TableCell>
                            <TableCell className="text-left font-medium">{formatCounter(counter)}</TableCell>
                            <TableCell className="text-left">
                              <Badge variant={isCurrentCounter ? "default" : "outline"}>
                                {isCurrentCounter ? "Current" : "Previous"}
                              </Badge>
                            </TableCell> 
                            <TableCell className="text-left text-xs text-muted-foreground">
                              {formatTimestamp(counter.updated_at)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">No bill numbers generated yet.</p>
                    <p className="text-sm mt-2 text-muted-foreground">Generate your first bill number to see it here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={saving || !!poPrefixError || !!billPrefixError} 
          className="flex items-center"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PurchaseSettings;
