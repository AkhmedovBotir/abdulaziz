import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SiFacebook } from "react-icons/si";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "All Leads", icon: Users },
    { href: "/facebook-leads", label: "Facebook Leads", icon: SiFacebook },
  ];

  return (
    <div className="border-r w-64 min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 mb-8">
        <SiFacebook className="h-8 w-8 text-primary" />
        <span className="font-bold text-lg">Lead Manager</span>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <a
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                location === href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </a>
          </Link>
        ))}
      </nav>

      <div className="border-t pt-4">
        <div className="px-3 py-2 mb-2">
          <div className="font-medium">{user?.username}</div>
          <div className="text-sm text-muted-foreground">Admin</div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}