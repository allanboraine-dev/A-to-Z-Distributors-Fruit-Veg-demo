"use client";

import React, { useState } from 'react';
import { X, CreditCard, Lock, Loader2 } from 'lucide-react';

interface SimulatedYocoModalProps {
  amountInCents: number;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

export default function SimulatedYocoModal({ amountInCents, onSuccess, onCancel }: SimulatedYocoModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate network delay for payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess('tok_mock_test_' + Math.random().toString(36).substring(7));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing ? onCancel : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <CreditCard size={20} className="text-blue-600" />
            <span>Secure Payment</span>
          </div>
          <button 
            onClick={!isProcessing ? onCancel : undefined}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-sm text-slate-500 font-medium">A to Z Distributors</p>
            <h3 className="text-3xl font-bold text-slate-900">
              R{(amountInCents / 100).toFixed(2)}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Card Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  value="4111 1111 1111 1111" 
                  readOnly 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-800 font-medium tracking-widest focus:outline-none"
                />
                <CreditCard className="absolute right-3 top-3.5 text-slate-400" size={20} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Expiry</label>
                <input 
                  type="text" 
                  value="12/28" 
                  readOnly 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-800 font-medium focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">CVV</label>
                <input 
                  type="password" 
                  value="123" 
                  readOnly 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-800 font-medium focus:outline-none tracking-widest"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-80 shadow-lg shadow-blue-600/20"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock size={18} />
                Pay R{(amountInCents / 100).toFixed(2)}
              </>
            )}
          </button>
          
          <div className="text-center">
            <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              Test Mode
            </span>
            <p className="text-[11px] text-slate-400 font-medium mt-2">
              This is a simulated payment window for demonstration purposes. No real charges will be made.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
