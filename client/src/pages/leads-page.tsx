import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import LeadList from "@/components/leads/LeadList";
import LeadFilters from "@/components/leads/LeadFilters";
import { useState } from "react";
import { Lead } from "@shared/schema";

export default function LeadsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Partial<Lead>>({});

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Leads</h1>
        </div>

        <LeadFilters onFilterChange={setFilters} />
        <LeadList filters={filters} />
      </div>
    </div>
  );
}
