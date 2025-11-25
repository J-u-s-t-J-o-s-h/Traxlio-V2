'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { GlobalSearch } from './GlobalSearch';

export const SearchModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="lg"
      showCloseButton={false}
    >
      <GlobalSearch
        autoFocus
        placeholder="Search boxes & items..."
        onResultClick={() => setIsOpen(false)}
      />
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Esc</kbd> to close
        </p>
      </div>
    </Modal>
  );
};


