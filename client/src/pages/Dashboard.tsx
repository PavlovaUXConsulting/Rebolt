import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div>
      {/* Send Money Instantly Banner */}
      <div className="mb-6 bg-[#1A2445] text-white rounded-2xl p-4 md:p-6 relative">
        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between gap-3">
          {/* Left: Text Content */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-tight">
              Send<br />Money<br />Instantly
            </h2>
          </div>
          
          {/* Right: Icon and Button stacked */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex-shrink-0" style={{width: "80px", height: "64px"}}>
              <img 
                src="/assets/money-send-icon.png" 
                alt="Send Money" 
                className="w-full h-full object-contain"
              />
            </div>
            
            <Link to="/send-money">
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl font-semibold px-6 py-4 text-sm">
                Send Now
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Desktop layout */}
        <div className="hidden md:flex items-center px-3 py-2">
          {/* Close (X) button in top-right corner */}
          <button className="absolute top-3 right-3 text-white opacity-70 hover:opacity-100" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div className="mr-3 flex-shrink-0 flex items-center" style={{width: "60px", height: "48px"}}>
            <img 
              src="/assets/money-send-icon.png" 
              alt="Send Money" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex-grow">
            <h2 className="text-xl font-bold">Send Money Instantly</h2>
            <p className="text-xs mt-1 text-gray-300">Transfer money to anyone using just their phone number or email.</p>
          </div>
          
          <div className="ml-3">
            <Link to="/send-money">
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-medium px-5 py-2 text-sm">
                Send Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[hsl(var(--bank-navy))] mb-6">Account Summary</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="bg-[hsl(var(--bank-gray))] shadow-sm">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Balance</h3>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-2xl font-bold text-[hsl(var(--bank-navy))]">$12,345</p>
            <p className="text-xs text-[hsl(var(--bank-danger))] mt-1">
              -2%
            </p>
          </CardContent>
        </Card>

        {/* Savings */}
        <Card className="bg-[hsl(var(--bank-gray))] shadow-sm">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-600">Savings</h3>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-2xl font-bold text-[hsl(var(--bank-navy))]">$5,678</p>
            <p className="text-xs text-[hsl(var(--bank-success))] mt-1">
              +1.5%
            </p>
          </CardContent>
        </Card>

        {/* Credit */}
        <Card className="bg-[hsl(var(--bank-gray))] shadow-sm">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-600">Credit</h3>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-2xl font-bold text-[hsl(var(--bank-navy))]">$3,210</p>
            <p className="text-xs text-[hsl(var(--bank-danger))] mt-1">
              +3%
            </p>
          </CardContent>
        </Card>

        {/* Investments */}
        <Card className="bg-[hsl(var(--bank-gray))] shadow-sm">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-600">Investments</h3>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-2xl font-bold text-[hsl(var(--bank-navy))]">$4,567</p>
            <p className="text-xs text-[hsl(var(--bank-success))] mt-1">
              +4%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
