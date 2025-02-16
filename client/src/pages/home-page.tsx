import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { data: leads, isLoading } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const todayLeads = leads?.filter(lead => {
    const today = new Date();
    const leadDate = new Date(lead.createdAt);
    return leadDate.toDateString() === today.toDateString();
  }).length || 0;

  const pendingLeads = leads?.filter(lead => lead.status === 'new').length || 0;

  // Prepare chart data
  const chartData = leads?.reduce((acc: any[], lead) => {
    const date = new Date(lead.createdAt).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Today's Leads</h3>
            <p className="text-3xl font-bold">{todayLeads}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Pending Leads</h3>
            <p className="text-3xl font-bold">{pendingLeads}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Total Leads</h3>
            <p className="text-3xl font-bold">{leads?.length || 0}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Lead Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
