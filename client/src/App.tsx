import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import SendMoney from "@/pages/SendMoney";
import ManageRecipients from "@/pages/ManageRecipients";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Switch>
      <Route path="/manage-recipients" component={ManageRecipients} />
      <Route path="*">
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/send-money" component={SendMoney} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
