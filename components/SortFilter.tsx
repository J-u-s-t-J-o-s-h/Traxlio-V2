'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Filter, ChevronDown, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

export type SortOption = {
  value: string;
  label: string;
};

export type FilterOption = {
  value: string;
  label: string;
};

interface SortFilterProps {
  sortOptions: SortOption[];
  filterOptions?: FilterOption[];
  currentSort: string;
  currentFilter?: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sort: string) => void;
  onDirectionChange: (direction: 'asc' | 'desc') => void;
  onFilterChange?: (filter: string) => void;
  className?: string;
}

export const SortFilter: React.FC<SortFilterProps> = ({
  sortOptions,
  filterOptions,
  currentSort,
  currentFilter,
  sortDirection,
  onSortChange,
  onDirectionChange,
  onFilterChange,
  className,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const currentSortLabel = sortOptions.find(o => o.value === currentSort)?.label || 'Sort';
  const currentFilterLabel = filterOptions?.find(o => o.value === currentFilter)?.label || 'All';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Sort Dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowSortMenu(!showSortMenu);
            setShowFilterMenu(false);
          }}
          className="min-w-[120px] justify-between"
        >
          <span className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            {currentSortLabel}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', showSortMenu && 'rotate-180')} />
        </Button>

        <AnimatePresence>
          {showSortMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden"
            >
              <div className="p-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
                      currentSort === option.value
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    {option.label}
                    {currentSort === option.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 p-1">
                <button
                  onClick={() => {
                    onDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
                    setShowSortMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
                  <span className="text-xs text-slate-500">
                    {sortDirection === 'asc' ? 'A → Z' : 'Z → A'}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Dropdown */}
      {filterOptions && filterOptions.length > 0 && onFilterChange && (
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowSortMenu(false);
            }}
            className="min-w-[100px] justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {currentFilterLabel}
            </span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', showFilterMenu && 'rotate-180')} />
          </Button>

          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 mt-2 w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden"
              >
                <div className="p-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onFilterChange(option.value);
                        setShowFilterMenu(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
                        currentFilter === option.value
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      )}
                    >
                      {option.label}
                      {currentFilter === option.value && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Click outside handler */}
      {(showSortMenu || showFilterMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSortMenu(false);
            setShowFilterMenu(false);
          }}
        />
      )}
    </div>
  );
};

