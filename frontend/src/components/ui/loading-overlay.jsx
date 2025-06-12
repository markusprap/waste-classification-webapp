"use client";

import { Loader2 } from "lucide-react";

export function LoadingOverlay({ message, isVisible = true }) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center max-w-md mx-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-t-4 border-t-emerald-600 border-emerald-200 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-700 text-center font-medium">
          {message || "Processing..."}
        </p>
      </div>
    </div>
  );
}
