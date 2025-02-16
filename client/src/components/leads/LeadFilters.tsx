import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead } from "@shared/schema";
import { useState } from "react";

interface LeadFiltersProps {
  onFilterChange: (filters: Partial<Lead>) => void;
}

export default function LeadFilters({ onFilterChange }: LeadFiltersProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | undefined>();

  const handleFilterChange = () => {
    const filters: Partial<Lead> = {};
    if (name) filters.name = name;
    if (status) filters.status = status;
    onFilterChange(filters);
  };

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 max-w-xs">
        <Input
          placeholder="Search by name..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            handleFilterChange();
          }}
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          handleFilterChange();
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}