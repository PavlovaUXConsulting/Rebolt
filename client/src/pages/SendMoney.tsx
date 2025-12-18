import React from "react";
import SendMoneyFlow from "@/components/SendMoney/SendMoneyFlow";

export default function SendMoney() {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <SendMoneyFlow />
      </div>
    </div>
  );
}
