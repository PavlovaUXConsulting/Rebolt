import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Logo from "./Logo";
import FdicLogo from "@/components/assets/FdicLogo";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[hsl(var(--bank-border))]">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm text-gray-600">Good Afternoon, Megan Wiseman</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block md:hidden"
          >
            <Menu className="h-6 w-6 text-[hsl(var(--bank-navy))]" />
          </Button>
        </div>
      </header>

      {/* FDIC Notice - Hidden on Send Money page */}
      {location !== '/send-money' && (
        <div className="bg-white border-b border-[hsl(var(--bank-border))]">
          <div className="container mx-auto px-4 py-2 flex items-center gap-3">
            <div className="flex-shrink-0">
              <FdicLogo />
            </div>
            <p className="text-sm text-[hsl(var(--bank-navy))]">
              FDIC-insured - Backed by the full faith and credit of the U.S. Government
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto flex flex-col md:flex-row flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-6 ${sidebarOpen ? 'hidden' : 'block'} md:block min-h-0 flex flex-col overflow-y-auto`}>
          {children}
        </main>
      </div>
    </div>
  );
}
