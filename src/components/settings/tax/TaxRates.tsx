import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Save, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { TaxGroup } from "./TaxGroup";
import { getTaxGroupSummary } from "@/contexts/TaxContext"; // adjust path as needed

const API_URL = import.meta.env.VITE_API_URL;

interface TaxRate {
  id: string | number;
  tax_name: string;
  tax_rate: number;
  tax_type: string;
  tax_description: string;
  created_at?: string;
  updated_at?: string;
}

const TaxRates = () => {
  const { organizationId } = useParams();
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaxRate, setNewTaxRate] = useState<Partial<TaxRate>>({
    tax_name: "",
    tax_rate: 0,
    tax_type: "IGST",
    tax_description: "",
  });
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taxRateToDelete, setTaxRateToDelete] = useState<TaxRate | null>(null);
  const [isTaxGroupModalOpen, setIsTaxGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<(TaxRate & { id: number }) | null>(null);

  useEffect(() => {
    fetchTaxRates();
  }, [organizationId]);

  const fetchTaxRates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/dashboard/${organizationId}/settings/tax`
      );
      setTaxRates(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch tax rates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate: TaxRate) => {
    setEditingTaxRate(rate);
    setIsModalOpen(true);
  };

  const handleDelete = (rate: TaxRate) => {
    setTaxRateToDelete(rate);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taxRateToDelete) return;

    try {
      await axios.delete(
        `${API_URL}/api/dashboard/${organizationId}/settings/tax/${taxRateToDelete.id}`
      );
      setTaxRates((prev) =>
        prev.filter((rate) => rate.id !== taxRateToDelete.id)
      );
      toast.success("Tax rate deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tax rate");
    } finally {
      setDeleteDialogOpen(false);
      setTaxRateToDelete(null);
    }
  };

  const handleSave = async () => {
    if (editingTaxRate) {
      // Handle edit
      setSaving(true);
      try {
        const response = await axios.put(
          `${API_URL}/api/dashboard/${organizationId}/settings/tax/${editingTaxRate.id}`,
          {
            tax_name: editingTaxRate.tax_name,
            tax_rate: editingTaxRate.tax_rate,
            tax_type: editingTaxRate.tax_type,
            tax_description: editingTaxRate.tax_description,
          }
        );
        setTaxRates((prev) =>
          prev.map((rate) =>
            rate.id === editingTaxRate.id ? response.data.data : rate
          )
        );
        toast.success("Tax rate updated successfully");
        setIsModalOpen(false);
        setEditingTaxRate(null);
      } catch (error) {
        toast.error("Failed to update tax rate");
      } finally {
        setSaving(false);
      }
    } else {
      // Handle new tax rate
      if (
        newTaxRate.tax_name &&
        newTaxRate.tax_type &&
        newTaxRate.tax_rate !== undefined
      ) {
        try {
          const response = await axios.post(
            `${API_URL}/api/dashboard/${organizationId}/settings/tax`,
            {
              tax_name: newTaxRate.tax_name,
              tax_rate: newTaxRate.tax_rate,
              tax_type: newTaxRate.tax_type,
              tax_description: newTaxRate.tax_description || "",
            }
          );
          setTaxRates((prev) => [...prev, response.data.data]);
          setIsModalOpen(false);
          setNewTaxRate({
            tax_name: "",
            tax_rate: 0,
            tax_type: "UTGST",
            tax_description: "",
          });
          toast.success("Tax rate added successfully");
        } catch (error) {
          toast.error("Failed to add tax rate");
        }
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTaxRate(null);
    setNewTaxRate({
      tax_name: "",
      tax_rate: 0,
      tax_type: "UTGST",
      tax_description: "",
    });
  };

  const handleAddTaxGroup = () => {
    setEditingGroup(null);
    setIsTaxGroupModalOpen(true);
  };

  const getTaxDetails = (ids: number[]) => {
    return taxRates
      .filter(t => ids.includes(Number(t.id)) && t.tax_type !== "GROUP")
      .map(t => `${t.tax_name} (${t.tax_type} ${t.tax_rate}%)`)
      .join(" + ");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Tax Rates</h4>

        <div className="flex gap-2 ">
          <Button size="sm" onClick={handleAddTaxGroup}>
            <Plus className="h-4 w-4 mr-1" /> Add Tax Group
          </Button>

          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Tax Rate
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 border rounded-md p-4">
          <div className="grid grid-cols-5 gap-4 items-center pb-2 border-b">
            <Label className="font-medium">Name</Label>
            <Label className="font-medium">Type</Label>
            <Label className="font-medium">Rate (%)</Label>
            <Label className="font-medium">Description</Label>
            <Label className="font-medium">Actions</Label>
          </div>

          {taxRates.map((rate) => {
            let groupSummary = "";
            if (rate.tax_type === "GROUP") {
              groupSummary = getTaxGroupSummary(
                {
                  ...rate,
                  id: Number(rate.id),
                  tax_rate: String(rate.tax_rate),
                  created_at: rate.created_at || "",
                  updated_at: rate.updated_at || ""
                },
                taxRates.map(t => ({
                  ...t,
                  id: Number(t.id),
                  tax_rate: String(t.tax_rate),
                  created_at: t.created_at || "",
                  updated_at: t.updated_at || ""
                }))
              );
            }

            return (
              <div key={rate.id} className="grid grid-cols-5 gap-4 items-center">
                <div>
                  {rate.tax_name}
                 
                </div>
                <div>
                  {rate.tax_type}
                  {rate.tax_type === "GROUP" && groupSummary && (
                    <div className="text-xs text-muted-foreground">
                      ({groupSummary.split(" + ").map(s => s.match(/\((.*?)\)/)?.[1]).filter(Boolean).join(", ")})
                    </div>
                  )}
                </div>
                <div>{rate.tax_rate}%</div>
                <div>
                  {rate.tax_type === "GROUP" && groupSummary
                    ? groupSummary
                    : rate.tax_description}
                </div>
                <div className="flex gap-2">
                  {rate.tax_type === "GROUP" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingGroup({ ...rate, id: Number(rate.id) });
                        setIsTaxGroupModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rate)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rate)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTaxRate ? "Edit Tax Rate" : "Add New Tax Rate"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tax-name">Tax Name</Label>
              <Input
                id="tax-name"
                placeholder="Enter tax name"
                value={editingTaxRate?.tax_name || newTaxRate.tax_name}
                onChange={(e) => {
                  if (editingTaxRate) {
                    setEditingTaxRate((prev) => ({
                      ...prev!,
                      tax_name: e.target.value,
                    }));
                  } else {
                    setNewTaxRate((prev) => ({
                      ...prev,
                      tax_name: e.target.value,
                    }));
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-type">Tax Type</Label>
              <Select
                value={editingTaxRate?.tax_type || newTaxRate.tax_type}
                onValueChange={(value) => {
                  if (editingTaxRate) {
                    setEditingTaxRate((prev) => ({
                      ...prev!,
                      tax_type: value,
                    }));
                  } else {
                    setNewTaxRate((prev) => ({ ...prev, tax_type: value }));
                  }
                }}
              >
                <SelectTrigger id="tax-type">
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CGST">CGST</SelectItem>
                  <SelectItem value="SGST">SGST</SelectItem>
                  <SelectItem value="UTGST">UTGST</SelectItem>
                  <SelectItem value="IGST">IGST</SelectItem>
                  <SelectItem value="CESS">CESS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                placeholder="Enter tax rate"
                value={editingTaxRate?.tax_rate || newTaxRate.tax_rate}
                onChange={(e) => {
                  if (editingTaxRate) {
                    setEditingTaxRate((prev) => ({
                      ...prev!,
                      tax_rate: parseFloat(e.target.value),
                    }));
                  } else {
                    setNewTaxRate((prev) => ({
                      ...prev,
                      tax_rate: parseFloat(e.target.value),
                    }));
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-description">Description</Label>
              <Textarea
                id="tax-description"
                placeholder="Enter tax description"
                value={
                  editingTaxRate?.tax_description || newTaxRate.tax_description
                }
                onChange={(e) => {
                  if (editingTaxRate) {
                    setEditingTaxRate((prev) => ({
                      ...prev!,
                      tax_description: e.target.value,
                    }));
                  } else {
                    setNewTaxRate((prev) => ({
                      ...prev,
                      tax_description: e.target.value,
                    }));
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingTaxRate ? "Update Tax Rate" : "Add Tax Rate"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tax
              rate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isTaxGroupModalOpen} onOpenChange={setIsTaxGroupModalOpen}>
        <DialogContent>
          <TaxGroup
            onClose={() => setIsTaxGroupModalOpen(false)}
            organizationId={organizationId}
            API_URL={API_URL}
            onGroupCreated={fetchTaxRates}
            editingGroup={editingGroup}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxRates;
