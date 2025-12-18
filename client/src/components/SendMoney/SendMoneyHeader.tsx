import React, { useState, useRef, useEffect } from "react";
import { X, Menu, History, Users, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import Logo from "@/components/Logo";
import ProgressIndicator from "./ProgressIndicator";

interface SendMoneyHeaderProps {
  currentStep: number;
  onOpenTransactionHistory: () => void;
}

export default function SendMoneyHeader({ 
  currentStep, 
  onOpenTransactionHistory 
}: SendMoneyHeaderProps) {
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setLocation("/");
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    setLocation("/");
  };

  const handleManageRecipients = () => {
    setLocation("/manage-recipients");
    setIsMenuOpen(false);
  };

  const handleTransactionHistory = () => {
    onOpenTransactionHistory();
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="border-b border-gray-200">
      {/* Top Row: Logo, Menu, and Close */}
      <div className="flex items-center justify-between px-4 py-3 sm:py-4">
        {/* Logo */}
        <div className="flex-none">
          <Logo className="h-6 sm:h-8" />
        </div>

        {/* Menu and Close buttons */}
        <div className="flex items-center space-x-4 relative">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </button>
            
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleTransactionHistory}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <History className="h-5 w-5" />
                  <span className="font-medium">Transaction History</span>
                </button>
                <button
                  onClick={handleManageRecipients}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Manage Recipients</span>
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Log out</span>
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="p-0.5"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Progress Bar Row - Full width */}
      <div className="pb-3 sm:pb-4">
        <ProgressIndicator currentStep={currentStep} />
      </div>
    </div>
  );
}
