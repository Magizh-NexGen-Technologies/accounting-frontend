import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Save,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import Select from "react-select";
import { StylesConfig, SingleValue } from "react-select";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StateOption {
  value: string;
  label: string;
}

interface GSTSettings {
  id?: string;
  legal_name: string;
  gstin: string;
  business_type: string;
  state: string;
  default_payment_term: string;
}

const API_URL = import.meta.env.VITE_API_URL;

// Updated Indian states data with state names as values
const indianStates: StateOption[] = [
  { value: "Jammu & Kashmir", label: "Jammu & Kashmir" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Punjab", label: "Punjab" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "Haryana", label: "Haryana" },
  { value: "Delhi", label: "Delhi" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Bihar", label: "Bihar" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Manipur", label: "Manipur" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Tripura", label: "Tripura" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Assam", label: "Assam" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Odisha", label: "Odisha" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Daman & Diu", label: "Daman & Diu" },
  { value: "Dadra & Nagar Haveli", label: "Dadra & Nagar Haveli" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Goa", label: "Goa" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Kerala", label: "Kerala" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Puducherry", label: "Puducherry" },
  { value: "Andaman & Nicobar Islands", label: "Andaman & Nicobar Islands" },
  { value: "Telangana", label: "Telangana" },
  { value: "Andhra Pradesh (New)", label: "Andhra Pradesh (New)" },
];

const customStyles: StylesConfig<StateOption> = {
  control: (base) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "6px",
    borderColor: "hsl(var(--input))",
    backgroundColor: "hsl(var(--background))",
    "&:hover": {
      borderColor: "hsl(var(--input))",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "6px",
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "hsl(var(--accent))" : "transparent",
    color: state.isFocused
      ? "hsl(var(--accent-foreground))"
      : "hsl(var(--foreground))",
    "&:hover": {
      backgroundColor: "hsl(var(--accent))",
      color: "hsl(var(--accent-foreground))",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
  input: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
};

const GSTSettings = () => {
  const { organizationId } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gstSettings, setGstSettings] = useState<GSTSettings>({
    legal_name: "",
    gstin: "",
    business_type: "regular",
    state: "",
    default_payment_term: "",
  });
  const [selectedState, setSelectedState] = useState<StateOption | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    fetchGSTSettings();
  }, [organizationId]);

  useEffect(() => {
    if (open && inputContainerRef.current) {
      setDropdownWidth(inputContainerRef.current.offsetWidth);
    }
  }, [open]);

  const fetchGSTSettings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboard/${organizationId}/settings/tax/gst`
      );
      if (response.data.data) {
        setGstSettings(response.data.data);
        setSelectedState(
          indianStates.find(
            (state) => state.value === response.data.data.state
          ) || null
        );
        setPaymentTerms(response.data.data.payment_terms || []);
      }
    } catch (error) {
      toast.error("Failed to fetch GST settings");
    } finally {
      setLoading(false);
    }
  };

  const validateGSTIN = (gstin: string) => {
    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const handleDeletePaymentTerm = async (term: string) => {
    try {
      await axios.delete(
        `${API_URL}/api/dashboard/${organizationId}/settings/tax/gst/0`,
        {
          data: { paymentTerm: term },
        }
      );
      toast.success("Payment term deleted");
      fetchGSTSettings();
    } catch (err) {
      toast.error("Failed to delete payment term");
    }
  };

  const handleSave = async () => {
    if (!gstSettings.legal_name || !gstSettings.gstin || !selectedState) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateGSTIN(gstSettings.gstin)) {
      toast.error("Please enter a valid GSTIN");
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...gstSettings,
        state: selectedState?.value || "",
        payment_terms: paymentTerms,
      };

      if (gstSettings.id) {
        await axios.put(
          `${API_URL}/api/dashboard/${organizationId}/settings/tax/gst/${gstSettings.id}`,
          data
        );
      } else {
        await axios.post(
          `${API_URL}/api/dashboard/${organizationId}/settings/tax/gst`,
          data
        );
      }

      toast.success("GST settings saved successfully");
    } catch (error) {
      toast.error("Failed to save GST settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="legal-name">Business Legal Name</Label>
        <Input
          id="legal-name"
          placeholder="Enter your business legal name"
          value={gstSettings.legal_name}
          onChange={(e) =>
            setGstSettings({ ...gstSettings, legal_name: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="gstin">Business GSTIN</Label>
          <Input
            id="gstin"
            placeholder="Enter your GSTIN"
            value={gstSettings.gstin}
            onChange={(e) =>
              setGstSettings({ ...gstSettings, gstin: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gst-business-type">Business Type</Label>
          <ShadcnSelect
            value={gstSettings.business_type}
            onValueChange={(value) =>
              setGstSettings({ ...gstSettings, business_type: value })
            }
          >
            <SelectTrigger id="gst-business-type">
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="composition">Composition</SelectItem>
              <SelectItem value="unregistered">Unregistered</SelectItem>
              <SelectItem value="consumer">Consumer</SelectItem>
              <SelectItem value="overseas">Overseas</SelectItem>
              <SelectItem value="sez">SEZ (Special Economic Zone)</SelectItem>
            </SelectContent>
          </ShadcnSelect>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="gst-state">State</Label>
        <Select
          id="gst-state"
          value={selectedState}
          onChange={(newValue: SingleValue<StateOption>) =>
            setSelectedState(newValue)
          }
          options={indianStates}
          styles={customStyles}
          placeholder="Search and select state..."
          isSearchable
          isClearable
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="space-y-2">
        <CardHeader className="p-0">
          <CardTitle>Payment Terms Settings</CardTitle>
          <CardDescription>
            Global Settings
          </CardDescription>
        </CardHeader>

        <Label className="text-base font-medium mb-1 block">
          Payment Terms
        </Label>
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1" ref={inputContainerRef}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search or create payment term"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10"
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          {input && !paymentTerms.includes(input) && !editing && (
            <button
              className="flex items-center px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 whitespace-nowrap"
              onClick={() => {
                setPaymentTerms([...paymentTerms, input]);
                setGstSettings({ ...gstSettings, default_payment_term: input });
                setInput("");
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
                onClick={() => {
                  setPaymentTerms(
                    paymentTerms.map((t) => (t === editing ? input : t))
                  );
                  if (gstSettings.default_payment_term === editing) {
                    setGstSettings({
                      ...gstSettings,
                      default_payment_term: input,
                    });
                  }
                  setEditing(null);
                  setInput("");
                }}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Update
              </button>
              <button
                className="flex items-center px-2 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/70 whitespace-nowrap border border-input"
                onClick={() => {
                  setEditing(null);
                  setInput("");
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
        {open && (
          <div
            className="absolute z-10 mt-1 bg-white border rounded shadow-lg max-h-48 overflow-auto"
            style={{ width: dropdownWidth }}
          >
            {paymentTerms.length === 0 && !input && (
              <div className="px-4 py-2 text-muted-foreground text-sm">
                No payment terms added yet
              </div>
            )}
            {paymentTerms
              .filter((term) =>
                term.toLowerCase().includes(input.toLowerCase())
              )
              .map((term) => (
                <div
                  key={term}
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-muted justify-between"
                  onClick={() => {
                    setGstSettings({
                      ...gstSettings,
                      default_payment_term: term,
                    });
                    setOpen(false);
                    setInput("");
                  }}
                >
                  <span className="truncate">{term}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      className="text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(term);
                        setInput(term);
                        setOpen(false);
                      }}
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePaymentTerm(term);
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

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save 
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GSTSettings;
