'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GlobalSearch } from './GlobalSearch';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { motion } from 'framer-motion';
import { Search, Menu, X, Home, Box, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { DataManager } from './DataManager';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);

  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return null; // Landing page has its own nav
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/rooms', label: 'Rooms', icon: Box },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/traxlio-icon.svg"
                alt="Traxlio"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Traxlio</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-8 relative z-50">
              <GlobalSearch placeholder="Search boxes & items..." />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDataManagerOpen(true)}
                className="hidden sm:flex"
                title="Data Management"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Search Button - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchModalOpen(true)}
                className="md:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 py-4"
            >
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      pathname === link.href || pathname.startsWith(link.href + '/')
                        ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsDataManagerOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                >
                  <Settings className="h-5 w-5" />
                  Data Management
                </button>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Mobile Search Modal */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title="Search"
        size="lg"
      >
        <GlobalSearch
          autoFocus
          placeholder="Search boxes & items..."
          onResultClick={() => setIsSearchModalOpen(false)}
        />
      </Modal>

      {/* Data Manager Modal */}
      <DataManager
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
      />
    </>
  );
};


