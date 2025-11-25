'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Box, Package, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'box' | 'item';
  id: string;
  name: string;
  description?: string;
  parentName?: string;
  parentId?: string;
  tags?: string[];
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onResultClick?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className,
  placeholder = 'Search boxes and items...',
  autoFocus = false,
  onResultClick,
}) => {
  const router = useRouter();
  const { boxes, items, getRoom, getBox } = useInventory();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchLower = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search boxes
    boxes.forEach((box) => {
      const room = getRoom(box.roomId);
      if (
        box.name.toLowerCase().includes(searchLower) ||
        box.description?.toLowerCase().includes(searchLower)
      ) {
        searchResults.push({
          type: 'box',
          id: box.id,
          name: box.name,
          description: box.description,
          parentName: room?.name,
          parentId: room?.id,
        });
      }
    });

    // Search items
    items.forEach((item) => {
      const box = getBox(item.boxId);
      const room = box ? getRoom(box.roomId) : null;
      if (
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        item.notes?.toLowerCase().includes(searchLower)
      ) {
        searchResults.push({
          type: 'item',
          id: item.id,
          name: item.name,
          description: item.description,
          parentName: box?.name,
          parentId: box?.id,
          tags: item.tags,
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setIsOpen(true); // Always show dropdown when searching (even for "no results")
    setSelectedIndex(0);
  }, [query, boxes, items, getRoom, getBox]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'box') {
      router.push(`/boxes/${result.id}`);
    } else {
      router.push(`/boxes/${result.parentId}`);
    }
    setQuery('');
    setIsOpen(false);
    onResultClick?.();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="text-emerald-400 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full h-12 pl-10 pr-10 rounded-xl border text-base',
            'bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
            'transition-all duration-200'
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-500 px-2">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    'w-full px-4 py-3 flex items-start gap-3 text-left transition-colors',
                    selectedIndex === index
                      ? 'bg-slate-100 dark:bg-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      result.type === 'box'
                        ? 'bg-emerald-500/20'
                        : 'bg-cyan-500/20'
                    )}
                  >
                    {result.type === 'box' ? (
                      <Box className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Package className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white font-medium truncate">
                      {highlightMatch(result.name, query)}
                    </p>
                    {result.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {highlightMatch(result.description, query)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {result.type === 'box' ? 'Box' : 'Item'}
                      </span>
                      {result.parentName && (
                        <>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-500">
                            in {result.parentName}
                          </span>
                        </>
                      )}
                    </div>
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
                              tag.toLowerCase().includes(query.toLowerCase()) &&
                                'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                        {result.tags.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{result.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 flex-shrink-0 mt-1" />
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 px-2">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">↑</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">↓</kbd> to navigate,{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">Enter</kbd> to select
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && query.length >= 2 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl p-6 text-center"
          >
            <Package className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">No results found for "{query}"</p>
            <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


