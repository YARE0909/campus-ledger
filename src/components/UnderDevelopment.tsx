'use client';

import React from 'react';
import { HardHat } from 'lucide-react';

export default function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
      {/* Icon with background effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50"></div>
        <div className="relative bg-white rounded-full p-6 shadow-lg border border-gray-200">
          <HardHat className="w-16 h-16 text-indigo-600" />
        </div>
      </div>
      
      {/* Text */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Under Construction</h2>
        <p className="text-gray-500 text-sm">Coming Soon</p>
      </div>
    </div>
  );
}
