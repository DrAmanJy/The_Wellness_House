'use client';

import React from 'react';
import { motion, LayoutGroup } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className = '',
}) => {
  return (
    <LayoutGroup id="animated-tabs">
      <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors duration-200 z-10 ${
                isActive ? 'text-[#FAF7F2]' : 'text-[#252A25]/75 hover:text-[#252A25]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute inset-0 rounded-lg ${
                    variant === 'pill'
                      ? 'bg-[#30473B] shadow-xs -z-10'
                      : 'border-b-2 border-[#30473B] bg-transparent -z-10'
                  }`}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#30473B]/10 text-[#30473B]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
};
