import React from 'react';

export function Loader() {
  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-[9999] flex flex-col items-center justify-center transition-colors duration-300">
      <div className="relative flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white animate-pulse text-center">
          MITHI<br/><span className="text-blue-600 dark:text-blue-400">COMPUTER CLASSES</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-2 animate-pulse">
          Loading Data...
        </p>
      </div>
    </div>
  );
}
