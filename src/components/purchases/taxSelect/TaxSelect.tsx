import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaxSelectProps {
  value: string;
  onChange: (value: string) => void;
  taxOptionsGrouped: { label: string, options: { value: string, label: string }[] }[];
}

const TaxSelect: React.FC<TaxSelectProps> = ({ value, onChange, taxOptionsGrouped }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue placeholder="Select tax" />
    </SelectTrigger>
    <SelectContent>
      {taxOptionsGrouped.map((group, groupIndex) => (
        <div key={`${group.label}-${groupIndex}`} className="py-1">
          <div className="px-2 py-1 text-xs text-muted-foreground">
            {group.label}
          </div>
          {group.options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </div>
      ))}
    </SelectContent>
  </Select>
);

export default TaxSelect;
