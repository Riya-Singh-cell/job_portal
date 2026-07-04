import React from 'react';
import { FiBriefcase } from 'react-icons/fi';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white dark:bg-slate-950 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
        <FiBriefcase className="text-white w-8 h-8" />
      </div>
      <div className="flex gap-1 justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingScreen;
