import React from "react";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
}

interface StepProps {
  step: number;
  currentStep: number;
  label: string;
}

function Step({ step, currentStep, label }: StepProps) {
  // Different states based on the stepper design
  const isCompleted = currentStep > step;
  const isActive = currentStep === step;
  const isPending = currentStep < step;
  const isSuccess = currentStep > 4; // All steps successful when flow is complete

  return (
    <div className="flex-1 text-center relative">
      <span
        className={`h-6 w-6 rounded-full flex items-center justify-center mx-auto
          ${isCompleted ? "bg-[hsl(var(--bank-success))] text-white" : ""}
          ${isActive ? "bg-white border border-gray-200" : ""}
          ${isPending && !isSuccess ? "bg-white border border-gray-200" : ""}
          ${isSuccess ? "bg-[hsl(var(--bank-success))] text-white" : ""}
          transition-all duration-200
        `}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" /> // Check mark for completed steps
        ) : isActive ? (
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--bank-success))]"></div> // Small green dot in middle of white circle
        ) : (
          <span className="sr-only">{step}</span> // Empty for pending steps
        )}
      </span>
      <p className="text-xs mt-1 text-center text-gray-600 font-medium">{label}</p>
    </div>
  );
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  // Calculate completion percentage for the progress bar
  // For 4 steps, each completed step represents 33.33% progress (except the last one which is 100%)
  const progressPercentage = 
    currentStep === 1 ? 0 : 
    currentStep === 2 ? 33.33 : 
    currentStep === 3 ? 66.66 : 
    currentStep >= 4 ? 100 : 0;

  // If user has completed all steps (success state)
  const allCompleted = currentStep > 4;

  return (
    <div className="relative max-w-3xl mx-auto px-2">
      <div className="flex justify-between items-center mb-1 relative z-10">
        <Step step={1} currentStep={currentStep} label="Recipient" />
        <Step step={2} currentStep={currentStep} label="Method" />
        <Step step={3} currentStep={currentStep} label="Amount" />
        <Step step={4} currentStep={currentStep} label="Confirm" />
      </div>

      {/* Connecting Lines */}
      <div className="absolute top-0 left-0 right-0 -z-10">
        {/* Line from 1st to 2nd circle */}
        <div 
          className={`absolute h-0.5 top-[14px] left-[14%] w-[22%] ${
            currentStep >= 2 ? "bg-[hsl(var(--bank-success))]" : "bg-gray-200"
          } transition-all duration-300`}
        ></div>
        
        {/* Line from 2nd to 3rd circle */}
        <div 
          className={`absolute h-0.5 top-[14px] left-[39%] w-[22%] ${
            currentStep >= 3 ? "bg-[hsl(var(--bank-success))]" : "bg-gray-200"
          } transition-all duration-300`}
        ></div>
        
        {/* Line from 3rd to 4th circle */}
        <div 
          className={`absolute h-0.5 top-[14px] left-[64%] w-[22%] ${
            currentStep >= 4 ? "bg-[hsl(var(--bank-success))]" : "bg-gray-200"
          } transition-all duration-300`}
        ></div>
      </div>
    </div>
  );
}