import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import CreateBill from "@/pages/create-bill";
import Bills from "@/pages/bills";
import StockSummary from "@/pages/stock-summary";
import GSTSummary from "@/pages/gst-summary";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/customers" component={Customers} />
      <Route path="/create-bill" component={CreateBill} />
      <Route path="/bills" component={Bills} />
      <Route path="/stock-summary" component={StockSummary} />
      <Route path="/gst-summary" component={GSTSummary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
      <FeedbackDialog />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;