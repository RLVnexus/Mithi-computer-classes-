import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export function CreatorCredit() {
  return (
    <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 mt-auto w-full">
      <div className="flex items-center space-x-4">
        <a 
          href="tel:6203646824" 
          title="Call Now"
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors"
        >
          <Phone size={18} />
        </a>
        <a 
          href="https://wa.me/916203646824" 
          target="_blank" 
          rel="noopener noreferrer"
          title="WhatsApp"
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/50 dark:hover:text-green-400 transition-colors"
        >
          <MessageCircle size={18} />
        </a>
        <a 
          href="https://instagram.com/lovevaidya" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Instagram"
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-pink-100 hover:text-pink-600 dark:hover:bg-pink-900/50 dark:hover:text-pink-400 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Made with <span className="text-red-500 animate-pulse inline-block">❤️</span> by RLV NEXUS
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
        Under the Love Vaidya Touchs
      </p>
    </div>
  );
}
