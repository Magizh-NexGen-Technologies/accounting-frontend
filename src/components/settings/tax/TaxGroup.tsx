import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface TaxItem {
  id: number;
  tax_name: string;
  tax_rate: string | number;
  tax_type: string;
  tax_description: string;
}

interface TaxGroupProps {
  onClose: () => void;
  organizationId: string;
  API_URL: string;
  onGroupCreated?: () => void;
  editingGroup?: TaxItem | null;
}

export const TaxGroup: React.FC<TaxGroupProps> = ({
  onClose,
  organizationId,
  API_URL,
  onGroupCreated,
  editingGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ groupName?: string; taxes?: string }>({});
  const [summaryError, setSummaryError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.tax_name);
      try {
        const desc = JSON.parse(editingGroup.tax_description || '{}');
        setSelected(desc.taxes || []);
      } catch {
        setSelected([]);
      }
    } else {
      setGroupName('');
      setSelected([]);
    }
  }, [editingGroup]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/dashboard/${organizationId}/settings/tax`)
      .then((res) => setTaxes(res.data.data.filter((t: TaxItem) => t.tax_type !== "GROUP")));
  }, [organizationId, API_URL]);

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const errs: { groupName?: string; taxes?: string } = {};
    let summary = "";
    if (!groupName.trim()) {
      errs.groupName = "Group name is required";
      summary = "Please provide a group name.";
    }
    if (selected.length < 2) {
      errs.taxes = "Select at least two taxes";
      summary = "A group must contain at least two taxes.";
    }
    const selectedTaxes = taxes.filter((t) => selected.includes(t.id));
    const types = selectedTaxes.map((t) => t.tax_type);
    const uniqueTypes = [...new Set(types)];
    if (uniqueTypes.includes("IGST") && uniqueTypes.some((t) => t !== "IGST")) {
      errs.taxes = "Cannot mix IGST with CGST/SGST/UTGST";
      summary = "IGST cannot be grouped with other GST types.";
    }
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    if (Object.values(typeCounts).some(count => count > 1)) {
      errs.taxes = "Cannot group the same GST type more than once.";
      summary = "Duplicate GST types are not allowed in a group.";
    }
    setErrors(errs);
    setSummaryError(summary);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const selectedTaxes = taxes.filter((t) => selected.includes(t.id));
      const totalRate = selectedTaxes.reduce(
        (sum, t) => sum + parseFloat(t.tax_rate as string),
        0
      );
      const payload = {
        tax_name: groupName,
        tax_rate: totalRate,
        tax_type: "GROUP",
        tax_description: JSON.stringify({ taxes: selected }),
      };
      if (editingGroup) {
        await axios.put(
          `${API_URL}/api/dashboard/${organizationId}/settings/tax/${editingGroup.id}`,
          payload
        );
        toast.success("Tax group updated successfully");
      } else {
        await axios.post(
          `${API_URL}/api/dashboard/${organizationId}/settings/tax`,
          payload
        );
        toast.success("Tax group created successfully");
      }
      if (onGroupCreated) onGroupCreated();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to save tax group");
      } else {
        toast.error("Failed to save tax group");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">New Tax Group</h2>
       
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {summaryError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex items-center gap-2">
            <span role="img" aria-label="error">❗</span>
            <span>{summaryError}</span>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Tax Group Name</label>
          <input
            type="text"
            className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.groupName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter tax group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          {errors.groupName && (
            <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <span role="img" aria-label="error">⚠️</span> {errors.groupName}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Associate Taxes</label>
          <div className="max-h-80 overflow-y-auto border rounded p-2 bg-gray-50">
            {taxes.map((tax) => (
              <label key={tax.id} className="flex items-center py-1 cursor-pointer hover:bg-blue-50 rounded px-2">
                <input
                  type="checkbox"
                  checked={selected.includes(tax.id)}
                  onChange={() => handleSelect(tax.id)}
                  className="mr-2 accent-blue-500"
                />
                <span className="font-medium">{tax.tax_name}</span>
                <span className="ml-2 text-xs text-gray-500 bg-gray-200 rounded px-2 py-0.5">{tax.tax_type}</span>
                <span className="ml-auto text-xs text-gray-700">{tax.tax_rate}%</span>
              </label>
            ))}
          </div>
          {errors.taxes && (
            <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <span role="img" aria-label="error">🚫</span> {errors.taxes}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50 flex items-center justify-center"
          disabled={saving}
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              Saving...
            </>
          ) : (
            editingGroup ? "Update" : "Save"
          )}
        </button>
      </form>
    </div>
  );
}; 