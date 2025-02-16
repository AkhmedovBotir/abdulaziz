import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@shared/schema";
import { Loader2, RefreshCw } from "lucide-react";
import LeadList from "@/components/leads/LeadList";
import { useState } from "react";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export default function FacebookLeadsPage() {
  const { user } = useAuth();
  const [selectedPage, setSelectedPage] = useState<string>();

  const handleFacebookConnect = () => {
    if (!user?.facebookAccessToken) {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        "/auth/facebook",
        "Facebook Login",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    }
  };

  const { data: pages, isLoading: pagesLoading } = useQuery<FacebookPage[]>({
    queryKey: ["/api/facebook/pages"],
    enabled: !!user?.facebookAccessToken,
  });

  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", { pageId: selectedPage }],
    enabled: !!selectedPage,
  });

  if (pagesLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Facebook Leads</h1>

          <div className="flex gap-4">
            {!user?.facebookAccessToken ? (
              <Button onClick={handleFacebookConnect}>
                Connect Facebook Account
              </Button>
            ) : (
              <>
                <select
                  className="border rounded px-3 py-2"
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                >
                  <option value="">Select Facebook Page</option>
                  {pages?.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </select>

                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {selectedPage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-2">Today's Leads</h3>
              <p className="text-3xl font-bold">
                {leads?.filter(lead => {
                  const today = new Date();
                  const leadDate = new Date(lead.createdAt);
                  return leadDate.toDateString() === today.toDateString();
                }).length || 0}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-2">Pending Leads</h3>
              <p className="text-3xl font-bold">
                {leads?.filter(lead => lead.status === 'new').length || 0}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-2">Total Leads</h3>
              <p className="text-3xl font-bold">{leads?.length || 0}</p>
            </Card>
          </div>
        )}

        {selectedPage && <LeadList filters={{ pageId: selectedPage }} />}
      </div>
    </div>
  );
}