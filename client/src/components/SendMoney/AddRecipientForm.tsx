import React, { useState } from "react";
import { AlertCircle, ArrowLeft, X, User, Phone, Mail, Building, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

import { useToast } from "@/hooks/use-toast";
import { Recipient } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import SendMoneyHeader from "./SendMoneyHeader";

interface AddRecipientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery?: string;
  onSuccess: (recipient: Recipient) => void;
}

export default function AddRecipientForm({ 
  open, 
  onOpenChange, 
  searchQuery = "",
  onSuccess
}: AddRecipientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: searchQuery,
    email: "",
    phone: "",
    paymentMethod: "paypal" as "paypal" | "venmo" | "ach",
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "personal" as "personal" | "business"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when field is edited
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate bank details if ACH is selected
    if (formData.paymentMethod === "ach") {
      if (!formData.bankName.trim()) {
        newErrors.bankName = "Bank name is required for ACH transfers";
      }
      if (!formData.routingNumber.trim()) {
        newErrors.routingNumber = "Routing number is required";
      } else if (!/^\d{9}$/.test(formData.routingNumber)) {
        newErrors.routingNumber = "Routing number must be 9 digits";
      }
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = "Account number is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Sending recipient data:", {
        name: formData.name,
        username: formData.email,
        service: "paypal"
      });
      
      // Create the new recipient
      // Use the apiRequest helper instead of fetch directly
      // Note: apiRequest parameters are method, url, data in that order
      const recipientData = {
        name: formData.name,
        username: formData.email,
        service: formData.paymentMethod,
        // Include bank details only if ACH is selected
        ...(formData.paymentMethod === "ach" && {
          bankName: formData.bankName,
          routingNumber: formData.routingNumber,
          accountNumber: formData.accountNumber,
          accountType: formData.accountType
        })
      };
      
      const response = await apiRequest(
        "POST",
        "/api/users/1/recipients",
        recipientData
      );
      
      // Get JSON from response
      const newRecipient = await response.json() as Recipient;
      console.log("Recipient created successfully:", newRecipient);
      
      // Show success toast
      toast({
        title: "Recipient added",
        description: `${formData.name} has been added to your recipients.`,
        duration: 3000,
      });
      
      // Close the form and pass the new recipient back
      onOpenChange(false);
      onSuccess(newRecipient);
    } catch (error) {
      console.error("Failed to add recipient:", error);
      toast({
        title: "Failed to add recipient",
        description: "An error occurred while adding the recipient. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
      {/* SendMoneyHeader */}
      <SendMoneyHeader 
        currentStep={1} 
        onOpenTransactionHistory={() => {
          const event = new CustomEvent('open-transaction-history');
          window.dispatchEvent(event);
          onOpenChange(false);
        }}
      />
      
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        {/* Back button */}
        <div className="flex items-center mt-4 mb-4 max-w-md mx-auto w-full">
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm flex items-center text-gray-600 hover:text-[hsl(var(--bank-navy))]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
        
        {/* Content heading */}
        <h1 className="text-2xl font-bold text-left mb-6 max-w-md mx-auto w-full">Create a recipient</h1>
        
        <div className="w-full max-w-md mx-auto">
          {/* Card container */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="David Jhon"
                  className={`pl-10 bg-gray-50 border border-gray-200 h-12 w-full ${errors.name ? "focus:ring-red-500" : ""}`}
                  autoComplete="off"
                />
              </div>
              {errors.name && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.name}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="devid.info@gmail.com"
                  className={`pl-10 bg-gray-50 border border-gray-200 h-12 w-full ${errors.email ? "focus:ring-red-500" : ""}`}
                  autoComplete="off"
                />
              </div>
              {errors.email && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.email}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+990 3343 7865"
                  className="pl-10 bg-gray-50 border border-gray-200 h-12 w-full"
                  autoComplete="off"
                />
              </div>
            </div>

            
            <div className="pt-6">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white h-12 rounded-lg font-medium"
              >
                {isSubmitting ? "Adding..." : "Add New Recipient"}
              </Button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}