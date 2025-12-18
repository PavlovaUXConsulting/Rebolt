import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, CreditCard, Wallet, LineChart } from "lucide-react";
import { PaymentMethod, Recipient } from "@/lib/types";
import { 
  CustomSelect as Select,
  CustomSelectContent as SelectContent,
  CustomSelectItem as SelectItem,
  CustomSelectTrigger as SelectTrigger,
  CustomSelectValue as SelectValue 
} from "@/components/CustomSelect";

// Import service logos
import PaypalLogo from "@assets/PayPal logo_1757091816590.png";
import ACHLogo from "@assets/ACH_1757091794153.png";
import VenmoLogo from "@assets/Venmo_1757091725271.png";

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

interface AmountStepProps {
  onSubmit: (amount: string, reference: string, account: string) => void;
  selectedMethod: PaymentMethod;
  selectedRecipient: Recipient;
  onBack: () => void;
  prefillAmount?: string;
  prefillReference?: string;
  prefillAccount?: string;
}

export default function AmountStep({ 
  onSubmit, 
  selectedMethod, 
  selectedRecipient,
  onBack, 
  prefillAmount = "",
  prefillReference = "",
  prefillAccount = "checking"
}: AmountStepProps) {
  const [amount, setAmount] = useState(prefillAmount);
  const [reference, setReference] = useState(prefillReference);
  const [note, setNote] = useState("");
  // Ensure we start with a valid account type that exists in our accounts object
  const [selectedAccount, setSelectedAccount] = useState(
    prefillAccount && ["checking", "savings", "credit", "investments"].includes(prefillAccount) 
    ? prefillAccount 
    : "checking"
  );
  const [inputFocused, setInputFocused] = useState(false);

  // Account data
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

  const handleContinue = () => {
    // Validate amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return;
    }
    
    // Format amount properly
    const formattedAmount = parseFloat(amount).toFixed(2);
    onSubmit(formattedAmount, reference, selectedAccount);
  };

  // Format input value with commas while typing
  const formatInputWithCommas = (value: string) => {
    // If there's a decimal point, format only the whole number part
    if (value.includes('.')) {
      const [wholePart, decimalPart] = value.split('.');
      if (wholePart === '') return '.' + decimalPart;
      
      // Format the whole part with commas
      const formattedWholePart = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0
      }).format(parseInt(wholePart));
      
      return `${formattedWholePart}.${decimalPart}`;
    } else {
      // No decimal point, format the entire number
      if (value === '') return '';
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0
      }).format(parseInt(value));
    }
  };
  
  // Format display value for amount input
  const getDisplayValue = () => {
    if (!amount) return "";
    
    // Parse the amount to properly format it
    const numAmount = parseFloat(amount);
    
    // Format with commas for thousands and ensure 2 decimal places
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  // Helper function to format account details for display
  const formatAccountDetails = (recipient: Recipient) => {
    if (selectedMethod === "ach") {
      const bankName = recipient.bankName || "Bank of America";
      const accountLast4 = recipient.accountNumber?.slice(-4) || "4284";
      const routingLast4 = recipient.routingNumber?.slice(-4) || "0358";
      return `${bankName}, Account ••${accountLast4} • Routing ••${routingLast4}`;
    }
    return selectedMethod === "paypal" ? "PayPal" : 
           selectedMethod === "venmo" ? "Venmo" : "Rebolt";
  };

  return (
    <div className="max-w-md mx-auto px-2 sm:px-0">
      {/* Add custom style for placeholder color */}
      <style>
        {`
          .amount-input::placeholder {
            color: #E0E5EB;
          }
        `}
      </style>
      
      {/* Destination Summary */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Sending to</label>
        <div className="border border-gray-200 rounded-md p-3 bg-white hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <Avatar className="h-8 w-8 mr-3">
                {(() => {
                  const avatarSrc = getAvatarImage(selectedRecipient.id);
                  return avatarSrc ? <AvatarImage src={avatarSrc} alt={selectedRecipient.name} /> : null;
                })()}
                <AvatarFallback className="bg-[hsl(var(--bank-navy))] text-white font-medium">
                  {selectedRecipient.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{selectedRecipient.name}</p>
                {selectedMethod === "ach" ? (
                  <div className="text-xs text-gray-400">
                    <div>{selectedRecipient.bankName || "Bank of America"}</div>
                    <div>Account ••{selectedRecipient.accountNumber?.slice(-4) || "4284"} • Routing ••{selectedRecipient.routingNumber?.slice(-4) || "0358"}</div>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-600">
                    {selectedMethod === "paypal" && (
                      <img src={PaypalLogo} alt="PayPal" className="h-2.5 w-2.5 mr-2" />
                    )}
                    {selectedMethod === "venmo" && (
                      <img src={VenmoLogo} alt="Venmo" className="h-2.5 w-2.5 mr-2" />
                    )}
                    <span>{formatAccountDetails(selectedRecipient)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="font-medium">
                {selectedMethod === "paypal" ? "PayPal" : 
                 selectedMethod === "venmo" ? "Venmo" : 
                 selectedMethod === "ach" ? "ACH" : 
                 "Rebolt"}
              </div>
              <div>
                {selectedMethod === "ach" ? "Delivery in 1-2 days" : "Delivery in seconds"}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">From your</label>
        <div className="relative">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-full border border-gray-200 rounded-md p-3 bg-white hover:bg-gray-50 h-[72px]">
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                  <span className="mr-3 text-gray-500">
                    {accounts[selectedAccount as keyof typeof accounts]?.icon || <Building className="h-6 w-6" />}
                  </span>
                  <div>
                    <p className="font-medium text-gray-700">
                      {accounts[selectedAccount as keyof typeof accounts]?.name || "Checking Account"}
                    </p>
                    <p className="text-xs text-gray-400">Available balance</p>
                  </div>
                </div>
                <div className="text-right min-w-[150px] pr-6">
                  <p className="font-medium">
                    ${accounts[selectedAccount as keyof typeof accounts]?.balance || "0.00"}
                  </p>
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(accounts).map(([key, account]) => (
                <SelectItem key={key} value={key} className="py-3 h-[72px]">
                  <div className="flex items-center w-full justify-between">
                    <div className="flex items-center">
                      <span className="mr-3 text-gray-500">
                        {account.icon}
                      </span>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-gray-400">Available balance</p>
                      </div>
                    </div>
                    <div className="text-right mr-8 min-w-[150px] pr-6">
                      <p className="font-medium">${account.balance}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Amount
        </label>
        <div className="text-center mb-4">
          <div className="relative inline-flex items-center justify-center">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              value={inputFocused ? (amount ? formatInputWithCommas(amount) : "") : (amount ? `$${getDisplayValue()}` : "$0.00")}
              onChange={(e) => {
                // Remove all non-numeric characters (except decimal points)
                // This includes removing existing commas from input
                const value = e.target.value.replace(/[^\d.]/g, '');
                
                // Ensure only one decimal point
                const parts = value.split('.');
                const formatted = parts.length > 1 
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : value;
                
                // Store raw value (without commas) in state
                setAmount(formatted);
              }}
              onFocus={() => {
                setInputFocused(true);
                // Clear the input field to show only the cursor
              }}
              onBlur={() => {
                setInputFocused(false);
                // Format on blur if there's a value
                if (amount && !isNaN(parseFloat(amount))) {
                  // Keep the value as is, the display function will handle formatting
                }
              }}
              className={`amount-input w-full text-3xl sm:text-5xl font-bold text-center border-0 focus:ring-0 focus:outline-none ${!amount ? 'text-[#E0E5EB]' : ''}`}
              autoComplete="off"
              spellCheck="false"
              data-form-type="other"
            />
          </div>
        </div>
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Reference (optional)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="block w-full"
            autoComplete="off"
            spellCheck="false"
            data-form-type="other"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Note
          </label>
          <textarea
            placeholder="Note for your records"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3 max-w-md mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border border-gray-300 bg-white text-[hsl(var(--bank-navy))] px-8 py-2 rounded-lg h-[48px] font-medium"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
          className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-2 rounded-lg h-[48px] font-medium"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
