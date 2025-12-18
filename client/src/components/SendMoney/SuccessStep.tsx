import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";
import { Recipient, PaymentMethod } from "@/lib/types";

interface SuccessStepProps {
  recipient: Recipient;
  amount: string;
  method: PaymentMethod;
  confirmationId: string;
  onSendMore: () => void;
  onViewHistory: () => void;
}

export default function SuccessStep({
  recipient,
  amount,
  method,
  confirmationId,
  onSendMore,
  onViewHistory,
}: SuccessStepProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });


  return (
    <div className="max-w-md mx-auto px-2 sm:px-0">
      {/* Main success card */}
      <div className="bg-gray-100 rounded-2xl p-4 sm:p-6 text-center mb-6">
        {/* Green checkmark icon */}
        <div className="flex justify-center mb-3">
          <div className="bg-green-500 rounded-full p-2 sm:p-3">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">You've sent</h2>
          <h3 className="text-lg sm:text-xl font-medium text-gray-700">to {recipient.name}</h3>
        </div>
        
        {/* Large amount display */}
        <div className="mb-6 sm:mb-8">
          <span className="text-4xl sm:text-6xl font-bold text-gray-900 leading-none">
            ${new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(parseFloat(amount))}
          </span>
        </div>

        <div className="space-y-4">
          {/* Primary action button */}
          <Button
            onClick={onSendMore}
            className="w-4/5 bg-[#4F46E5] hover:bg-[#4338CA] text-white h-12 rounded-xl font-medium text-base"
          >
            Send More Money
          </Button>
          
          {/* Secondary action button */}
          <Button
            onClick={onViewHistory}
            variant="outline" 
            className="w-4/5 bg-white border-gray-300 text-gray-700 h-12 rounded-xl font-medium hover:bg-gray-50 text-base"
          >
            Go to Transaction History
          </Button>
        </div>
      </div>

      {/* Transaction details section */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900 text-sm">Confirmation ID: {confirmationId}</p>
            <p className="text-xs text-gray-600">Transaction Date: {currentDate}</p>
          </div>
          <div className="flex items-center space-x-1.5 text-gray-400 text-xs cursor-pointer hover:text-gray-600">
            <Download className="h-3 w-3" />
            <span>Download Receipt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
