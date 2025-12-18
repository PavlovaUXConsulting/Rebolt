import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Home, Camera, CreditCard, Building2, FileText, Plus, ChevronRight } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [paymentSubmenuOpen, setPaymentSubmenuOpen] = useState(location.includes("send-money"));

  return (
    <aside
      className={`w-full md:w-64 border-r border-[hsl(var(--bank-border))] bg-white ${
        isOpen ? "block" : "hidden md:block"
      }`}
    >
      <nav className="py-4 md:py-6 px-2">
        <ul>
          <li>
            <button
              onClick={() => {
                window.location.href = '/';
                onClose();
              }}
              className={`flex items-center justify-between w-full px-4 py-3 text-left rounded ${
                location === "/"
                  ? "bg-[hsl(var(--bank-navy))] text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                <Home className={`h-5 w-5 mr-3 ${location === "/" ? "text-white" : "text-gray-500"}`} />
                Dashboard
              </div>
              {location !== "/" && <ChevronRight className="h-5 w-5 text-gray-400" />}
            </button>
          </li>
          <li>
            <button
              onClick={onClose}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-100 rounded"
            >
              <div className="flex items-center">
                <Camera className="h-5 w-5 mr-3 text-gray-500" />
                Remote Deposit Capture
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </li>
          <li>
            <button
              onClick={() => setPaymentSubmenuOpen(!paymentSubmenuOpen)}
              className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-100 rounded ${
                location.includes("send-money") || paymentSubmenuOpen
                  ? "bg-[hsl(var(--bank-navy))] text-white"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-3 text-gray-500" />
                Payment & Transfers
              </div>
              {!paymentSubmenuOpen ? <ChevronRight className="h-5 w-5 text-gray-400" /> :
              <ChevronDown
                className={`h-4 w-4 ${paymentSubmenuOpen ? "transform rotate-180" : ""}`}
              />}
            </button>
            {/* Payment Submenu */}
            {paymentSubmenuOpen && (
              <ul className="mt-1 bg-gray-50 pl-[55px]">
                <li>
                  <button
                    onClick={() => {
                      window.location.href = '/send-money';
                      onClose();
                    }}
                    className={`flex items-center w-full px-0 py-2 text-left text-sm hover:bg-gray-100 ${
                      location.includes("send-money") ? "text-blue-600 font-medium" : "text-gray-600"
                    }`}
                  >
                    Send Money
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full px-0 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                    Tax Payment
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full px-0 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                    Recipients
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full px-0 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                    ACH Pass-Thru
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full px-0 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                    Business Bill Pay
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full px-0 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                    Loan Payment
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full px-0 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                    Payments Hub
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full px-0 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                    Transfer Funds
                  </button>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button
              onClick={onClose}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-100 rounded"
            >
              <div className="flex items-center">
                <Building2 className="h-5 w-5 mr-3 text-gray-500" />
                Manage company
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </li>
          <li>
            <button
              onClick={onClose}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-100 rounded"
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-gray-500" />
                Debit cards
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </li>
          <li>
            <button
              onClick={onClose}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-100 rounded"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-3 text-gray-500" />
                Account Maintenance
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </li>
          <li>
            <button
              onClick={onClose}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-100 rounded"
            >
              <div className="flex items-center">
                <Plus className="h-5 w-5 mr-3 text-gray-500" />
                Apply & Enroll
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
