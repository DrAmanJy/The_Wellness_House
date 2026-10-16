'use client';

import React from 'react';
import { motion, LayoutGroup } from 'motion/react';
import { Check } from 'lucide-react';

export interface SelectionOption {
  id: string;
  label: string;
  subtitle?: string;
  badge?: string;
}

interface AnimatedSelectionProps {
  options: SelectionOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const AnimatedSelection: React.FC<AnimatedSelectionProps> = ({
  options,
  selectedId,
  onSelect,
  className = '',
}) => {
  return (
    <LayoutGroup id="animated-selection">
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`relative p-3.5 rounded-xl text-left border transition-colors duration-200 flex items-center justify-between gap-3 ${
                isSelected
                  ? 'border-[#30473B] bg-[#FAF7F2]'
                  : 'border-[#30473B]/15 bg-[#FFFEFA] hover:border-[#30473B]/30'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="selection-ring"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 rounded-xl border-2 border-[#30473B] pointer-events-none"
                />
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm font-medium text-[#252A25]">
                    {option.label}
                  </span>
                  {option.badge && (
                    <span className="text-[9px] font-mono uppercase bg-[#C58B71]/15 text-[#C58B71] px-1.5 py-0.5 rounded-sm">
                      {option.badge}
                    </span>
                  )}
                </div>
                {option.subtitle && (
                  <p className="text-xs text-[#71776F]">{option.subtitle}</p>
                )}
              </div>

              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'border-[#30473B] bg-[#30473B] text-white'
                    : 'border-[#30473B]/30'
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5" />}
              </div>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
};
