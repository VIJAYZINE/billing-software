import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Receipt, Users, BarChart2, Calculator } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: user } = useQuery<User>({ 
    queryKey: ["/api/auth/me"],
    retry: false
  });

  const logout = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/auth");
    }
  });

  if (!user && location !== "/auth") {
    navigate("/auth");
    return null;
  }

  if (location === "/auth") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard">
                <a className="text-xl font-bold">Billing System</a>
              </Link>
              <Link href="/dashboard">
                <a className={location === "/dashboard" ? "text-primary" : ""}>Dashboard</a>
              </Link>
              <Link href="/customers">
                <a className={location === "/customers" ? "text-primary" : ""}>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Customers
                  </span>
                </a>
              </Link>
              <Link href="/bills">
                <a className={location === "/bills" ? "text-primary" : ""}>
                  <span className="flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    Bills
                  </span>
                </a>
              </Link>
              <Link href="/stock-summary">
                <a className={location === "/stock-summary" ? "text-primary" : ""}>
                  <span className="flex items-center gap-1">
                    <BarChart2 className="h-4 w-4" />
                    Stock Summary
                  </span>
                </a>
              </Link>
              <Link href="/gst-summary">
                <a className={location === "/gst-summary" ? "text-primary" : ""}>
                  <span className="flex items-center gap-1">
                    <Calculator className="h-4 w-4" />
                    GST Summary
                  </span>
                </a>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.businessName}</span>
              <Button variant="outline" onClick={() => logout.mutate()}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}