import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building2, Edit, Grid3X3 } from "lucide-react";
import {
  CustomSelect as Select,
  CustomSelectContent as SelectContent,
  CustomSelectItem as SelectItem,
  CustomSelectTrigger as SelectTrigger,
  CustomSelectValue as SelectValue,
} from "@/components/CustomSelect";
import { Recipient, PaymentMethod } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface MethodStepProps {
  recipient: Recipient;
  onSelectMethod: (method: PaymentMethod) => void;
  onBack: () => void;
  onUpdateRecipient?: (updatedRecipient: Recipient) => void;
}

export default function MethodStep({ recipient, onSelectMethod, onBack, onUpdateRecipient }: MethodStepProps) {
  const { toast } = useToast();
  
  // Always default to ACH
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>("ach");
  const [transferReason, setTransferReason] = useState("Gift");
  const [isSaving, setIsSaving] = useState(false);
  
  // Bank details state for ACH
  const [bankDetails, setBankDetails] = useState({
    accountType: recipient.accountType || "personal",
    bankAccountType: "checking", // checking or savings
    routingNumber: recipient.routingNumber || "",
    accountNumber: recipient.accountNumber || "",
    bankName: recipient.bankName || ""
  });
  
  // Bank routing number to bank name mapping
  const routingToBankMap: { [key: string]: string } = {
    "121000248": "WELLS FARGO BANK",
    "026009593": "BANK OF AMERICA, N.A.",
    "121042882": "WELLS FARGO BANK",
    "054001204": "BANK OF AMERICA, N.A.",
    "011401533": "CHASE BANK",
    "021000021": "CHASE BANK",
    "022000248": "CITIBANK",
    "021001208": "BANK OF NEW YORK MELLON",
    "031176110": "REGIONS BANK",
    "053000196": "FIFTH THIRD BANK",
    "084000026": "CITIZENS BANK",
    "111000025": "WELLS FARGO BANK",
    "122000247": "WELLS FARGO BANK",
    "044000037": "PNC BANK",
    "031100157": "SUNTRUST BANK",
    "063104668": "REGIONS BANK",
    "074908594": "CHASE BANK",
    "114924742": "COMPASS BANK",
    "325081403": "CAPITAL ONE",
    "031201360": "REGIONS BANK"
  };
  
  // Function to get bank name from routing number
  const getBankNameFromRouting = (routingNumber: string): string => {
    if (routingNumber.length === 9) {
      return routingToBankMap[routingNumber] || "";
    }
    return "";
  };
  
  // Get current bank name based on routing number
  const currentBankName = getBankNameFromRouting(bankDetails.routingNumber);
  
  // Check if recipient has existing bank details
  const hasExistingBankDetails = recipient.routingNumber && recipient.accountNumber;

  const saveBankDetailsIfNeeded = async () => {
    // Only save if ACH is selected and we have bank details to save
    if (selectedMethod === "ach" && bankDetails.routingNumber && bankDetails.accountNumber) {
      // Normalize values for comparison (handle null vs empty string)
      const normalize = (val: string | null | undefined) => val || "";
      
      // Only save if the bank details are different from what's already stored
      const hasChanges = 
        normalize(bankDetails.bankName) !== normalize(recipient.bankName) ||
        normalize(bankDetails.routingNumber) !== normalize(recipient.routingNumber) ||
        normalize(bankDetails.accountNumber) !== normalize(recipient.accountNumber) ||
        normalize(bankDetails.accountType) !== normalize(recipient.accountType);
      
      console.log("Bank details comparison:", {
        current: {
          bankName: normalize(recipient.bankName),
          routingNumber: normalize(recipient.routingNumber),
          accountNumber: normalize(recipient.accountNumber),
          accountType: normalize(recipient.accountType)
        },
        new: {
          bankName: normalize(bankDetails.bankName),
          routingNumber: normalize(bankDetails.routingNumber),
          accountNumber: normalize(bankDetails.accountNumber),
          accountType: normalize(bankDetails.accountType)
        },
        hasChanges
      });
      
      if (hasChanges) {
        try {
          setIsSaving(true);
          
          // Use detected bank name or empty string if not detected
          const finalBankName = bankDetails.bankName || "";
          
          const response = await apiRequest(
            "PUT",
            `/api/recipients/${recipient.id}`,
            {
              bankName: finalBankName,
              routingNumber: bankDetails.routingNumber,
              accountNumber: bankDetails.accountNumber,
              accountType: bankDetails.accountType,
              bankAccountType: bankDetails.bankAccountType,
              service: "ach" // Update service to ACH when bank details are saved
            }
          );
          
          console.log("Bank details saved successfully", response);
          
          // Invalidate recipients cache to ensure fresh data on next load
          queryClient.invalidateQueries({ queryKey: ['/api/users/1/recipients'] });
          
          // Update the recipient in the parent component with the new bank details
          if (onUpdateRecipient && response) {
            const updatedRecipient = {
              ...recipient,
              bankName: finalBankName,
              routingNumber: bankDetails.routingNumber,
              accountNumber: bankDetails.accountNumber,
              accountType: bankDetails.accountType,
              service: "ach" as PaymentMethod
            };
            onUpdateRecipient(updatedRecipient);
          }
        } catch (error) {
          console.error("Failed to save bank details:", error);
          toast({
            title: "Failed to save bank details",
            description: "Bank details could not be saved. Please try again.",
            variant: "destructive",
          });
          return false;
        } finally {
          setIsSaving(false);
        }
      }
    }
    return true;
  };

  const handleContinue = async () => {
    if (selectedMethod) {
      const saved = await saveBankDetailsIfNeeded();
      if (saved) {
        onSelectMethod(selectedMethod);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">To</label>
        <div className="flex items-center border border-gray-200 rounded-md p-3 bg-white hover:bg-gray-50 h-[72px]">
          <Avatar className="h-8 w-8 mr-3">
            {(() => {
              const avatarSrc = getAvatarImage(recipient.id);
              return avatarSrc ? <AvatarImage src={avatarSrc} alt={recipient.name} /> : null;
            })()}
            <AvatarFallback className="bg-[hsl(var(--bank-navy))] text-white font-medium">
              {recipient.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-[hsl(var(--bank-navy))]">{recipient.name}</p>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            {recipient.service === "paypal" && (
              <img src={PaypalLogo} alt="PayPal" className="h-2.5 w-2.5 mr-2" />
            )}
            {recipient.service === "venmo" && (
              <img src={VenmoLogo} alt="Venmo" className="h-2.5 w-2.5 mr-2" />
            )}
            <span className="font-mono">{recipient.username}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xl font-semibold text-gray-900 mb-4">Using</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedMethod("ach")}
            className={`flex items-center border-2 rounded-lg p-4 bg-white transition-colors ${
              selectedMethod === "ach"
                ? "border-[#4F46E5]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center w-full">
              <img src={ACHLogo} alt="ACH" className="h-12 w-12 flex-shrink-0" />
              <div className="w-px h-16 bg-gray-200 mx-4 flex-shrink-0"></div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-gray-900 font-semibold text-lg">ACH</span>
                <span className="text-gray-500 text-sm mt-0.5">{hasExistingBankDetails ? "1 day" : "1-2 days"}</span>
                <span className="text-gray-500 text-sm">{hasExistingBankDetails ? "No Fee" : "$1.99"}</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedMethod("paypal")}
            className={`flex items-center border-2 rounded-lg p-4 bg-white transition-colors ${
              selectedMethod === "paypal"
                ? "border-[#4F46E5]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center w-full">
              <img src={PaypalLogo} alt="PayPal" className="h-12 w-auto flex-shrink-0 object-contain" />
              <div className="w-px h-16 bg-gray-200 mx-4 flex-shrink-0"></div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-gray-900 font-semibold text-lg">PayPal</span>
                <span className="text-gray-500 text-sm mt-0.5">Instant</span>
                <span className="text-gray-500 text-sm">$0.20</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedMethod("venmo")}
            className={`flex items-center border-2 rounded-lg p-4 bg-white transition-colors ${
              selectedMethod === "venmo"
                ? "border-[#4F46E5]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center w-full">
              <img src={VenmoLogo} alt="Venmo" className="h-12 w-12 flex-shrink-0" />
              <div className="w-px h-16 bg-gray-200 mx-4 flex-shrink-0"></div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-gray-900 font-semibold text-lg">Venmo</span>
                <span className="text-gray-500 text-sm mt-0.5">Instant</span>
                <span className="text-gray-500 text-sm">$0.20</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Bank Details Section - Only show when ACH is selected */}
      {selectedMethod === "ach" && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recipient Bank Details</h3>
          
          {hasExistingBankDetails ? (
            // Display existing bank details
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {recipient.bankName || "BANK OF AMERICA, N.A."}
                  </p>
                  <p className="text-sm text-gray-600">
                    Account ••{recipient.accountNumber?.slice(-4)} • Routing ••{recipient.routingNumber?.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Input form for new bank details
            <div className="space-y-4">

              {/* Routing Number */}
              <div>
                <Label htmlFor="routing" className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </Label>
                <div className="relative">
                  <Input
                    id="routing"
                    placeholder="9-digit number"
                    value={bankDetails.routingNumber}
                    onChange={(e) => {
                      const newRoutingNumber = e.target.value;
                      const detectedBankName = getBankNameFromRouting(newRoutingNumber);
                      setBankDetails(prev => ({ 
                        ...prev, 
                        routingNumber: newRoutingNumber,
                        bankName: detectedBankName
                      }));
                    }}
                    className="bg-gray-50 border border-gray-200 w-full pr-4"
                    maxLength={9}
                  />
                  {currentBankName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{currentBankName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <Label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </Label>
                <Input
                  id="account"
                  placeholder="4-17 characters"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="bg-gray-50 border border-gray-200 w-full"
                  maxLength={17}
                />
              </div>

              {/* Account Type Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Account Type
                  </Label>
                  <RadioGroup 
                    value={bankDetails.accountType} 
                    onValueChange={(value: "personal" | "business") => 
                      setBankDetails(prev => ({ ...prev, accountType: value }))
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="personal" id="personal" data-testid="radio-personal" />
                      <Label htmlFor="personal" className="text-sm font-medium">Personal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business" id="business" data-testid="radio-business" />
                      <Label htmlFor="business" className="text-sm font-medium">Business</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Select value={bankDetails.bankAccountType} onValueChange={(value: "checking" | "savings") => 
                  setBankDetails(prev => ({ ...prev, bankAccountType: value }))
                }>
                  <SelectTrigger id="bankAccountType" className="w-full border border-gray-200 rounded-md p-3 bg-white hover:bg-gray-50 h-[40px]" data-testid="select-account-type">
                    <p className="font-medium text-gray-700">
                      {bankDetails.bankAccountType === "checking" ? "Checking" : "Savings"}
                    </p>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking" className="py-0 h-[40px]">
                      <p className="font-medium">Checking</p>
                    </SelectItem>
                    <SelectItem value="savings" className="py-0 h-[40px]">
                      <p className="font-medium">Savings</p>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Transfer Reason Section - Only show for PayPal and Venmo */}
      {(selectedMethod === "paypal" || selectedMethod === "venmo") && (
        <div className="mb-6">
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            What's the reason for your transfer?
          </label>
          <Select value={transferReason} onValueChange={setTransferReason}>
            <SelectTrigger id="reason" className="w-full border border-gray-200 rounded-md p-3 bg-white hover:bg-gray-50 h-[40px]">
  <p className="font-medium text-gray-700">{transferReason}</p>
            </SelectTrigger>
            <SelectContent>
              {["Gift", "Payment for goods", "Payment for services", "Reimbursement", "Other"].map((reason) => (
                <SelectItem key={reason} value={reason} className="py-0 h-[40px]">
                  <p className="font-medium">{reason}</p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border border-gray-300 bg-white text-[hsl(var(--bank-navy))] px-8 py-2 rounded-lg h-[48px] font-medium"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedMethod || isSaving}
          className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-2 rounded-lg h-[48px] font-medium"
        >
          {isSaving ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  );
}
