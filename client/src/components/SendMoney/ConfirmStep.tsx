import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Wallet, CreditCard, LineChart, Building2, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Recipient, PaymentMethod } from "@/lib/types";

// Import service logos
import PaypalLogo from "@assets/PayPal_1757085818386.png";
import ReboltLogo from "@assets/Rebolt logo.png";
import VenmoLogo from "@assets/Venmo_1757091725271.png";

// Import security badge logos
import ChesapeakeLogo from "@assets/chesapeake-bank-logo.png";
import SecurePaymentLogo from "@assets/Sequier Payment_1757085818386.png";
import PayPalSecurityLogo from "@assets/PayPal_1757085818386.png";

// Import avatar images
import Avatar1 from "@assets/Avatar.png";
import Avatar2 from "@assets/Avatar-2.png";
import Avatar3 from "@assets/Avatar-3.png";
import Avatar4 from "@assets/Avatar-4.png";
import Avatar5 from "@assets/Avatar-5.png";
import Avatar6 from "@assets/Avatar-6.png";
import Avatar7 from "@assets/Avatar-7.png";
import Avatar8 from "@assets/Avatar-8.png";
import Avatar9 from "@assets/Avatar-9.png";
import Avatar10 from "@assets/Avatar-10.png";

// Helper function to get avatar image based on recipient ID
const getAvatarImage = (id: string) => {
  // Convert id to number and use modulo to assign images in a consistent way
  const idNum = parseInt(id);
  
  // Show avatars for only 30% of recipients (if idNum % 10 is less than 3)
  // For the other 70%, return null to show initials instead
  if (idNum % 10 >= 3) return null;
  
  // Map numbers to corresponding avatar images
  switch (idNum % 10) {
    case 0: return Avatar1;
    case 1: return Avatar5;
    case 2: return Avatar9;
    default: return null; // This will show initials
  }
};

interface ConfirmStepProps {
  recipient: Recipient;
  method: PaymentMethod;
  amount: string;
  reference?: string;
  account?: string;
  onConfirm: (confirmationId: string) => void;
  onBack: () => void;
}

export default function ConfirmStep({
  recipient,
  method,
  amount,
  reference = "",
  account = "checking",
  onConfirm,
  onBack,
}: ConfirmStepProps) {
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define fee and total amount - ACH has different fee structure
  const FEE_AMOUNT = method === "ach" ? (recipient.routingNumber && recipient.accountNumber ? 0 : 1.99) : 0.20;
  const totalAmount = parseFloat(amount) + FEE_AMOUNT;

  const handleConfirmPayment = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      // Convert amount to number
      const amountNum = parseFloat(amount);
      
      // Generate unique confirmation ID using timestamp + random number for uniqueness
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 digit random
      const confirmationId = `#HD${timestamp}${random}`;
      
      // Send payment data to the server
      await apiRequest("POST", "/api/transactions", {
        userId: 1, // Using default user ID (hardcoded for demo)
        recipientId: parseInt(recipient.id),
        recipientName: recipient.name,
        amount: amountNum,
        fee: FEE_AMOUNT,
        total: totalAmount,
        method: method,
        status: "pending",
        reference: reference,
        confirmationId: confirmationId,
      });
      onConfirm(confirmationId);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      console.error("Payment error:", error);
    }
  };

  // Account data mapping for display
  const accounts = {
    checking: {
      name: "Checking 0427",
      balance: "115,000.00",
      icon: <Building className="h-6 w-6" />
    },
    savings: {
      name: "Savings 8731",
      balance: "5,678.00",
      icon: <Wallet className="h-6 w-6" />
    },
    credit: {
      name: "Credit Card 4932",
      balance: "3,210.00",
      icon: <CreditCard className="h-6 w-6" />
    },
    investments: {
      name: "Investment 6712",
      balance: "4,567.00",
      icon: <LineChart className="h-6 w-6" />
    },
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Review Title */}
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 font-inter">Review</h1>
      
      {/* Main Payment Card */}
      <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
        {/* Amount Display */}
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-3xl sm:text-4xl font-bold text-gray-900">
            ${new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(parseFloat(amount))}
          </span>
        </div>

        {/* Recipient Details Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Recipient Details</h3>
          <div className="border border-gray-200 rounded-md p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <Avatar className="h-10 w-10 mr-3">
                  {(() => {
                    const avatarSrc = getAvatarImage(recipient.id);
                    return avatarSrc ? <AvatarImage src={avatarSrc} alt={recipient.name} /> : null;
                  })()}
                  <AvatarFallback className="bg-[hsl(var(--bank-navy))] text-white font-medium">
                    {recipient.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{recipient.name}</p>
                  <div className="text-xs text-gray-400">
                    <div>{recipient.bankName || "Bank of America"}</div>
                    <div>Account ••{recipient.accountNumber?.slice(-4) || "4284"} • Routing ••{recipient.routingNumber?.slice(-4) || "0358"}</div>
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="font-medium">
                  {method === "paypal" ? "PayPal" : 
                   method === "venmo" ? "Venmo" : 
                   method === "ach" ? "ACH" : 
                   "Rebolt"}
                </div>
                <div>
                  {method === "ach" ? "Delivery in 1-2 days" : "Delivery in seconds"}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Payment Details Section */}
        <div className="space-y-[30px]">
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">From your</span>
            <span className="font-medium text-gray-900 text-sm">
              {accounts[account as keyof typeof accounts]?.name || "Checking 0427"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Transaction Fee</span>
            <span className="font-medium text-gray-900 text-sm">${FEE_AMOUNT.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="font-medium text-gray-900 text-sm">Total Payable</span>
            <span className="font-bold text-gray-900 text-sm">
              ${new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(totalAmount)}
            </span>
          </div>
        </div>

        {/* Email Receipt Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-600">Email receipt to</span>
            <span className="font-medium text-gray-900">{recipient.username?.startsWith('@') ? `${recipient.username.slice(1)}@gmail.com` : recipient.username || "isabellas@gmail.com"}</span>
          </div>
        </div>

        {/* Authorization Checkbox */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="authorize"
              checked={isAuthorized}
              onCheckedChange={(checked) => setIsAuthorized(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="authorize" className="text-sm text-gray-600 leading-relaxed">
              I authorize ChesBank to initiate the transaction detailed above.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border border-gray-300 bg-white text-gray-700 h-12 rounded-lg font-medium"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={!isAuthorized || isSubmitting}
            className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white h-12 flex items-center justify-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            data-testid="button-send-payment"
          >
            <Lock className="h-4 w-4 mr-2" />
            {isSubmitting ? "Processing..." : "Send Payment"}
          </Button>
        </div>
      </div>

      {/* SSL Encryption Notice */}
      <div className="text-center text-sm text-gray-500">
        This is a secure <strong>SSL encrypted</strong> payment.
      </div>
    </div>
  );
}
