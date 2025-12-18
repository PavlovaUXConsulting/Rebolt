import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import RecipientStep from "./RecipientStep";
import MethodStep from "./MethodStep";
import AmountStep from "./AmountStep";
import ConfirmStep from "./ConfirmStep";
import SuccessStep from "./SuccessStep";
import TransactionHistory from "../TransactionHistory";
import SendMoneyHeader from "./SendMoneyHeader";
import { Recipient, PaymentMethod } from "@/lib/types";

// Type for repeat transaction event detail
interface RepeatTransactionDetail {
  name: string;
  amount: string;
  description: string;
  method?: string; // Optional payment method from transaction
}

export default function SendMoneyFlow() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionHistoryOpen, setTransactionHistoryOpen] = useState(false);
  
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [referenceNote, setReferenceNote] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("checking");
  const [confirmationId, setConfirmationId] = useState<string>("");
  
  // State for repeat transaction
  const [prefillAmount, setPrefillAmount] = useState<string>("");
  const [prefillReference, setPrefillReference] = useState<string>("");
  const [prefillAccount, setPrefillAccount] = useState<string>("checking");
  const [isRepeatTransaction, setIsRepeatTransaction] = useState<boolean>(false);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setLocation("/");
    }
  };

  const handleContinue = () => {
    setCurrentStep(currentStep + 1);
  };
  
  // Prevent browser back button after payment confirmation (step 5)
  useEffect(() => {
    // Function to handle browser history navigation
    const handlePopState = () => {
      // If we're at the success step, prevent going back to the confirmation step
      if (currentStep === 5) {
        // Push a new state to replace the one that was popped
        window.history.pushState(null, "", window.location.pathname);
        // Alternative: go to step 1 instead of staying at step 5
        // setCurrentStep(1);
      }
    };

    // When the component mounts or currentStep changes
    if (currentStep === 5) {
      // Add a new history entry to make the back button work correctly
      window.history.pushState(null, "", window.location.pathname);
      // Listen for popstate events (browser back/forward button)
      window.addEventListener("popstate", handlePopState);
    }

    // Cleanup function
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentStep]);

  // Listen for repeat transaction events
  useEffect(() => {
    const handleRepeatTransaction = (event: CustomEvent<RepeatTransactionDetail>) => {
      // Get transaction data from the event
      const { name, amount, description, method } = event.detail;
      
      // Find the recipient based on name
      const findRecipientByName = async () => {
        try {
          // Normally we'd fetch from API, but for this demo we'll simulate finding a recipient
          // In a real app, you might want to do this server-side or fetch the actual recipient
          const recipientResponse = await fetch('/api/users/1/recipients');
          const recipients = await recipientResponse.json();
          
          // Find recipient with matching name
          const recipient = recipients.find((r: Recipient) => r.name === name);
          
          if (recipient) {
            // Set selected recipient
            setSelectedRecipient(recipient);
            
            // Use the actual transaction method if provided, otherwise fall back to recipient service
            const paymentMethod = (method as PaymentMethod) || (recipient.service as PaymentMethod) || "paypal";
            setSelectedMethod(paymentMethod);
            
            // Set prefill data
            setPrefillAmount(amount);
            setPrefillReference(description);
            setIsRepeatTransaction(true);
            
            // Move to the amount step directly (step 3)
            setCurrentStep(3);
          }
        } catch (error) {
          console.error("Error finding recipient:", error);
        }
      };
      
      findRecipientByName();
    };
    
    // Add event listeners
    // Event listener for opening transaction history from add recipient form
    const handleOpenTransactionHistory = () => {
      setTransactionHistoryOpen(true);
    };
    
    // Event listener for resetting the transaction flow back to step 1 (Recipient)
    const handleResetTransactionFlow = () => {
      // Reset all state
      setCurrentStep(1);
      setSelectedRecipient(null);
      setSelectedMethod(null);
      setTransferAmount('');
      setReferenceNote('');
      setSelectedAccount('');
      setPrefillAmount('');
      setPrefillReference('');
      setPrefillAccount('');
      setIsRepeatTransaction(false);
    };
    
    window.addEventListener('repeat-transaction', handleRepeatTransaction as EventListener);
    window.addEventListener('open-transaction-history', handleOpenTransactionHistory as EventListener);
    window.addEventListener('reset-transaction-flow', handleResetTransactionFlow as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('repeat-transaction', handleRepeatTransaction as EventListener);
      window.removeEventListener('open-transaction-history', handleOpenTransactionHistory as EventListener);
      window.removeEventListener('reset-transaction-flow', handleResetTransactionFlow as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* New Header with Logo, Progress Indicator, Transaction History and Close buttons */}
      <SendMoneyHeader 
        currentStep={currentStep} 
        onOpenTransactionHistory={() => setTransactionHistoryOpen(true)}
      />

      <div className="flex-1 min-w-[300px] min-h-0 mt-[50px]">

        {/* Step 1: Recipient */}
        {currentStep === 1 && (
          <RecipientStep
            onSelectRecipient={(recipient) => {
              setSelectedRecipient(recipient);
              handleContinue();
            }}
          />
        )}

        {/* Step 2: Method */}
        {currentStep === 2 && selectedRecipient && (
          <MethodStep
            recipient={selectedRecipient}
            onSelectMethod={(method) => {
              setSelectedMethod(method);
              handleContinue();
            }}
            onBack={handleBack}
            onUpdateRecipient={(updatedRecipient) => {
              setSelectedRecipient(updatedRecipient);
            }}
          />
        )}

        {/* Step 3: Amount */}
        {currentStep === 3 && selectedRecipient && selectedMethod && (
          <AmountStep
            onSubmit={(amount, reference, account) => {
              setTransferAmount(amount);
              setReferenceNote(reference);
              setSelectedAccount(account);
              handleContinue();
            }}
            selectedMethod={selectedMethod}
            selectedRecipient={selectedRecipient}
            onBack={handleBack}
            prefillAmount={prefillAmount}
            prefillReference={prefillReference}
            prefillAccount={prefillAccount}
          />
        )}

        {/* Step 4: Confirm */}
        {currentStep === 4 && selectedRecipient && selectedMethod && transferAmount && (
          <ConfirmStep
            recipient={selectedRecipient}
            method={selectedMethod}
            amount={transferAmount}
            reference={referenceNote}
            account={selectedAccount}
            onConfirm={(confId) => {
              setConfirmationId(confId);
              handleContinue();
            }}
            onBack={handleBack}
          />
        )}

        {/* Step 5: Success */}
        {currentStep === 5 && selectedRecipient && selectedMethod && transferAmount && (
          <SuccessStep
            recipient={selectedRecipient}
            amount={transferAmount}
            method={selectedMethod}
            confirmationId={confirmationId}
            onSendMore={() => setCurrentStep(1)}
            onViewHistory={() => setTransactionHistoryOpen(true)}
          />
        )}

        {/* Transaction History Modal */}
        <TransactionHistory
          open={transactionHistoryOpen}
          onOpenChange={setTransactionHistoryOpen}
        />
      </div>
    </div>
  );
}